package com.cognify.repository;

import com.cognify.entity.SolutionLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SolutionLikeRepository extends JpaRepository<SolutionLike, Long> {

    /**
     * Check if a user has already liked a solution.
     */
    boolean existsBySolutionIdAndUserId(Long solutionId, Long userId);

    /**
     * Find a like by solution and user.
     */
    Optional<SolutionLike> findBySolutionIdAndUserId(Long solutionId, Long userId);

    /**
     * Count likes for a solution.
     */
    long countBySolutionId(Long solutionId);
}
