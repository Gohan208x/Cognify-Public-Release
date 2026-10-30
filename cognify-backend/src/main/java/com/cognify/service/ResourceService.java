package com.cognify.service;

import com.cognify.dto.ResourceDto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Service for scanning the resources folder and providing auto-discovery of
 * subjects.
 * 
 * Expected folder structure:
 * resources/
 * ├── _config/
 * │ └── courses.txt # List of course filters (one per line)
 * ├── {SubjectName}/
 * │ ├── Notes/ # PDF files for notes
 * │ ├── PYQ/ # PDF files for previous year questions
 * │ ├── youtube.txt # YouTube links (format: url|title per line)
 * │ └── tags.txt # Course tags (one per line, e.g., IT, CSE)
 */
@Service
public class ResourceService {

    // Path to resources folder - configurable via environment variable
    // Default: ../resources for local dev, override with "resources" in production
    @Value("${resources.path:../resources}")
    private String resourcesPath;

    private static final String CONFIG_FOLDER = "_config";
    private static final String COURSES_FILE = "courses.txt";
    private static final String TAGS_FILE = "tags.txt";
    private static final String YOUTUBE_FILE = "youtube.txt";
    private static final String NOTES_FOLDER = "Notes";
    private static final String PYQ_FOLDER = "PYQ";

    /**
     * Get all resources including available courses and subjects.
     */
    public ResourcesResponse getAllResources() {
        List<String> courses = getAvailableCourses();
        List<SubjectDto> subjects = getAllSubjects();
        return new ResourcesResponse(courses, subjects);
    }

    /**
     * Get available course filters from _config/courses.txt.
     */
    public List<String> getAvailableCourses() {
        Path coursesFile = Paths.get(resourcesPath, CONFIG_FOLDER, COURSES_FILE);
        return readLinesFromFile(coursesFile);
    }

    /**
     * Get all subjects by scanning the resources folder.
     */
    public List<SubjectDto> getAllSubjects() {
        Path resourcesDir = Paths.get(resourcesPath);

        if (!Files.exists(resourcesDir) || !Files.isDirectory(resourcesDir)) {
            return Collections.emptyList();
        }

        try (Stream<Path> paths = Files.list(resourcesDir)) {
            return paths
                    .filter(Files::isDirectory)
                    .filter(path -> !path.getFileName().toString().startsWith("_")) // Exclude config folders
                    .map(this::buildSubjectDto)
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(SubjectDto::name))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * Get a specific subject by name.
     */
    public SubjectDto getSubject(String name) {
        Path subjectDir = Paths.get(resourcesPath, name);
        if (!Files.exists(subjectDir) || !Files.isDirectory(subjectDir)) {
            return null;
        }
        return buildSubjectDto(subjectDir);
    }

    /**
     * Build a SubjectDto from a subject folder.
     */
    private SubjectDto buildSubjectDto(Path subjectDir) {
        String name = subjectDir.getFileName().toString();

        // Read tags
        List<String> tags = readLinesFromFile(subjectDir.resolve(TAGS_FILE));

        // Read note files
        List<String> noteFiles = listPdfFiles(subjectDir.resolve(NOTES_FOLDER));

        // Read PYQ files
        List<String> pyqFiles = listPdfFiles(subjectDir.resolve(PYQ_FOLDER));

        // Read YouTube links
        List<VideoLink> youtubeLinks = readYoutubeLinks(subjectDir.resolve(YOUTUBE_FILE));

        return new SubjectDto(name, tags, noteFiles, pyqFiles, youtubeLinks);
    }

    /**
     * Read lines from a text file, returning empty list if file doesn't exist.
     */
    private List<String> readLinesFromFile(Path file) {
        if (!Files.exists(file)) {
            return Collections.emptyList();
        }
        try {
            return Files.readAllLines(file).stream()
                    .map(String::trim)
                    .filter(line -> !line.isEmpty())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }

    /**
     * List PDF files in a folder, returning file names only.
     */
    private List<String> listPdfFiles(Path folder) {
        if (!Files.exists(folder) || !Files.isDirectory(folder)) {
            return Collections.emptyList();
        }
        try (Stream<Path> files = Files.list(folder)) {
            return files
                    .filter(Files::isRegularFile)
                    .map(path -> path.getFileName().toString())
                    .filter(name -> name.toLowerCase().endsWith(".pdf"))
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }

    /**
     * Read YouTube links from a file. Format: url|title (one per line).
     */
    private List<VideoLink> readYoutubeLinks(Path file) {
        List<String> lines = readLinesFromFile(file);
        return lines.stream()
                .map(line -> {
                    String[] parts = line.split("\\|", 2);
                    String url = parts[0].trim();
                    String title = parts.length > 1 ? parts[1].trim() : "Untitled Video";
                    return new VideoLink(url, title);
                })
                .collect(Collectors.toList());
    }
}
