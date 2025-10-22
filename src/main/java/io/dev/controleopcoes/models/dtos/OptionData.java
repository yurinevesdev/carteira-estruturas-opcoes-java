package io.dev.controleopcoes.models.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OptionData {
    private Double strike;
    private String vencimento;
    private Double close;
}