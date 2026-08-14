package com.travelnest.backend.service;

import com.travelnest.backend.entity.Package;
import com.travelnest.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final PackageRepository packageRepository;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    public String chat(String userMessage) {
        // ── Step 1: Fetch all packages from DB for context ──
        List<Package> packages = packageRepository.findAll();
        String packageContext = buildPackageContext(packages);

        // ── Step 2: Build system prompt with TravelNest context ──
        String systemPrompt = """
                You are TravelNest AI, a friendly and knowledgeable travel assistant for the TravelNest booking platform.
                
                Your job is to:
                - Help users find the right travel package based on their budget, interests, and group size
                - Answer questions about destinations, tour details, pricing, and booking process
                - Give helpful travel tips and packing advice
                - Explain the booking and cancellation policy clearly
                
                AVAILABLE PACKAGES ON TRAVELNEST (use this to answer package-related questions):
                """ + packageContext + """
                
                BOOKING POLICY:
                - Cancellation 7+ days before tour: 100% full refund
                - Cancellation within 7 days: No refund
                - Payment is via Razorpay (secure, test mode)
                - After payment, booking is PENDING until admin confirms
                - Once confirmed, user receives a QR-coded E-Ticket
                
                IMPORTANT RULES:
                - Always be helpful, concise, and friendly
                - If asked about packages, mention specific ones from the list above with prices
                - If asked something outside travel/TravelNest scope, politely redirect
                - Respond in the same language the user writes in (Hindi or English)
                - Keep responses under 150 words unless a detailed itinerary is requested
                """;

        // ── Step 3: Call Groq API ──
        RestClient restClient = RestClient.create();

        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user",   "content", userMessage)
                ),
                "max_tokens", 500,
                "temperature", 0.7
        );

        try {
            Map response = restClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            // Extract the AI reply from Groq response
            List<Map> choices = (List<Map>) response.get("choices");
            Map message = (Map) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            System.err.println("Groq API error: " + e.getMessage());
            return "Sorry, I'm having trouble connecting right now. Please try again in a moment!";
        }
    }

    private String buildPackageContext(List<Package> packages) {
        if (packages.isEmpty()) return "No packages currently available.";

        StringBuilder sb = new StringBuilder();
        for (Package pkg : packages) {
            sb.append(String.format(
                    "- %s | Location: %s | Price: ₹%.0f per person | Duration: %s | Category: %s | Available Slots: %d\n",
                    pkg.getTitle(),
                    pkg.getLocation(),
                    pkg.getPrice(),
                    pkg.getDuration(),
                    pkg.getCategory(),
                    pkg.getAvailableSlots() != null ? pkg.getAvailableSlots() : 0
            ));
        }
        return sb.toString();
    }
}