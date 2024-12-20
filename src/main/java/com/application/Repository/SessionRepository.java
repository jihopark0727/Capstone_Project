package com.application.Repository;

import com.application.Entity.Client;
import com.application.Entity.Counselor;
import com.application.Entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    // 특정 Client의 모든 세션을 조회
    List<Session> findByClientId(Long clientId);
    Optional<Session> findByClientIdAndSessionNumber(Long clientId, Integer sessionNumber);
    List<Session> findByCounselor(Counselor counselor);
    List<Session> findByCounselorAndClient(Counselor counselor, Client client);
    void deleteAllByClientId(Long clientId);
}
