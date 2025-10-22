package io.dev.controleopcoes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${oplab.base-url}")
    private String baseUrl;

    @Value("${oplab.access-token}")
    private String accessToken;

    @Bean
    public WebClient oplabWebClient(WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.USER_AGENT, "ControleOpcoesApp/1.0")
                .defaultHeader("Access-Token", accessToken)
                .build();
    }
}