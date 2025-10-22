package io.dev.controleopcoes.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "operation")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ativo;

    private String tipo;

    private String operacao;

    private double strike;

    private LocalDate vencimento;

    private int quantidade;

    private double precoEntrada;

    private double precoSaida;

    private double resultado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "structure_id", nullable = false)
    @JsonIgnore
    private Structure structure;
}
