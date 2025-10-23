document.addEventListener('DOMContentLoaded', function () {

    const API_URL = '/structures';

    const structureForm = document.getElementById('structure-form');
    const structuresTableBody = document.getElementById('structures-table-body');
    const addLancamentoBtn = document.getElementById('add-lancamento');
    const lancamentosContainer = document.getElementById('lancamentos-container');

    let lancamentoCounter = 0;

    // Carrega as estruturas existentes ao iniciar
    fetchStructures();

    // Adiciona um novo bloco de lançamento no formulário
    addLancamentoBtn.addEventListener('click', () => {
        lancamentoCounter++;
        const newLancamento = document.createElement('div');
        newLancamento.classList.add('lancamento-item');
        newLancamento.setAttribute('id', `lancamento-${lancamentoCounter}`);
        newLancamento.innerHTML = `
            <button type="button" class="btn-close remove-lancamento" aria-label="Close"></button>
            <h6>Lançamento ${lancamentoCounter}</h6>
            <div class="row">
                <div class="col-md-3 mb-3">
                    <label class="form-label">Ativo</label>
                    <input type="text" class="form-control lancamento-ativo" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">Tipo (Call/Put)</label>
                    <input type="text" class="form-control lancamento-tipo" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">Operação (Compra/Venda)</label>
                    <input type="text" class="form-control lancamento-operacao" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">Quantidade</label>
                    <input type="number" class="form-control lancamento-quantidade" required>
                </div>
            </div>
        `;
        lancamentosContainer.appendChild(newLancamento);
    });

    // Remove um bloco de lançamento
    lancamentosContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-lancamento')) {
            e.target.closest('.lancamento-item').remove();
        }
    });

    // Envia o formulário para criar uma nova estrutura
    structureForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const lancamentos = [];
        document.querySelectorAll('.lancamento-item').forEach(item => {
            lancamentos.push({
                ativo: item.querySelector('.lancamento-ativo').value,
                tipo: item.querySelector('.lancamento-tipo').value,
                operacao: item.querySelector('.lancamento-operacao').value,
                quantidade: parseInt(item.querySelector('.lancamento-quantidade').value)
            });
        });

        const structureData = {
            estrategia: document.getElementById('estrategia').value,
            ativo: document.getElementById('ativo').value,
            dataEntrada: document.getElementById('dataEntrada').value,
            dataSaida: document.getElementById('dataSaida').value || null,
            observacoes: document.getElementById('observacoes').value,
            lancamentos: lancamentos
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(structureData)
        })
        .then(response => response.json())
        .then(() => {
            fetchStructures(); // Re-carrega a tabela
            structureForm.reset();
            lancamentosContainer.innerHTML = '';
            lancamentoCounter = 0;
        })
        .catch(error => console.error('Erro ao criar estrutura:', error));
    });

    // Busca todas as estruturas no backend
    function fetchStructures() {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                structuresTableBody.innerHTML = '';
                data.forEach(structure => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${structure.id}</td>
                        <td>${structure.estrategia}</td>
                        <td>${structure.ativo}</td>
                        <td>${new Date(structure.dataEntrada).toLocaleDateString()}</td>
                        <td>${structure.dataSaida ? new Date(structure.dataSaida).toLocaleDateString() : 'N/A'}</td>
                        <td>${structure.lancamentos.length}</td>
                    `;
                    structuresTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Erro ao buscar estruturas:', error));
    }
});
