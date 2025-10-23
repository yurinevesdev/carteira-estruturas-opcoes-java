package io.dev.controleopcoes.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "structure")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Structure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dataEntrada;

    private String estrategia;

    private String ativo;

    private LocalDate dataSaida;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @OneToMany(mappedBy = "structure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Operation> lancamentos;

    @Transient
    public String getStatus() {
        if (lancamentos == null || lancamentos.isEmpty()) {
            return "Em Andamento";
        }
        boolean allClosed = lancamentos.stream().allMatch(op -> op.getPrecoSaida() > 0);
        return allClosed ? "Finalizada" : "Em Andamento";
    }

    @Transient
    public double getTotalResultado() {
        if (lancamentos == null) {
            return 0.0;
        }
        return lancamentos.stream().mapToDouble(op -> {
            if (op.getPrecoSaida() > 0) {
                return op.getResultado();
            }
            // Calcula resultado parcial para operações em aberto
            if ("venda".equalsIgnoreCase(op.getOperacao())) {
                return (op.getPrecoEntrada() - op.getPrecoAtual()) * op.getQuantidade();
            } else {
                return (op.getPrecoAtual() - op.getPrecoEntrada()) * op.getQuantidade();
            }
        }).sum();
    }}
