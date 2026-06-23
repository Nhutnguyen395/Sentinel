package com.sentinel.fusion.dto;

import java.util.List;
import java.util.UUID;

public record ConfirmedTargetDto(
        UUID targetId,
        double estimateLat,
        double estimateLon,
        long confirmationTime,
        List<String> sensorIds // List of sensors that corroborated
) {}