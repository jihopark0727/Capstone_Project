package com.application.Dto;

import java.util.List;
import java.util.Map;

public class TmpResponse {
    private List<Map<String, String>> response;

    public TmpResponse(List<Map<String, String>> response) {
        this.response = response;
    }

    // Getter and Setter 추가
    public List<Map<String, String>> getResponse() {
        return response;
    }

    public void setResponse(List<Map<String, String>> response) {
        this.response = response;
    }
}
