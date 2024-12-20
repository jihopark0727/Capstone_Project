package com.application.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class MediaTextResponse {

    @JsonProperty("segments")
    private List<Map<String, Object>> segments;

    public List<Map<String, Object>> getSegments() {
        return segments;
    }

    public void setSegments(List<Map<String, Object>> segments) {
        this.segments = segments;
    }
}
