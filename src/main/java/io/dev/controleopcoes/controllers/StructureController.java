package io.dev.controleopcoes.controllers;

import io.dev.controleopcoes.models.Structure;
import io.dev.controleopcoes.models.dtos.StructureRequestDto;
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
}
