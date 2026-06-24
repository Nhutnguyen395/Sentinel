package com.sentinel.interceptor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.interceptor.dto.ConfirmedTargetDto;
import com.sentinel.battery.grpc.BatteryManagementGrpc;
import com.sentinel.battery.grpc.FiringSolution;
import com.sentinel.battery.grpc.TargetCoordinates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TargetListenerService {
    private static final Logger log = LoggerFactory.getLogger(TargetListenerService.class);
    private final ObjectMapper objectMapper;

    // Declare stub
    private final BatteryManagementGrpc.BatteryManagementBlockingStub batteryStub;

    public TargetListenerService(BatteryManagementGrpc.BatteryManagementBlockingStub batteryStub) {
        this.objectMapper = new ObjectMapper();
        this.batteryStub = batteryStub;
    }

    // Listen to the topic Fusion engine just published to
    @KafkaListener(topics = "confirmed-targets", groupId = "interceptor-group")
    public void onTargetConfirmed(String message) {
        try {
            // Convert raw JSON string back to java record
            ConfirmedTargetDto target = objectMapper.readValue(message, ConfirmedTargetDto.class);

            log.warn("TARGET ACQUIRED BY C2 SYSTEM! ID: {}", target.targetId());
            log.info("Requesting firing solution for coordinates: {}, {}",
                    target.estimatedLat(), target.estimatedLon());

            // Build the gRPC Request using the Protobuf Builder
            TargetCoordinates request = TargetCoordinates.newBuilder()
                    .setTargetLat(target.estimatedLat())
                    .setTargetLon(target.estimatedLon())
                    .build();

            // Make the synchronous gRPC call to the Battery Service
            FiringSolution response = batteryStub.getOptimalLauncher(request);

            // Handle the response
            if (response.getIsInRange()){
                log.error("LAUNCH COMMAND ISSUED!");
                log.error("Assigned Battery: {}", response.getLauncherId());
                log.error("Estimated Time to Impact: {} seconds", response.getTimeToInterceptSeconds());
            }
        } catch (Exception e) {
            log.error("Failed to process target or contact battery service", e);
        }
    }
}