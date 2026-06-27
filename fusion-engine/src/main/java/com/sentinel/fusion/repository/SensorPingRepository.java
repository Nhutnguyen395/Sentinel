package com.sentinel.fusion.repository;

import com.sentinel.fusion.entity.SensorPingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SensorPingRepository extends JpaRepository<SensorPingEntity, UUID> {
    // We use native PostgreSQL/PostGIS SQL here to access ST_DWithin
    // Cast to geography to ensure the distance in calculated in Meters, not degress.
    @Query(value = """
                   SELECT p2.* FROM raw_sensor_pings p1
                   JOIN raw_sensor_pings p2 ON p1.id != p2.id
                   WHERE p1.id = :pingId
                   AND p1.ping_timestamp >= :timeThreshold
                   AND p2.ping_timestamp >= :timeThreshold
                   AND ST_DWithin(p1.location::geography, p2.location::geography, :radiusInMeters)
                   """, nativeQuery = true)

    List<SensorPingEntity> findNearbyRecentPings(
            @Param("pingId") UUID pingId,
            @Param("timeThreshold") long timeThreshold,
            @Param("radiusInMeters") double radiusInMeters
    );

    @Query(value = "SELECT * FROM raw_sensor_pings WHERE ping_timestamp >= :timeThreshold", nativeQuery = true)
    
    List<SensorPingEntity> findRecentPings(@Param("timeThreshold") long timeThreshold);
}