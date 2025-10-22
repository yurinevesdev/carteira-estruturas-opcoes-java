package io.dev.controleopcoes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ControleopcoesApplication {

    public static void main(String[] args) {
        SpringApplication.run(ControleopcoesApplication.class, args);
    }

}
