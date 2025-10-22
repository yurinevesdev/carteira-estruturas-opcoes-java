package io.dev.controleopcoes.models.dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationRequestDto {
    private String ativo;
    private String tipo;
    private String operacao;
    private int quantidade;
}
