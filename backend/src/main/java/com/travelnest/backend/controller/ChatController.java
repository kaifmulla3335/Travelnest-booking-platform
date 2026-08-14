package com.travelnest.backend.controller;

import com.travelnest.backend.dto.request.ChatMessage;
import com.travelnest.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // Public endpoint — no login needed to use the chatbot
    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatMessage chatMessage) {
        String reply = chatService.chat(chatMessage.getMessage());
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}