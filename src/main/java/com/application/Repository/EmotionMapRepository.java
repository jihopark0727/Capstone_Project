package com.application.Repository;

import com.application.Entity.Client;
import com.application.Entity.EmotionMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmotionMapRepository extends JpaRepository<EmotionMap, Long> {
    Optional<EmotionMap> findByClient(Client client);
    List<EmotionMap> findByClient_Id(Long clientId);
}
