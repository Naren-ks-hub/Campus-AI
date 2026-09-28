package com.campusai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CampusAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusAiApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" CampusAI College Management Server Started!    ");
        System.out.println(" Web Portal: http://localhost:8080               ");
        System.out.println("=================================================");
    }
}
