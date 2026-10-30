package com.cognify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Smart Gemini AI Service with automatic model rotation.
 * 
 * When a model hits its quota limit, the service automatically
 * switches to the next available model. If all models are
 * exhausted, it returns a friendly error message.
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.models.primary}")
    private String primaryModel;

    @Value("${gemini.models.secondary}")
    private String secondaryModel;

    @Value("${gemini.models.tertiary}")
    private String tertiaryModel;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // Track which models are currently rate-limited
    private final Map<String, LocalDateTime> rateLimitedModels = new ConcurrentHashMap<>();

    // Current model in use
    private volatile String currentModel;

    public GeminiService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get the current active model, rotating if needed
     */
    private String getActiveModel() {
        List<String> models = Arrays.asList(primaryModel, secondaryModel, tertiaryModel);
        LocalDateTime now = LocalDateTime.now();

        // Clean up expired rate limits (reset after 1 minute for temporary spikes like
        // 503)
        rateLimitedModels.entrySet().removeIf(entry -> entry.getValue().plusMinutes(1).isBefore(now));

        // Find first available model
        for (String model : models) {
            if (!rateLimitedModels.containsKey(model)) {
                if (currentModel == null || !currentModel.equals(model)) {
                    currentModel = model;
                    log.info("🔄 Switching to model: {}", model);
                }
                return model;
            }
        }

        // All models are rate limited. Reset the limits and try the primary model again
        // instead of giving up completely for an hour.
        log.warn("⚠️ All models rate limited. Resetting limits and retrying primary...");
        rateLimitedModels.clear();
        currentModel = primaryModel;
        return primaryModel;
    }

    /**
     * Mark a model as rate limited
     */
    private void markModelRateLimited(String model) {
        rateLimitedModels.put(model, LocalDateTime.now());
        log.warn("⚠️ Model {} hit quota limit. Rotating to next model.", model);
    }

    /**
     * Make a request to Gemini API with automatic retry on different models
     */
    private String callGeminiAPI(String prompt, boolean jsonResponse) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.toLowerCase().contains("your_")) {
            log.warn("Gemini API key is not configured.");
            return jsonResponse ? "[]"
                    : "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable to enable AI features.";
        }

        int maxRetries = 6;

        for (int attempt = 0; attempt < maxRetries; attempt++) {
            String model = getActiveModel();

            if (model == null) {
                log.error("❌ All Gemini models have exceeded their daily quota.");
                return jsonResponse ? "[]"
                        : "## ⚠️ Daily API Quota Exceeded\n\n" +
                                "All AI models have reached their daily limit. Please try again later.\n\n" +
                                "The quota typically resets at midnight Pacific Time.";
            }

            try {
                String response = makeAPICall(model, prompt, jsonResponse);
                return response;
            } catch (WebClientResponseException.TooManyRequests e) {
                // 429 Too Many Requests - Quota exceeded
                markModelRateLimited(model);
                log.warn("Rate limit hit for model: {}. Attempt {}/{}", model, attempt + 1, maxRetries);
            } catch (WebClientResponseException e) {
                if (e.getStatusCode().value() == 429 ||
                        e.getStatusCode().value() == 503 ||
                        e.getStatusCode().value() == 404 ||
                        e.getResponseBodyAsString().contains("RESOURCE_EXHAUSTED") ||
                        e.getResponseBodyAsString().contains("quota") ||
                        e.getResponseBodyAsString().contains("high demand")) {
                    markModelRateLimited(model);
                    log.warn("Model {} unavailable (quota or high demand). Rotating...", model);
                } else {
                    log.error("Gemini API Error: {} - Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
                    // Return the error so it shows up in the UI instead of crashing the request
                    // with a 403
                    return jsonResponse ? "[]"
                            : "## Gemini API Error\n\nStatus: " + e.getStatusCode() + "\nDetails: "
                                    + e.getResponseBodyAsString();
                }
            } catch (Exception e) {
                log.error("Unexpected error calling Gemini API: {}", e.getMessage());
                // Check if it's a quota error in the message
                if (e.getMessage() != null &&
                        (e.getMessage().contains("quota") || e.getMessage().contains("429"))) {
                    markModelRateLimited(model);
                } else {
                    return jsonResponse ? "[]" : "## Error\n\nFailed to generate content. Please try again.";
                }
            }

            // Small delay before retrying the next model (helps with 503 high demand
            // spikes)
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }

        return jsonResponse ? "[]"
                : "## ⚠️ Service Unavailable\n\nThe AI service is currently experiencing extreme high demand. Please try again in a few minutes.";
    }

    private String makeAPICall(String model, String prompt, boolean jsonResponse) {
        String url = "/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        // Add generation config for JSON responses
        if (jsonResponse) {
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", genConfig);
        }

        String response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Parse the response to extract text
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode text = candidates.get(0).path("content").path("parts").get(0).path("text");
                return text.asText();
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
        }

        return jsonResponse ? "[]" : "";
    }

    // ============== PUBLIC API METHODS ==============

    /**
     * Detect subject from filename
     */
    public String detectSubjectFromFilename(String filename) {
        String prompt = String.format(
                "Analyze this filename: \"%s\". " +
                        "Return ONLY the academic subject name (e.g., History, Physics, Math, Computer Science). " +
                        "If unsure, return \"General\". Do not add punctuation.",
                filename);

        String result = callGeminiAPI(prompt, false);
        return result.isEmpty() ? "Uncategorized" : result.trim();
    }

    /**
     * Generate smart study notes
     */
    public String generateSmartNotes(String topic, String content, String pyqContent) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Role: Expert Academic Tutor.\n");
        prompt.append("Task: Create comprehensive, exam-friendly study notes for the topic: \"").append(topic)
                .append("\".\n\n");
        prompt.append("Source Material to Summarize:\n\"")
                .append(content.substring(0, Math.min(content.length(), 2000))).append("...\"\n\n");
        prompt.append("Formatting Rules:\n");
        prompt.append("- Use Markdown.\n");
        prompt.append("- Use H1 (#) for the main title.\n");
        prompt.append("- Use H2 (##) for Main Sections.\n");
        prompt.append("- Use H3 (###) for Subsections.\n");
        prompt.append("- Use **Bold** for key definitions and terms.\n");
        prompt.append("- Use > Blockquotes for \"Pro Tips\" or \"Exam Alerts\".\n");
        prompt.append("- Use Bullet points for lists.\n");

        if (pyqContent != null && !pyqContent.isEmpty()) {
            prompt.append("\nCRITICAL INSTRUCTION - PYQ ANALYSIS:\n");
            prompt.append(
                    "The user has provided the following text containing Previous Year Questions (PYQs):\n\"\"\"");
            prompt.append(pyqContent.substring(0, Math.min(pyqContent.length(), 3000)));
            prompt.append("\"\"\"\n");
            prompt.append("1. Analyze the PYQ text to identify frequently occurring concepts.\n");
            prompt.append("2. Mark exam-critical sections with \"🔥 **(High Yield)**\".\n");
        }

        return callGeminiAPI(prompt.toString(), false);
    }

    /**
     * Get motivation quote
     */
    public String getMotivationQuote() {
        String prompt = "Give me a very short, punchy motivational quote for a student studying hard. Add one emoji. Max 15 words.";
        String result = callGeminiAPI(prompt, false);
        return result.isEmpty() ? "Keep pushing, success is near! 🚀" : result.trim();
    }

    /**
     * Generate flashcards as JSON
     */
    public String generateFlashcardsJSON(String topic, String content) {
        String prompt = String.format(
                "You are a Teacher API.\n" +
                        "Generate 6-10 high-quality flashcards based on the topic: \"%s\" and the content provided below.\n\n"
                        +
                        "Content: \"%s...\"\n\n" +
                        "RETURN FORMAT:\n" +
                        "You must strictly return a valid JSON array. Do not use Markdown code blocks.\n" +
                        "Format: [{\"front\": \"Question\", \"back\": \"Short Answer\"}, ...]",
                topic,
                content.substring(0, Math.min(content.length(), 2000)));

        return callGeminiAPI(prompt, true);
    }

    /**
     * Generate syllabus breakdown for panic mode
     */
    public String generateSyllabusBreakdown(String courseName, String syllabus) {
        String prompt = String.format(
                "You are an Exam Preparation Expert.\n" +
                        "The user is in \"Panic Mode\" and needs to study for \"%s\" quickly.\n\n" +
                        "Syllabus provided:\n\"%s\"\n\n" +
                        "Task: Break this syllabus down into 3 to 6 distinct, logical \"Study Parts\" or \"Modules\".\n\n"
                        +
                        "Return strictly a JSON array of strings. Example: [\"Part 1: Basic Concepts\", \"Part 2: Advanced Logic\", ...]",
                courseName,
                syllabus.substring(0, Math.min(syllabus.length(), 4000)));

        return callGeminiAPI(prompt, true);
    }

    /**
     * Generate panic mode content (notes, quiz, flashcards)
     */
    public String generatePanicContent(String moduleTitle, String syllabusContext) {
        String prompt = String.format(
                "You are an Exam Cramming Expert.\n" +
                        "Context: User is studying \"%s\" from the syllabus: \"%s...\".\n\n" +
                        "Task: Generate a comprehensive study package strictly in the following JSON format:\n" +
                        "{\n" +
                        "  \"notesMarkdown\": \"Detailed revision notes in Markdown. Use H1 for title, H2 for main points. Emphasize keywords with bold. Use blockquotes for quick tips.\",\n"
                        +
                        "  \"quiz\": [\n" +
                        "     { \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": \"The full string of the correct option\" },\n"
                        +
                        "     { ... 3-4 questions ... }\n" +
                        "  ],\n" +
                        "  \"flashcards\": [\n" +
                        "     { \"front\": \"Concept/Term\", \"back\": \"Definition/Answer\" },\n" +
                        "     { ... 3-4 cards ... }\n" +
                        "  ]\n" +
                        "}",
                moduleTitle,
                syllabusContext.substring(0, Math.min(syllabusContext.length(), 500)));

        return callGeminiAPI(prompt, true);
    }

    /**
     * Generate module insight based on quiz results
     */
    public String generateModuleInsight(String moduleTitle, int quizScore, int totalQuestions) {
        String prompt = String.format(
                "The student just finished studying \"%s\" in Panic Mode.\n" +
                        "They scored %d out of %d on the quiz.\n\n" +
                        "Provide a brief, 2-3 sentence analysis.\n" +
                        "If score is low (< 50%%), tell them what to focus on generally.\n" +
                        "If score is high, tell them they are ready to move on.\n" +
                        "Do NOT use Markdown. Keep it encouraging but realistic.",
                moduleTitle, quizScore, totalQuestions);

        String result = callGeminiAPI(prompt, false);
        return result.isEmpty() ? "Module complete. Ready for the next one!" : result;
    }

    /**
     * Generate AI study schedule
     */
    public String generateStudySchedule(String subjects, String userContext) {
        String prompt = String.format(
                "Role: AI Study Planner.\n" +
                        "Task: Create a 1-week balanced study schedule.\n" +
                        "Subjects: \"%s\".\n\n" +
                        "User Analysis (Important):\n\"%s\"\n\n" +
                        "Constraint:\n" +
                        "- If the user has a preferred study time (e.g., Evening/Morning), schedule the most difficult/intensive subjects then.\n"
                        +
                        "- Include short breaks.\n" +
                        "- Distribute subjects evenly across Monday to Sunday.\n\n" +
                        "Output Format:\n" +
                        "Strict JSON Array of objects:\n" +
                        "[\n" +
                        "  { \"day\": \"Monday\", \"time\": \"09:00\", \"title\": \"Study [Subject]\", \"subject\": \"[Subject]\" },\n"
                        +
                        "  ...\n" +
                        "]\n" +
                        "(Generate 2-3 events per day).",
                subjects, userContext);

        return callGeminiAPI(prompt, true);
    }

    /**
     * Solve a student doubt using AI
     * Returns a comprehensive, well-formatted solution
     */
    public String solveDoubt(String course, String question, String imageUrl) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Role: Expert Academic Tutor and Problem Solver.\n\n");
        prompt.append("Task: Provide a comprehensive, clear, and helpful solution to this student's doubt.\n\n");
        prompt.append("Subject/Course: ").append(course).append("\n");
        prompt.append("Student's Question: ").append(question).append("\n\n");

        if (imageUrl != null && !imageUrl.isEmpty()) {
            prompt.append("Note: The student has attached an image at: ").append(imageUrl).append("\n");
            prompt.append(
                    "Please consider that the image may contain additional context, equations, or diagrams related to the question.\n\n");
        }

        prompt.append("Instructions for your response:\n");
        prompt.append("1. Start with a brief understanding of the problem\n");
        prompt.append("2. Provide a step-by-step solution or explanation\n");
        prompt.append("3. If it's a math/science problem, show all work clearly\n");
        prompt.append("4. Highlight key concepts and formulas used\n");
        prompt.append("5. End with a summary or final answer if applicable\n\n");
        prompt.append("Format your response using plain text with:\n");
        prompt.append("- Use ** for bold important terms\n");
        prompt.append("- Use numbered steps where appropriate\n");
        prompt.append("- Keep explanations clear and student-friendly\n");
        prompt.append("- Be encouraging but accurate\n");

        String result = callGeminiAPI(prompt.toString(), false);
        return result.isEmpty()
                ? "I apologize, but I couldn't generate a solution at this time. Please try again or ask a human expert."
                : result;
    }

    /**
     * Get current model status (for debugging/monitoring)
     */
    public Map<String, Object> getModelStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("currentModel", currentModel);
        status.put("rateLimitedModels", new ArrayList<>(rateLimitedModels.keySet()));
        status.put("availableModels", Arrays.asList(primaryModel, secondaryModel, tertiaryModel));
        return status;
    }
}
