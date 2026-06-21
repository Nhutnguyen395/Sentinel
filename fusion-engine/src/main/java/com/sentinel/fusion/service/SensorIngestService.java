package com.sentinel.fusion.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.fusion.dto.SensorPingDto;
import com.sentinel.fusion.entity.SensorPingEntity;
import com.sentinel.fusion.repository.SensorPingRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class SensorIngestService {
    private static final Logger log = LoggerFactory.getLogger(SensorIngestService.class);

    private final SensorPingRepository repository;
    private final ObjectMapper objectMapper;
    private final GeometryFactory geometryFactory;

    public SensorIngestService(SensorPingRepository repository) {
        this.repository = repository;
        this.objectMapper = new ObjectMapper();
        this.geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    }

    @KafkaListener(topics = "raw-sensor-pings", groupId = "fusion-engine-group")
    public void consumeSensorPing(String message) {
        try {
            // 1. Deserialize the JSON string into JAVA record
            SensorPingDto dto = objectMapper.readValue(message, SensorPingDto.class);

            // 2. Create the spatial Point. Longitude is X and Latitude is Y.
            Point location = geometryFactory.createPoint(new Coordinate(dto.lon(), dto.lat()));

            // 3. Create the database entity
            SensorPingEntity entity = new SensorPingEntity(
                    dto.sensorId(),
                    dto.timestamp(),
                    dto.type(),
                    location
            );

            // save to PostGIS
            repository.save(entity);
            log.info("Ingested and saved ping from sensor: {}", dto.sensorId());
        } catch (Exception e) {
            log.error("Failed to process sensor ping: {}", message, e);
        }

    }
}