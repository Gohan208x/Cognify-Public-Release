package com.cognify.dto;

import java.util.List;

/**
 * DTOs for the Resource Hub auto-discovery system.
 */
public class ResourceDto {

    /**
     * Represents a YouTube video link with title.
     */
    public record VideoLink(String url, String title) {
    }

    /**
     * Represents a subject/course with its resources.
     */
    public record SubjectDto(
            String name,
            List<String> tags,
            List<String> noteFiles,
            List<String> pyqFiles,
            List<VideoLink> youtubeLinks) {
    }

    /**
     * Response containing all resources and available course filters.
     */
    public record ResourcesResponse(
            List<String> availableCourses,
            List<SubjectDto> subjects) {
    }
}
