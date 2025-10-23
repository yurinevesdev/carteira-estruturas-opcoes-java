package io.dev.controleopcoes.services;

import io.dev.controleopcoes.models.Operation;
import io.dev.controleopcoes.models.Structure;
import io.dev.controleopcoes.repositories.OperationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OperationService {

    private final OperationRepository operationRepository;

    public OperationService(OperationRepository operationRepository) {
        this.operationRepository = operationRepository;
    }

    public List<Operation> getOperationsByStructure(Structure structure) {
        return operationRepository.findByStructure(structure);
    }

    public Operation saveOperation(Operation operation) {
        return operationRepository.save(operation);
    }

    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    @Transactional
    public Optional<Operation> closeOperation(Long id, double precoSaida) {
        return operationRepository.findById(id).map(operation -> {
            operation.setPrecoSaida(precoSaida);

            double result;
            if ("venda".equalsIgnoreCase(operation.getOperacao())) {
                result = (operation.getPrecoEntrada() - precoSaida) * operation.getQuantidade();
            } else { // Compra
                result = (precoSaida - operation.getPrecoEntrada()) * operation.getQuantidade();
            }
            operation.setResultado(result);

            return operationRepository.save(operation);
        });
    }}
