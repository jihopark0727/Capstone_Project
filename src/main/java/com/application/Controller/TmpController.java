package com.application.Controller;

import com.application.Dto.TmpResponse;
import com.application.Service.TmpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor

public class TmpController {
    private final TmpService tmpService;

    @PostMapping("/sound-to-text")
    public ResponseEntity<TmpResponse> getTextByFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(tmpService.getTextByFile(file));
    }
}