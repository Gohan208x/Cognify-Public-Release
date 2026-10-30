package com.cognify.repository;

import com.cognify.entity.ChannelMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelMessageRepository extends JpaRepository<ChannelMessage, Long> {
    Page<ChannelMessage> findByChannelIdOrderByCreatedAtDesc(Long channelId, Pageable pageable);

    List<ChannelMessage> findTop50ByChannelIdOrderByCreatedAtDesc(Long channelId);

    long countByAuthorId(Long authorId);
}
