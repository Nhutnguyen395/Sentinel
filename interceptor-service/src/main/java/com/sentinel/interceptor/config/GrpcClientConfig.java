package com.sentinel.interceptor.config;

import com.sentinel.battery.grpc.BatteryManagementGrpc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelFactory;

@Configuration
public class GrpcClientConfig {
    @Bean
    public BatteryManagementGrpc.BatteryManagementBlockingStub batteryStub(GrpcChannelFactory channels) {

        // 1. We ask the factory to create a channel named "battery-service".
        // (This perfectly matches the "battery-service" name we put in application.yml)
        var channel = channels.createChannel("battery-service");

        // 2. We wrap that network channel in our Protobuf Stub and return it.
        return BatteryManagementGrpc.newBlockingStub(channel);
    }
}