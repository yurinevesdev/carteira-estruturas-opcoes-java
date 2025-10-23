package io.dev.controleopcoes.services;

import io.dev.controleopcoes.models.Operation;
import io.dev.controleopcoes.models.Structure;
import io.dev.controleopcoes.models.dtos.InvestmentSummaryDto;
import io.dev.controleopcoes.models.dtos.OptionData;
import io.dev.controleopcoes.models.dtos.StructureRequestDto;
import io.dev.controleopcoes.repositories.StructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StructureService {

    private final StructureRepository structureRepository;
    private final ApiService apiService;

    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;

    @Transactional
    public Structure createStructure(StructureRequestDto dto) {
        Structure structure = Structure.builder()
                .dataEntrada(dto.getDataEntrada())
                .estrategia(dto.getEstrategia())
                .ativo(dto.getAtivo())
                .dataSaida(dto.getDataSaida())
                .observacoes(dto.getObservacoes())
                .build();

        List<Operation> operations = dto.getLancamentos().stream().map(opDto -> {
            Operation op = new Operation();
            op.setAtivo(opDto.getAtivo());
            op.setTipo(opDto.getTipo());
            op.setOperacao(opDto.getOperacao());
            op.setQuantidade(opDto.getQuantidade());
            op.setPrecoSaida(0.0);
            op.setResultado(0.0);
            op.setStructure(structure);

            if ("AÇÃO".equalsIgnoreCase(opDto.getTipo())) {
                op.setStrike(0);
                op.setVencimento(null);
                op.setPrecoEntrada(apiService.getPrecoAtivo(opDto.getAtivo()));
            } else {
                OptionData optionData = apiService.getOptionData(opDto.getAtivo());
                if (optionData != null) {
                    op.setStrike(optionData.getStrike() != null ? optionData.getStrike() : 0);

                    if (optionData.getVencimento() != null) {
                        try {
                            op.setVencimento(LocalDate.parse(optionData.getVencimento(), formatter));
                        } catch (DateTimeParseException e) {
                            System.out.println("Erro ao parsear vencimento: " + optionData.getVencimento());
                            op.setVencimento(null);
                        }
                    }

                    op.setPrecoEntrada(optionData.getClose() != null ? optionData.getClose() : 0);
                } else {
                    System.out.println("OptionData retornou null para: " + opDto.getAtivo());
                    op.setStrike(0);
                    op.setPrecoEntrada(0);
                    op.setVencimento(null);
                }
            }

            System.out.println("Operação criada: " + op.getAtivo() + " | Tipo: " + op.getTipo() + " | Preço Entrada: "
                    + op.getPrecoEntrada() + " | Strike: " + op.getStrike() + " | Vencimento: " + op.getVencimento());

            return op;
        }).collect(Collectors.toList());

        structure.setLancamentos(operations);

        return structureRepository.save(structure);
    }

    public List<Structure> getAllStructures() {
        return structureRepository.findAll();
    }

    public Optional<Structure> getStructureById(Long id) {
        return structureRepository.findById(id);
    }

    @Transactional
    public void deleteStructure(Long id) {
        structureRepository.deleteById(id);
    }

    public double getOverallSummary() {
        return structureRepository.findAll().stream()
                .filter(s -> "Finalizada".equals(s.getStatus()))
                .mapToDouble(Structure::getTotalResultado)
                .sum();
    }

    public double getOngoingStructuresSummary() {
        return structureRepository.findAll().stream()
                .filter(s -> "Em Andamento".equals(s.getStatus()))
                .mapToDouble(Structure::getTotalResultado)
                .sum();
    }

    public InvestmentSummaryDto getInvestmentSummary() {
        List<Structure> allStructures = structureRepository.findAll();

        double totalInvestido = allStructures.stream()
                .flatMap(s -> s.getLancamentos().stream())
                .filter(op -> "compra".equalsIgnoreCase(op.getOperacao()))
                .mapToDouble(op -> op.getPrecoEntrada() * op.getQuantidade())
                .sum();

        double resultadoTotal = allStructures.stream()
                .mapToDouble(Structure::getTotalResultado)
                .sum();

        double percentualLucro = (totalInvestido == 0) ? 0 : (resultadoTotal / totalInvestido) * 100;

        return InvestmentSummaryDto.builder()
                .totalInvestido(totalInvestido)
                .resultadoTotal(resultadoTotal)
                .percentualLucro(percentualLucro)
                .build();
    }

    @Transactional
    public Structure addOperationToStructure(Long structureId, io.dev.controleopcoes.models.dtos.OperationRequestDto opDto) {
        Structure structure = structureRepository.findById(structureId)
                .orElseThrow(() -> new RuntimeException("Estrutura não encontrada"));

        Operation op = new Operation();
        op.setAtivo(opDto.getAtivo());
        op.setTipo(opDto.getTipo());
        op.setOperacao(opDto.getOperacao());
        op.setQuantidade(opDto.getQuantidade());
        op.setPrecoSaida(0.0);
        op.setResultado(0.0);
        op.setStructure(structure);

        if ("AÇÃO".equalsIgnoreCase(opDto.getTipo())) {
            op.setStrike(0);
            op.setVencimento(null);
            op.setPrecoEntrada(apiService.getPrecoAtivo(opDto.getAtivo()));
        } else {
            OptionData optionData = apiService.getOptionData(opDto.getAtivo());
            if (optionData != null) {
                op.setStrike(optionData.getStrike() != null ? optionData.getStrike() : 0);
                if (optionData.getVencimento() != null) {
                    try {
                        op.setVencimento(LocalDate.parse(optionData.getVencimento(), formatter));
                    } catch (DateTimeParseException e) {
                        op.setVencimento(null);
                    }
                }
                op.setPrecoEntrada(optionData.getClose() != null ? optionData.getClose() : 0);
            } else {
                op.setStrike(0);
                op.setPrecoEntrada(0);
                op.setVencimento(null);
            }
        }

        structure.getLancamentos().add(op);
        return structureRepository.save(structure);
    }
}
