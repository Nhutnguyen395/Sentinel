package com.sentinel.interceptor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.interceptor.dto.ConfirmedTargetDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TargetListenerService {
    private static final Logger log = LoggerFactory.getLogger(TargetListenerService.class);
    private final ObjectMapper objectMapper;

    public TargetListenerService(){
        this.objectMapper = new ObjectMapper();
    }

    // Listen to the topic Fusion engine just published to
    @KafkaListener(topics = "confirmed-targets", groupId = "interceptor-group")
    public void onTargetConfirmed(String message) {
        try {
            // Convert raw JSON string back to java record
            ConfirmedTargetDto target = objectMapper.readValue(message, ConfirmedTargetDto.class);

            log.warn("TARGET ACQUIRED BY C2 SYSTEM!");
            log.warn("ID: {}", target.targetId());
            log.warn("Coordinates: {}, {}", target.estimatedLat(), target.estimatedLon());
            log.warn("Corroborated by: {}", target.sensorIds());

            // Todo: make a gPRC call to the Battery Service to get a firing solution
        } catch (Exception e) {
            log.error("Failed to parse incoming target data", e);
        }
    }
}