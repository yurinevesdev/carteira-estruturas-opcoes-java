package io.dev.controleopcoes.repositories;

import io.dev.controleopcoes.models.Operation;
import io.dev.controleopcoes.models.Structure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationRepository extends JpaRepository<Operation, Long> {
    List<Operation> findByStructure(Structure structure);

    List<Operation> findByAtivo(String ativo);

    List<Operation> findByStructureAndOperacao(Structure structure, String operacao);
}
