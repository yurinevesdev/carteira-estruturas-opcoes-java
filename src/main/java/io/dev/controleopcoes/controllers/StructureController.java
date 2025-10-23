package io.dev.controleopcoes.controllers;

import io.dev.controleopcoes.models.Structure;
import io.dev.controleopcoes.models.dtos.InvestmentSummaryDto;
import io.dev.controleopcoes.models.dtos.OperationRequestDto;
import io.dev.controleopcoes.models.dtos.StructureRequestDto;
import io.dev.controleopcoes.services.PriceUpdateService;
import io.dev.controleopcoes.services.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/structures")
@RequiredArgsConstructor
public class StructureController {

    private final StructureService structureService;
    private final PriceUpdateService priceUpdateService;

    @PostMapping
    public ResponseEntity<Structure> createStructure(@RequestBody StructureRequestDto dto) {
        Structure created = structureService.createStructure(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Structure>> findAll() {
        List<Structure> structures = structureService.getAllStructures();
        return ResponseEntity.ok(structures);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Structure> findById(@PathVariable Long id) {
        return structureService.getStructureById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStructure(@PathVariable Long id) {
        structureService.deleteStructure(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/update-prices")
    public ResponseEntity<Void> updatePrices() {
        priceUpdateService.updateOperationsPrices();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Double> getSummary() {
        double summary = structureService.getOverallSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/ongoing")
    public ResponseEntity<Double> getOngoingSummary() {
        double summary = structureService.getOngoingStructuresSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/investment")
    public ResponseEntity<InvestmentSummaryDto> getInvestmentSummary() {
        InvestmentSummaryDto summary = structureService.getInvestmentSummary();
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/{id}/operations")
    public ResponseEntity<Structure> addOperation(@PathVariable Long id, @RequestBody OperationRequestDto dto) {
        Structure updatedStructure = structureService.addOperationToStructure(id, dto);
        return ResponseEntity.ok(updatedStructure);
    }
}
