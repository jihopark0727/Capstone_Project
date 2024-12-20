package com.application.Repository;

import com.application.Entity.SessionRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRecordingRepository extends JpaRepository<SessionRecording, Long> {
}
