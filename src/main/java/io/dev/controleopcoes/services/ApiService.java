package io.dev.controleopcoes.services;

import io.dev.controleopcoes.exceptions.ApiServiceException;
import io.dev.controleopcoes.models.dtos.OptionData;
import io.dev.controleopcoes.models.dtos.PrecoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiService {

    private final WebClient oplabWebClient;

    public Double getPrecoAtivo(String ticker) {
        log.debug("Buscando preço para o ativo: {}", ticker);
        return oplabWebClient.get()
                .uri("/stocks/{ticker}", ticker.toUpperCase())
                .retrieve()
                .bodyToMono(PrecoResponse.class)
                .map(PrecoResponse::getClose)
                .doOnError(e -> log.error("Erro ao buscar preço do ativo {}: {}", ticker, e.getMessage()))
                .onErrorMap(e -> new ApiServiceException("Falha ao buscar preço do ativo " + ticker, e))
                .block();
    }

    public OptionData getOptionData(String optionSymbol) {
        log.debug("Buscando dados para a opção: {}", optionSymbol);
        return oplabWebClient.get()
                .uri("/options/details/{optionSymbol}", optionSymbol.toUpperCase())
                .retrieve()
                .bodyToMono(OptionData.class)
                .doOnError(e -> log.error("Erro ao buscar dados da opção {}: {}", optionSymbol, e.getMessage()))
                .onErrorMap(e -> new ApiServiceException("Falha ao buscar dados da opção " + optionSymbol, e))
                .block();
    }
}
