package com.travelnest.backend.dto.request;

import lombok.Data;

@Data
public class ChatMessage {
    private String message;
    private String sessionId; // future use — abhi optional
}