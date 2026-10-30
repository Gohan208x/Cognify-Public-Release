package com.cognify.repository;

import com.cognify.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {

    @Query("SELECT DISTINCT d FROM Deck d LEFT JOIN FETCH d.cards WHERE d.user.id = :userId ORDER BY d.createdAt DESC")
    List<Deck> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT d FROM Deck d LEFT JOIN FETCH d.cards WHERE d.id = :id")
    Deck findByIdWithCards(Long id);

    void deleteByIdAndUserId(Long id, Long userId);
}
