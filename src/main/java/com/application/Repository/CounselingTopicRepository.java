package com.application.Repository;

import com.application.Entity.CounselingTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CounselingTopicRepository extends JpaRepository<CounselingTopic, Long> {

    // 주제 이름으로 상담 주제 조회
    Optional<CounselingTopic> findByTopicName(String topicName);
}
