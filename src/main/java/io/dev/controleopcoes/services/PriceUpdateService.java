package io.dev.controleopcoes.services;

import io.dev.controleopcoes.exceptions.ApiServiceException;
import io.dev.controleopcoes.models.Operation;
import io.dev.controleopcoes.models.dtos.OptionData;
import io.dev.controleopcoes.repositories.OperationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceUpdateService {

    private final OperationRepository operationRepository;
    private final ApiService apiService;

    @Scheduled(fixedRate = 900000)
    @Transactional
    public void updateOperationsPrices() {
        log.info("Iniciando job de atualização de preços...");

        List<Operation> operations = operationRepository.findAll();
        log.info("Encontradas {} operações para atualizar.", operations.size());

        for (Operation op : operations) {
            try {
                Double currentPrice = null;
                if ("AÇÃO".equalsIgnoreCase(op.getTipo())) {
                    currentPrice = apiService.getPrecoAtivo(op.getAtivo());
                } else {
                    OptionData optionData = apiService.getOptionData(op.getAtivo());
                    if (optionData != null) {
                        currentPrice = optionData.getClose();
                    }
                }

                if (currentPrice != null) {
                    op.setPrecoAtual(currentPrice);
                    log.debug("Preço atualizado para {}: {}", op.getAtivo(), currentPrice);
                }
            } catch (ApiServiceException e) {
                log.error("Falha na API ao atualizar o preço para a operação do ativo {}: {}", op.getAtivo(),
                        e.getMessage());
            }
        }
        log.info("Job de atualização de preços finalizado.");
    }
}