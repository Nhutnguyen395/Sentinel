package com.sentinel.fusion.service;

import com.sentinel.fusion.entity.SensorPingEntity;
import com.sentinel.fusion.repository.SensorPingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClusteringService{
    private static final Logger log = LoggerFactory.getLogger(ClusteringService.class);
    private final SensorPingRepository repository;

    public ClusteringService(SensorPingRepository repository){
        this.repository = repository;
    }

    // Run every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void runClusteringSweep() {
        log.info("Running spatial clustering sweep...");

        // 1. Get all pings from the last 10 seconds
        long tenSecondsAgo = System.currentTimeMillis() - 10000;

        List<SensorPingEntity> allPings = repository.findAll();

        for (SensorPingEntity ping : allPings){
            // 2. Ask PostGIS if there are any OTHER pings within 50 meters
            List<SensorPingEntity> nearbyPings = repository.findNearbyRecentPings(
                ping.getId(),
                tenSecondsAgo,
                50.0
            );

            if (!nearbyPings.isEmpty()){
                log.warn("TARGET CONFIRMED! Sensor {} corroborated by {} other sensor(s) within 50m!",
                    ping.getSensorId(), nearbyPings.size());
                break;
            }
        }
    }
}