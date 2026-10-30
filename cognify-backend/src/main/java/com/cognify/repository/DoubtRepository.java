package com.cognify.repository;

import com.cognify.entity.Doubt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoubtRepository extends JpaRepository<Doubt, Long> {
    Page<Doubt> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Doubt> findByCourseOrderByCreatedAtDesc(String course, Pageable pageable);

    Page<Doubt> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Doubt> findByCourseAndStatusOrderByCreatedAtDesc(String course, String status, Pageable pageable);

    List<Doubt> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    List<Doubt> findBySolverIdOrderByCreatedAtDesc(Long solverId);

    long countBySolverId(Long solverId);
}
