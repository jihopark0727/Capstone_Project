package com.application.Repository;

import com.application.Entity.Counselor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Counselor, Long> {

    // 이메일로 Counselor 찾기
//    Optional<Counselor> findByEmail(String email);

    // 이메일이 존재하는지 확인 (중복 회원가입 방지 용도)

}
