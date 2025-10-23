package io.dev.controleopcoes.models.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvestmentSummaryDto {
    private double totalInvestido;
    private double resultadoTotal;
    private double percentualLucro;
}
