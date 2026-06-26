package com.sentinel.fusion.service;

import com.sentinel.fusion.dto.ConfirmedTargetDto;
import com.sentinel.fusion.entity.SensorPingEntity;
import com.sentinel.fusion.repository.SensorPingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ClusteringService{
    private static final Logger log = LoggerFactory.getLogger(ClusteringService.class);
    private final SensorPingRepository repository;
    private final TargetPublishingService publishingService;

    public ClusteringService(SensorPingRepository repository, TargetPublishingService publishingService){
        this.repository = repository;
        this.publishingService = publishingService;
    }

    // Run every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void runClusteringSweep() {
        log.info("Running spatial clustering sweep...");
        long tenSecondsAgo = System.currentTimeMillis() - 10000;
        List<SensorPingEntity> allPings = repository.findAll();

        for (SensorPingEntity basePing : allPings){
            // Ask PostGIS if there are any OTHER pings within 50 meters
            List<SensorPingEntity> nearbyPings = repository.findNearbyRecentPings(
                basePing.getId(), tenSecondsAgo, 50.0
            );

            if (nearbyPings.size() >= 2){
                log.warn("TARGET CONFIRMED! Sensor {} corroborated by {} other sensor(s) within 50m!",
                    basePing.getSensorId(), nearbyPings.size());

                // Calculate the average coordinates
                double totalLat = basePing.getLocation().getY();
                double totalLon = basePing.getLocation().getX();
                List<String> sensorIds = new ArrayList<>();
                sensorIds.add(basePing.getSensorId());

                for (SensorPingEntity nearby : nearbyPings){
                    totalLat += nearby.getLocation().getY();
                    totalLon += nearby.getLocation().getX();
                    sensorIds.add(nearby.getSensorId());
                }

                int totalSensors = nearbyPings.size() + 1;
                double avgLat = totalLat / totalSensors;
                double avgLon = totalLon / totalSensors;

                // Build the DTO
                ConfirmedTargetDto target = new ConfirmedTargetDto(
                    UUID.randomUUID(),
                    avgLat,
                    avgLon,
                    System.currentTimeMillis(),
                    sensorIds
                );

                publishingService.publishTarget(target);
                break;
            }
        }
    }
}