package com.cognify.repository;

import com.cognify.entity.DoubtSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoubtSolutionRepository extends JpaRepository<DoubtSolution, Long> {
    List<DoubtSolution> findByDoubtIdOrderByCreatedAtAsc(Long doubtId);

    DoubtSolution findByDoubtIdAndIsAcceptedTrue(Long doubtId);

    long countBySolverId(Long solverId);

    void deleteByDoubtId(Long doubtId);
}
