package com.cognify.controller;

import com.cognify.dto.ResourceDto.*;
import com.cognify.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * REST Controller for Resource Hub auto-discovery.
 * Provides endpoints for listing subjects, courses, and serving resource files.
 */
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Value("${resources.path:../resources}")
    private String resourcesPath;

    /**
     * Get all resources including available course filters and subjects.
     */
    @GetMapping
    public ResponseEntity<ResourcesResponse> getAllResources() {
        ResourcesResponse response = resourceService.getAllResources();
        return ResponseEntity.ok(response);
    }

    /**
     * Get available course filters only.
     */
    @GetMapping("/courses")
    public ResponseEntity<List<String>> getAvailableCourses() {
        List<String> courses = resourceService.getAvailableCourses();
        return ResponseEntity.ok(courses);
    }

    /**
     * Get a specific subject by name.
     */
    @GetMapping("/subject/{name}")
    public ResponseEntity<SubjectDto> getSubject(@PathVariable String name) {
        SubjectDto subject = resourceService.getSubject(name);
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subject);
    }

    /**
     * Serve a file from a subject's Notes or PYQ folder.
     * URL format: /api/resources/file/{subject}/{folder}/{filename}
     * Example: /api/resources/file/Java/Notes/Java.pdf
     */
    @GetMapping("/file/{subject}/{folder}/{filename:.+}")
    public ResponseEntity<Resource> getResourceFile(
            @PathVariable String subject,
            @PathVariable String folder,
            @PathVariable String filename) {

        try {
            Path filePath = Paths.get(resourcesPath, subject, folder, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/pdf";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header("X-Frame-Options", "ALLOWALL")
                        .header("Content-Security-Policy", "frame-ancestors *")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
