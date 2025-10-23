package io.dev.controleopcoes.controllers;

import io.dev.controleopcoes.models.Operation;
import io.dev.controleopcoes.models.dtos.OperationUpdateDto;
import io.dev.controleopcoes.services.OperationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationService operationService;

    @PatchMapping("/{id}/close")
    public ResponseEntity<Operation> closeOperation(@PathVariable Long id, @RequestBody OperationUpdateDto dto) {
        return operationService.closeOperation(id, dto.getPrecoSaida())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
