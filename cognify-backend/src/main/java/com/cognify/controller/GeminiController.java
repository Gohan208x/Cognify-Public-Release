package com.cognify.controller;

import com.cognify.dto.GeminiRequest;
import com.cognify.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Detect subject from filename
     */
    @PostMapping("/detect-subject")
    public ResponseEntity<Map<String, String>> detectSubject(@RequestBody Map<String, String> request) {
        String filename = request.get("filename");
        String subject = geminiService.detectSubjectFromFilename(filename);
        return ResponseEntity.ok(Map.of("subject", subject));
    }

    /**
     * Generate smart study notes
     */
    @PostMapping("/notes")
    public ResponseEntity<Map<String, String>> generateNotes(@RequestBody GeminiRequest request) {
        String notes = geminiService.generateSmartNotes(
                request.getTopic(),
                request.getContent(),
                request.getPyqContent());
        return ResponseEntity.ok(Map.of("notes", notes));
    }

    /**
     * Get motivation quote
     */
    @GetMapping("/motivation")
    public ResponseEntity<Map<String, String>> getMotivation() {
        String quote = geminiService.getMotivationQuote();
        return ResponseEntity.ok(Map.of("quote", quote));
    }

    /**
     * Generate flashcards from content
     */
    @PostMapping("/flashcards")
    public ResponseEntity<String> generateFlashcards(@RequestBody GeminiRequest request) {
        String flashcards = geminiService.generateFlashcardsJSON(
                request.getTopic(),
                request.getContent());
        return ResponseEntity.ok(flashcards);
    }

    /**
     * Generate syllabus breakdown for panic mode
     */
    @PostMapping("/syllabus-breakdown")
    public ResponseEntity<String> generateSyllabusBreakdown(@RequestBody GeminiRequest request) {
        String breakdown = geminiService.generateSyllabusBreakdown(
                request.getTopic(),
                request.getContent());
        return ResponseEntity.ok(breakdown);
    }

    /**
     * Generate panic mode content (notes, quiz, flashcards)
     */
    @PostMapping("/panic-content")
    public ResponseEntity<String> generatePanicContent(@RequestBody GeminiRequest request) {
        String content = geminiService.generatePanicContent(
                request.getModuleTitle(),
                request.getSyllabusContext());
        return ResponseEntity.ok(content);
    }

    /**
     * Generate module insight from quiz results
     */
    @PostMapping("/module-insight")
    public ResponseEntity<Map<String, String>> generateModuleInsight(@RequestBody GeminiRequest request) {
        String insight = geminiService.generateModuleInsight(
                request.getModuleTitle(),
                request.getQuizScore(),
                request.getTotalQuestions());
        return ResponseEntity.ok(Map.of("insight", insight));
    }

    /**
     * Generate AI study schedule
     */
    @PostMapping("/schedule")
    public ResponseEntity<String> generateSchedule(@RequestBody GeminiRequest request) {
        String schedule = geminiService.generateStudySchedule(
                request.getSubjects(),
                request.getUserContext());
        return ResponseEntity.ok(schedule);
    }

    /**
     * Solve a student doubt using AI
     */
    @PostMapping("/solve-doubt")
    public ResponseEntity<Map<String, String>> solveDoubt(@RequestBody GeminiRequest request) {
        String solution = geminiService.solveDoubt(
                request.getTopic(),
                request.getContent(),
                request.getImageUrl());
        return ResponseEntity.ok(Map.of("solution", solution));
    }

    /**
     * Get current model status (for debugging)
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getModelStatus() {
        return ResponseEntity.ok(geminiService.getModelStatus());
    }
}
