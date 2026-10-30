package com.cognify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CognifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(CognifyApplication.class, args);
        System.out.println("\n" +
            "╔═══════════════════════════════════════════════════════════╗\n" +
            "║                                                           ║\n" +
            "║   🧠 COGNIFY BACKEND v2.0 STARTED SUCCESSFULLY! 🚀       ║\n" +
            "║                                                           ║\n" +
            "║   API running at: http://localhost:8080                   ║\n" +
            "║   Frontend URL:   http://localhost:5173                   ║\n" +
            "║                                                           ║\n" +
            "╚═══════════════════════════════════════════════════════════╝\n"
        );
    }
}
