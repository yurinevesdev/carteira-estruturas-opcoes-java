package io.dev.controleopcoes.models.dtos;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StructureRequestDto {
    private LocalDate dataEntrada;
    private String estrategia;
    private String ativo;
    private LocalDate dataSaida;
    private String observacoes;
    private List<OperationRequestDto> lancamentos;
}
