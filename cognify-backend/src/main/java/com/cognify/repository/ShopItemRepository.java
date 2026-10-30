package com.cognify.repository;

import com.cognify.entity.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopItemRepository extends JpaRepository<ShopItem, Long> {

    List<ShopItem> findByType(String type);

    List<ShopItem> findAllByOrderByCostAsc();
}
