package com.sentinel.battery.service;

import com.sentinel.battery.grpc.BatteryManagementGrpc;
import com.sentinel.battery.grpc.FiringSolution;
import com.sentinel.battery.grpc.TargetCoordinates;
import io.grpc.stub.StreamObserver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class BatteryGrpcService extends BatteryManagementGrpc.BatteryManagementImplBase {
    public static final Logger log = LoggerFactory.getLogger(BatteryGrpcService.class);

    // Override the method defined in the battery.proto file
    @Override
    public void getOptimalLauncher(TargetCoordinates request, StreamObserver<FiringSolution> responseObserver){
        log.info("Received gRPC Request for Firing Solution at coordinates: {}, {}",
                request.getTargetLat(), request.getTargetLon());

        // Simulated Battery Logic
        double baseLat = 34.0;
        double baseLon = -118.0;

        // Simple distance calculation (Pythagorean Theorem for flat grid simulation)
        double distance = Math.sqrt(
            Math.pow(request.getTargetLat() - baseLat, 2) +
            Math.pow(request.getTargetLon() - baseLon, 2)
        );

        FiringSolution solution;

        // If the distance is less than 0.5 coordinate degrees, it's in range
        if (distance < 0.5) {
            log.info("Target is In Range. Assigning Launcher-Alpha.");

            // 3. Build the Protobuf Response Object using the generated Builder
            solution = FiringSolution.newBuilder()
                    .setLauncherId("LAUNCHER-ALPHA")
                    .setTimeToInterceptSeconds(12.5) // Simulated 12.5 seconds to impact
                    .setIsInRange(true)
                    .build();
        } else {
            log.warn("Target is out of range.");
            solution = FiringSolution.newBuilder()
                    .setLauncherId("NONE")
                    .setTimeToInterceptSeconds(0.0)
                    .setIsInRange(false)
                    .build();
        }

        // 4. Send the response down the pipe
        responseObserver.onNext(solution);

        // 5. Close the pipe
        responseObserver.onCompleted();
    }
}