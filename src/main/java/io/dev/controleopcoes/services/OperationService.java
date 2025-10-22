package io.dev.controleopcoes.services;

import io.dev.controleopcoes.models.Operation;
import io.dev.controleopcoes.models.Structure;
import io.dev.controleopcoes.repositories.OperationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
