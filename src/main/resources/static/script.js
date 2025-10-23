document.addEventListener('DOMContentLoaded', function () {

    const API_URL = '/structures';
    const dashboard = document.getElementById('structures-dashboard');
    const updatePricesBtn = document.getElementById('update-prices-btn');
    const structureForm = document.getElementById('structure-form');
    const addStructureModal = new bootstrap.Modal(document.getElementById('add-structure-modal'));
    const detailsModal = new bootstrap.Modal(document.getElementById('details-modal'));
    const detailsModalTitle = document.getElementById('details-modal-title');
    const detailsModalBody = document.getElementById('details-modal-body');
    const deleteStructureBtn = document.getElementById('delete-structure-btn');
    const addLancamentoBtn = document.getElementById('add-lancamento');
    const lancamentosContainer = document.getElementById('lancamentos-container');

    let currentStructureId = null;
    let lancamentoCounter = 0;

    // --- Funções Principais ---

    async function handleCreateStructure(e) {
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

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(structureData)
            });

            if (!response.ok) {
                throw new Error('A resposta do servidor não foi OK');
            }

            addStructureModal.hide();
            structureForm.reset();
            lancamentosContainer.innerHTML = '';
            fetchAndRenderStructures();
            showToast('Estrutura criada com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao criar estrutura:', error);
            showToast('Falha ao criar estrutura.', 'error');
        }
    }

    async function fetchAndRenderStructures() {
        try {
            const response = await fetch(API_URL);
            const structures = await response.json();
            dashboard.innerHTML = '';
            structures.forEach(renderStructureCard);
        } catch (error) {
            console.error('Erro ao buscar estruturas:', error);
            showToast('Erro ao carregar dados. Tente novamente.', 'error');
        }
    }

    function renderStructureCard(structure) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';

        const totalResult = calculateTotalResult(structure.lancamentos);
        const resultClass = totalResult > 0 ? 'result-positive' : totalResult < 0 ? 'result-negative' : 'result-neutral';

        card.innerHTML = `
            <div class="card h-100 shadow-sm" data-id="${structure.id}">
                <div class="card-body">
                    <h5 class="card-title">${structure.estrategia}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${structure.ativo}</h6>
                    <p class="card-text">
                        Data Entrada: ${new Date(structure.dataEntrada + 'T00:00:00').toLocaleDateString()}<br>
                        Operações: ${structure.lancamentos.length}
                    </p>
                    <p class="card-text fs-5">Resultado: <strong class="${resultClass}">R$ ${totalResult.toFixed(2)}</strong></p>
                </div>
            </div>
        `;
        dashboard.appendChild(card);
        card.querySelector('.card').addEventListener('click', () => showDetails(structure.id));
    }

    async function showDetails(structureId) {
        currentStructureId = structureId;
        try {
            const response = await fetch(`${API_URL}/${structureId}`);
            const structure = await response.json();

            detailsModalTitle.textContent = `Detalhes: ${structure.estrategia}`;
            detailsModalBody.innerHTML = createDetailsView(structure);

            detailsModal.show();
        } catch (error) {
            console.error(`Erro ao buscar detalhes da estrutura ${structureId}:`, error);
        }
    }

    async function handleUpdatePrices() {
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Atualizando...';
        try {
            await fetch(`${API_URL}/update-prices`, { method: 'POST' });
            await fetchAndRenderStructures();
            showToast('Cotações atualizadas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar preços:', error);
            showToast('Falha ao atualizar cotações.', 'error');
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Atualizar Cotações';
        }
    }

    async function handleDeleteStructure() {
        if (!currentStructureId) return;

        if (confirm('Tem certeza que deseja excluir esta estrutura?')) {
            try {
                await fetch(`${API_URL}/${currentStructureId}`, { method: 'DELETE' });
                detailsModal.hide();
                fetchAndRenderStructures();
                showToast('Estrutura excluída com sucesso.', 'success');
            } catch (error) {
                console.error('Erro ao excluir estrutura:', error);
                showToast('Falha ao excluir estrutura.', 'error');
            }
        }
    }
    
    // --- Funções Auxiliares ---

    function calculateTotalResult(operations) {
        return operations.reduce((total, op) => {
            const entryValue = op.precoEntrada * op.quantidade;
            const currentValue = op.precoAtual * op.quantidade;
            const result = (op.operacao.toLowerCase() === 'venda') ? (entryValue - currentValue) : (currentValue - entryValue);
            return total + result;
        }, 0);
    }

    function createDetailsView(structure) {
        const totalResult = calculateTotalResult(structure.lancamentos);
        const resultClass = totalResult > 0 ? 'result-positive' : totalResult < 0 ? 'result-negative' : 'result-neutral';

        let operationsHtml = '<p>Nenhuma operação encontrada.</p>';
        if (structure.lancamentos && structure.lancamentos.length > 0) {
            operationsHtml = `
                <table class="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Ativo</th>
                            <th>Tipo</th>
                            <th>Operação</th>
                            <th>Qtd.</th>
                            <th>Preço Entrada</th>
                            <th>Preço Atual</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${structure.lancamentos.map(op => {
                            const entryValue = op.precoEntrada * op.quantidade;
                            const currentValue = op.precoAtual * op.quantidade;
                            const result = (op.operacao.toLowerCase() === 'venda') ? (entryValue - currentValue) : (currentValue - entryValue);
                            const opResultClass = result > 0 ? 'result-positive' : result < 0 ? 'result-negative' : 'result-neutral';

                            return `
                                <tr>
                                    <td>${op.ativo}</td>
                                    <td>${op.tipo}</td>
                                    <td>${op.operacao}</td>
                                    <td>${op.quantidade}</td>
                                    <td>R$ ${op.precoEntrada.toFixed(2)}</td>
                                    <td>R$ ${op.precoAtual.toFixed(2)}</td>
                                    <td class="${opResultClass}"><strong>R$ ${result.toFixed(2)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        return `
            <h5>${structure.estrategia} - ${structure.ativo}</h5>
            <p>
                <strong>Data Entrada:</strong> ${new Date(structure.dataEntrada + 'T00:00:00').toLocaleDateString()}<br>
                <strong>Data Saída:</strong> ${structure.dataSaida ? new Date(structure.dataSaida + 'T00:00:00').toLocaleDateString() : 'Em aberto'}<br>
                <strong>Observações:</strong> ${structure.observacoes || 'N/A'}
            </p>
            <h6 class="mt-4">Operações</h6>
            ${operationsHtml}
            <hr>
            <div class="text-end fs-5">Resultado Total: <strong class="${resultClass}">R$ ${totalResult.toFixed(2)}</strong></div>
        `;
    }

    function showToast(message, type = 'success') {
        // Implementação simples de Toast. Para algo mais robusto, usar uma biblioteca.
        const toastContainer = document.createElement('div');
        toastContainer.className = `toast-notification alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
        toastContainer.textContent = message;
        document.body.appendChild(toastContainer);
        setTimeout(() => toastContainer.remove(), 3000);
    }

    // --- Event Listeners ---
    structureForm.addEventListener('submit', handleCreateStructure);
    updatePricesBtn.addEventListener('click', handleUpdatePrices);
    deleteStructureBtn.addEventListener('click', handleDeleteStructure);

    addLancamentoBtn.addEventListener('click', () => {
        lancamentoCounter++;
        const newLancamento = document.createElement('div');
        newLancamento.classList.add('lancamento-item');
        newLancamento.setAttribute('id', `lancamento-${lancamentoCounter}`);
        newLancamento.innerHTML = `
            <button type="button" class="btn-close remove-lancamento" aria-label="Close"></button>
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

    lancamentosContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-lancamento')) {
            e.target.closest('.lancamento-item').remove();
        }
    });


    // Inicialização
    fetchAndRenderStructures();
});