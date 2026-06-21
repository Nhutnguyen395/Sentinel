package com.sentinel.fusion.repository;

import com.sentinel.fusion.entity.SensorPingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SensorPingRepository extends JpaRepository<SensorPingEntity, UUID> {
    // Spring Data JPA automatically implements the standard save(), findById(), etc.
}