package com.sentinel.fusion.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
import java.util.UUID;

@Entity
@Table(name = "raw_sensor_pings")
public class SensorPingEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sensor_id", nullable = false)
    private String sensorId;

    @Column(name = "ping_timestamp", nullable = false)
    private long pingTimestamp;

    @Column(name = "sensor_type", nullable = false)
    private String sensorType;

    @Column(name = "location", nullable = false, columnDefinition = "geometry(Point, 4326")
    private Point location;

    protected SensorPingEntity() {}

    public SensorPingEntity(String sensorId, long pingTimestamp, String sensorType, Point location) {
        this.sensorId = sensorId;
        this.pingTimestamp = pingTimestamp;
        this.sensorType = sensorType;
        this.location = location;
    }

    public UUID getId() { return id; }
    public String getSensorId() { return sensorId; }
    public Point getLocation() { return location; }
}