package com.campusai.controller;

import com.campusai.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    public static class ChatRequest {
        private Long userId;
        private String query;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
    }

    @PostMapping("/query")
    public ResponseEntity<?> askChatbot(@RequestBody ChatRequest request) {
        ChatbotService.ChatResponse response = chatbotService.processQuery(request.getUserId(), request.getQuery());
        return ResponseEntity.ok(response);
    }
}
