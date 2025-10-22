package io.dev.controleopcoes.services;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ApiService {

    private final String accessToken;
    private final RestTemplate restTemplate;
    private final String baseUrl = "https://api.oplab.com.br/v3/market";

    public ApiService(@Value("${oplab.access-token}") String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("OPLAB_ACCESS_TOKEN não encontrado.");
        }
        this.accessToken = accessToken;
        this.restTemplate = new RestTemplate();
    }

    public Double getPrecoAtivo(String ticker) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Access-Token", accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<PrecoResponse> response = restTemplate.exchange(
                    baseUrl + "/stocks/{ticker}",
                    HttpMethod.GET,
                    entity,
                    PrecoResponse.class,
                    ticker.toUpperCase());

            return response.getBody() != null ? response.getBody().getClose() : 0.0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0.0;
        }
    }

    public OptionData getOptionData(String optionSymbol) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Access-Token", accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<OptionData> response = restTemplate.exchange(
                    baseUrl + "/options/details/{optionSymbol}",
                    HttpMethod.GET,
                    entity,
                    OptionData.class,
                    optionSymbol.toUpperCase());

            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Getter
    @Setter
    public static class OptionData {
        private Double strike;
        private String vencimento;
        private Double close;
    }

    @Getter
    @Setter
    public static class PrecoResponse {
        private Double close;
    }
}
