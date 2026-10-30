package com.cognify.repository;

import com.cognify.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findAllByOrderByDisplayOrderAsc();

    Channel findByType(String type);
}
