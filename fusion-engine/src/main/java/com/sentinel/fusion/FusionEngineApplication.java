package com.sentinel.fusion;


import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableScheduling
@SpringBootApplication
public class FusionEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(FusionEngineApplication.class, args);
    }

}
