package com.sentinel.fusion.dto;

public record SensorPingDto(
        String sensorId,
        double lat,
        double lon,
        long timestamp,
        String type
) {}