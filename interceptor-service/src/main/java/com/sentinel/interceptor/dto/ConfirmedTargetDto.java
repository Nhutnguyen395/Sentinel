package com.sentinel.interceptor.dto;

import java.util.List;
import java.util.UUID;

public record ConfirmedTargetDto(
        UUID targetId,
        double estimatedLat,
        double estimatedLon,
        long confirmationTime,
        List<String> sensorIds
) {}