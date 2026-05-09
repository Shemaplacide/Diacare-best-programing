package com.auca.diacare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DiaCareApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiaCareApplication.class, args);
    }
}
