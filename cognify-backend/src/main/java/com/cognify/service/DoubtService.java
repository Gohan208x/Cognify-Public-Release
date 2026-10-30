package com.cognify.service;

import com.cognify.dto.DoubtPanelDto;
import com.cognify.dto.DoubtPanelDto.*;
import com.cognify.entity.*;
import com.cognify.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for doubt operations including creating, solving, and rewarding.
 */
@Service
public class DoubtService {

    @Autowired
    private DoubtRepository doubtRepository;

    @Autowired
    private DoubtSolutionRepository solutionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SolutionLikeRepository solutionLikeRepository;

    @Autowired
    private UserService userService;

    /**
     * Get doubts with optional filtering.
     */
    public List<DoubtDto> getDoubts(String course, String status, int page, int size) {
        if (course != null && status != null) {
            return doubtRepository.findByCourseAndStatusOrderByCreatedAtDesc(course, status, PageRequest.of(page, size))
                    .stream().map(this::toDoubtDto).collect(Collectors.toList());
        } else if (course != null) {
            return doubtRepository.findByCourseOrderByCreatedAtDesc(course, PageRequest.of(page, size))
                    .stream().map(this::toDoubtDto).collect(Collectors.toList());
        } else if (status != null) {
            return doubtRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size))
                    .stream().map(this::toDoubtDto).collect(Collectors.toList());
        }
        return doubtRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .stream().map(this::toDoubtDto).collect(Collectors.toList());
    }

    /**
     * Get a single doubt by ID.
     */
    public DoubtDto getDoubt(Long id) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));
        return toDoubtDto(doubt);
    }

    /**
     * Get doubts asked by a user.
     */
    public List<DoubtDto> getMyDoubts(Long userId) {
        return doubtRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDoubtDto)
                .collect(Collectors.toList());
    }

    /**
     * Get doubts solved by a user.
     */
    public List<DoubtDto> getMySolvedDoubts(Long userId) {
        return doubtRepository.findBySolverIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDoubtDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new doubt.
     */
    @Transactional
    public DoubtDto createDoubt(Long authorId, CreateDoubtRequest request) {
        Doubt doubt = new Doubt();
        doubt.setAuthorId(authorId);
        doubt.setQuestion(request.question());
        doubt.setImageUrl(request.imageUrl());
        doubt.setCourse(request.course());
        doubt.setStatus("OPEN");

        doubt = doubtRepository.save(doubt);

        // Award XP for asking a doubt (encourages community engagement)
        userService.addRewards(authorId, 5, 2); // 5 XP, 2 coins

        return toDoubtDto(doubt);
    }

    /**
     * Delete a doubt (only by author, only if OPEN).
     */
    @Transactional
    public void deleteDoubt(Long doubtId, Long userId) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        // Check if user is author or admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = Boolean.TRUE.equals(user.getIsAdmin());

        // Only author or admin can delete
        if (!doubt.getAuthorId().equals(userId) && !isAdmin) {
            throw new RuntimeException("You can only delete your own doubts");
        }

        // Can only delete OPEN doubts (unless admin)
        if (!"OPEN".equals(doubt.getStatus()) && !isAdmin) {
            throw new RuntimeException("Cannot delete a solved doubt");
        }

        // Delete all solutions first
        solutionRepository.deleteByDoubtId(doubtId);

        // Delete the doubt
        doubtRepository.delete(doubt);
    }

    /**
     * Submit a solution to a doubt.
     */
    @Transactional
    public DoubtSolutionDto submitSolution(Long doubtId, Long solverId, SubmitSolutionRequest request) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        // Check if this is an AI solution (identified by marker)
        boolean isAiSolution = request.explanation() != null &&
                request.explanation().startsWith("🤖 **AI Solution**");

        // Can't solve your own doubt (unless it's an AI solution)
        if (doubt.getAuthorId().equals(solverId) && !isAiSolution) {
            throw new RuntimeException("You cannot solve your own doubt");
        }

        DoubtSolution solution = new DoubtSolution();
        solution.setDoubtId(doubtId);
        solution.setSolverId(solverId);
        solution.setExplanation(request.explanation());
        solution.setImageUrl(request.imageUrl());

        solution = solutionRepository.save(solution);

        // Award XP for submitting a solution (rewards helping others)
        // Skip rewards for AI solutions (user is getting help, not giving it)
        if (!isAiSolution) {
            userService.addRewards(solverId, 10, 5); // 10 XP, 5 coins
        }

        return toSolutionDto(solution);
    }

    /**
     * Accept a solution (by doubt author) and reward the solver.
     */
    @Transactional
    public DoubtDto acceptSolution(Long doubtId, Long solutionId, Long requesterId, AcceptSolutionRequest request) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        // Only author can accept solution
        if (!doubt.getAuthorId().equals(requesterId)) {
            throw new RuntimeException("Only the doubt author can accept a solution");
        }

        DoubtSolution solution = solutionRepository.findById(solutionId)
                .orElseThrow(() -> new RuntimeException("Solution not found"));

        // Mark solution as accepted
        solution.setIsAccepted(true);
        solutionRepository.save(solution);

        // Mark doubt as solved
        doubt.setStatus("SOLVED");
        doubt.setSolverId(solution.getSolverId());
        doubt.setSolvedAt(LocalDateTime.now());
        doubt.setCoinsRewarded(request.coinsReward());
        doubtRepository.save(doubt);

        // Transfer coins from author to solver
        User author = userRepository.findById(doubt.getAuthorId()).orElseThrow();
        User solver = userRepository.findById(solution.getSolverId()).orElseThrow();

        int reward = request.coinsReward() != null ? request.coinsReward() : 0;
        if (reward > 0 && author.getCoins() >= reward) {
            author.setCoins(author.getCoins() - reward);
            solver.setCoins(solver.getCoins() + reward);
            userRepository.save(author);
        }

        // Increment solver's doubts solved count
        solver.incrementDoubtsSolved();

        // Check for new titles
        checkAndAwardTitles(solver);

        userRepository.save(solver);

        return toDoubtDto(doubt);
    }

    /**
     * Like or unlike a solution (toggle).
     * Each user can only like once per solution.
     */
    @Transactional
    public DoubtSolutionDto likeSolution(Long solutionId, Long userId) {
        DoubtSolution solution = solutionRepository.findById(solutionId)
                .orElseThrow(() -> new RuntimeException("Solution not found"));

        // Can't like own solution
        if (solution.getSolverId().equals(userId)) {
            throw new RuntimeException("You cannot like your own solution");
        }

        // Check if user already liked this solution
        if (solutionLikeRepository.existsBySolutionIdAndUserId(solutionId, userId)) {
            // Unlike - remove the like
            solutionLikeRepository.findBySolutionIdAndUserId(solutionId, userId)
                    .ifPresent(solutionLikeRepository::delete);
            solution.setLikes(Math.max(0, solution.getLikes() - 1));
        } else {
            // Like - add new like record
            SolutionLike like = new SolutionLike();
            like.setSolutionId(solutionId);
            like.setUserId(userId);
            solutionLikeRepository.save(like);
            solution.setLikes(solution.getLikes() + 1);
        }

        solutionRepository.save(solution);
        return toSolutionDto(solution);
    }

    /**
     * Check and award doubt solver titles based on doubts solved count.
     */
    private void checkAndAwardTitles(User solver) {
        int solved = solver.getDoubtsSolved() != null ? solver.getDoubtsSolved() : 0;

        for (DoubtTitleDto title : DoubtPanelDto.DOUBT_TITLES) {
            if (solved >= title.requiredSolves()) {
                if (!solver.getEarnedDoubtTitlesList().contains(title.id())) {
                    solver.addEarnedDoubtTitle(title.id());
                    // Auto-equip the new title if none equipped
                    if (solver.getDoubtTitle() == null) {
                        solver.setDoubtTitle(title.id());
                    }
                }
            }
        }
    }

    /**
     * Get user's doubt solving stats and titles.
     */
    public List<DoubtTitleDto> getUserTitles(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<String> earned = user.getEarnedDoubtTitlesList();

        return Arrays.stream(DoubtPanelDto.DOUBT_TITLES)
                .map(t -> new DoubtTitleDto(t.id(), t.name(), t.emoji(), t.requiredSolves(), earned.contains(t.id())))
                .collect(Collectors.toList());
    }

    /**
     * Equip a doubt title.
     */
    @Transactional
    public void equipTitle(Long userId, String titleId) {
        User user = userRepository.findById(userId).orElseThrow();

        if (!user.getEarnedDoubtTitlesList().contains(titleId)) {
            throw new RuntimeException("You haven't earned this title yet");
        }

        user.setDoubtTitle(titleId);
        userRepository.save(user);
    }

    // ============== MAPPING METHODS ==============

    private DoubtDto toDoubtDto(Doubt doubt) {
        User author = userRepository.findById(doubt.getAuthorId()).orElse(null);
        User solver = doubt.getSolverId() != null ? userRepository.findById(doubt.getSolverId()).orElse(null) : null;

        List<DoubtSolutionDto> solutions = solutionRepository.findByDoubtIdOrderByCreatedAtAsc(doubt.getId())
                .stream().map(this::toSolutionDto).collect(Collectors.toList());

        return new DoubtDto(
                doubt.getId(),
                doubt.getAuthorId(),
                author != null ? author.getUsername() : "Unknown",
                author != null ? author.getDisplayName() : null,
                author != null ? author.getAvatar() : "👤",
                author != null ? author.getProfilePictureUrl() : null,
                author != null ? author.getProfileBorder() : null,
                author != null ? author.getProfileTheme() : null,
                doubt.getQuestion(),
                doubt.getImageUrl(),
                doubt.getCourse(),
                doubt.getStatus(),
                doubt.getSolverId(),
                solver != null ? solver.getUsername() : null,
                solver != null ? solver.getDisplayName() : null,
                solver != null ? solver.getAvatar() : null,
                solver != null ? solver.getProfilePictureUrl() : null,
                solver != null ? solver.getDoubtTitle() : null,
                doubt.getCoinsRewarded(),
                doubt.getCreatedAt(),
                doubt.getSolvedAt(),
                solutions);
    }

    private DoubtSolutionDto toSolutionDto(DoubtSolution solution) {
        User solver = userRepository.findById(solution.getSolverId()).orElse(null);

        return new DoubtSolutionDto(
                solution.getId(),
                solution.getDoubtId(),
                solution.getSolverId(),
                solver != null ? solver.getUsername() : "Unknown",
                solver != null ? solver.getDisplayName() : null,
                solver != null ? solver.getAvatar() : "👤",
                solver != null ? solver.getProfilePictureUrl() : null,
                solver != null ? solver.getDoubtTitle() : null,
                solver != null ? solver.getProfileBorder() : null,
                solver != null ? solver.getProfileTheme() : null,
                solution.getExplanation(),
                solution.getImageUrl(),
                solution.getLikes(),
                solution.getIsAccepted(),
                solution.getCreatedAt());
    }
}
