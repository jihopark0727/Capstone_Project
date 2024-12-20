package com.application.Repository;

import com.application.Entity.Counselor;
import com.application.Entity.CounselorClient;
import com.application.Entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CounselorClientRepository extends JpaRepository<CounselorClient, Long> {

    List<CounselorClient> findByCounselor(Counselor counselor);
    Optional<CounselorClient> findByClient(Client client);

    Optional<CounselorClient> findByCounselorAndClient(Counselor counselor, Client client);
}
