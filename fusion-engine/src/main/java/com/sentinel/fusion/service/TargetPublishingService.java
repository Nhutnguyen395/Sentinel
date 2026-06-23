package com.sentinel.fusion.service;

import com.sentinel.fusion.dto.ConfirmedTargetDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class TargetPublishingService {
    private static final Logger log = LoggerFactory.getLogger(TargetPublishingService.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TargetPublishingService(KafkaTemplate<String, Object> kafkaTemplate){
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishTarget(ConfirmedTargetDto target) {
        // Send the payload to the "confirmed-targets" topic
        // use targerId.toString() to get the Key
        kafkaTemplate.send("confirmed-targets", target.targetId().toString(), target);
        log.info("Kill Chain Initiated: Published confirmed target {} to Kafka", target.targetId());
    }
}