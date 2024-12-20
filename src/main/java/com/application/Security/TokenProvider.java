package com.application.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.*;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;

import java.time.Instant;
import java.util.Date;
import java.util.logging.Logger;

@Service
public class TokenProvider {

    private static final Logger logger = Logger.getLogger(TokenProvider.class.getName());

    private static final String securityKey = "mySuperSecretKey0727072707270727072707270727SuperSecureExtraKey";
    private static final int DEFAULT_DURATION = 3600; // 기본 만료 시간 (1시간)

    // JWT 생성 메서드 (사용자 정의 만료 시간)
    public String createJwt(String email, int duration) {
        return Jwt(email, duration);
    }

    // JWT 생성 메서드 (기본 만료 시간)
    public String createJwt(String email) {
        return Jwt(email, DEFAULT_DURATION);
    }

    // JWT 토큰 생성 로직
    private String Jwt(String email, int duration) {
        try {
            Instant now = Instant.now();
            Instant exprTime = now.plusSeconds(duration);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(email)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(exprTime))
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );

            JWSSigner signer = new MACSigner(securityKey.getBytes());
            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (JOSEException e) {
            logger.severe("Error creating JWT: " + e.getMessage());
            return null;
        }
    }

    // JWT 검증 메서드
    public String validateJwt(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(securityKey.getBytes());
            if (signedJWT.verify(verifier)) {
                return signedJWT.getJWTClaimsSet().getSubject();
            } else {
                logger.warning("Invalid JWT signature.");
                return null;
            }
        } catch (Exception e) {
            logger.severe("Error validating JWT: " + e.getMessage());
            return null;
        }
    }
}
