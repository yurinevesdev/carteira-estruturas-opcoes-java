document.addEventListener('DOMContentLoaded', function () {

    // --- API Endpoints ---
    const STRUCTURES_URL = '/structures';
    const OPERATIONS_URL = '/operations';

    // --- Cache de Estruturas ---
    let allStructures = [];
    let currentFilter = 'Todas';

    // --- Elementos do DOM ---
    const dashboard = document.getElementById('structures-dashboard');
    const overallSummaryEl = document.getElementById('overall-summary');
    const updatePricesBtn = document.getElementById('update-prices-btn');
    const statusFilterTabs = document.getElementById('status-filter-tabs');

    // --- Modais ---
    const addStructureModal = new bootstrap.Modal(document.getElementById('add-structure-modal'));
    const detailsModal = new bootstrap.Modal(document.getElementById('details-modal'));
    const closeOperationModal = new bootstrap.Modal(document.getElementById('close-operation-modal'));

    // --- Formulários ---
    const structureForm = document.getElementById('structure-form');
    const closeOperationForm = document.getElementById('close-operation-form');

    // --- Elementos dos Modais ---
    const detailsModalTitle = document.getElementById('details-modal-title');
    const detailsModalBody = document.getElementById('details-modal-body');
    const deleteStructureBtn = document.getElementById('delete-structure-btn');
    const lancamentosContainer = document.getElementById('lancamentos-container');
    const addLancamentoBtn = document.getElementById('add-lancamento');

    // --- Estado ---
    let currentStructureId = null;
    let currentOperationId = null;
    let lancamentoCounter = 0;

    // --- INICIALIZAÇÃO ---
    async function initialize() {
        addEventListeners();
        await fetchAllData();
    }

    async function fetchAllData() {
        await Promise.all([
            fetchAndRenderStructures(),
            fetchAndRenderSummary()
        ]);
    }

    // --- RENDERIZAÇÃO E DADOS ---

    async function fetchAndRenderStructures() {
        try {
            const response = await fetch(STRUCTURES_URL);
            allStructures = await response.json();
            renderFilteredStructures();
        } catch (error) {
            console.error('Erro ao buscar estruturas:', error);
        }
    }

    async function fetchAndRenderSummary() {
        try {
            const response = await fetch(`${STRUCTURES_URL}/summary`);
            const summary = await response.json();
            const summaryClass = summary > 0 ? 'result-positive' : summary < 0 ? 'result-negative' : 'result-neutral';
            overallSummaryEl.textContent = `R$ ${summary.toFixed(2)}`;
            overallSummaryEl.className = `card-title ${summaryClass}`;
        } catch (error) {
            console.error('Erro ao buscar resumo:', error);
        }
    }

    function renderFilteredStructures() {
        dashboard.innerHTML = '';
        const filtered = allStructures.filter(s => currentFilter === 'Todas' || s.status === currentFilter);
        filtered.forEach(renderStructureCard);
    }

    function renderStructureCard(structure) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        const result = structure.totalResultado;
        const resultClass = result > 0 ? 'result-positive' : result < 0 ? 'result-negative' : 'result-neutral';
        const statusClass = structure.status === 'Finalizada' ? 'status-finalizada' : 'status-em-andamento';

        card.innerHTML = `
            <div class="card h-100 shadow-sm" data-id="${structure.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5 class="card-title">${structure.estrategia}</h5>
                        <span class="status-badge ${statusClass}">${structure.status}</span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">${structure.ativo}</h6>
                    <p class="card-text fs-5 mt-3">Resultado: <strong class="${resultClass}">R$ ${result.toFixed(2)}</strong></p>
                </div>
            </div>
        `;
        dashboard.appendChild(card);
        card.querySelector('.card').addEventListener('click', () => showDetails(structure.id));
    }

    function createDetailsView(structure) {
        const result = structure.totalResultado;
        const resultClass = result > 0 ? 'result-positive' : result < 0 ? 'result-negative' : 'result-neutral';

        const operationsHtml = structure.lancamentos.map(op => {
            const opResult = op.precoSaida > 0 ? op.resultado : (op.operacao.toLowerCase() === 'venda' ? (op.precoEntrada - op.precoAtual) * op.quantidade : (op.precoAtual - op.precoEntrada) * op.quantidade);
            const opResultClass = opResult > 0 ? 'result-positive' : opResult < 0 ? 'result-negative' : 'result-neutral';
            const closeButton = op.precoSaida <= 0 ? `<button class="btn btn-sm btn-success close-op-btn" data-op-id="${op.id}">Encerrar</button>` : 'Finalizada';

            return `
                <tr>
                    <td>${op.ativo}</td>
                    <td>${op.operacao}</td>
                    <td>${op.quantidade}</td>
                    <td>R$ ${op.precoEntrada.toFixed(2)}</td>
                    <td>R$ ${op.precoSaida > 0 ? op.precoSaida.toFixed(2) : op.precoAtual.toFixed(2)}</td>
                    <td class="${opResultClass}"><strong>R$ ${opResult.toFixed(2)}</strong></td>
                    <td>${closeButton}</td>
                </tr>
            `;
        }).join('');

        return `
            <h6>${structure.estrategia} - ${structure.ativo}</h6>
            <table class="table table-sm table-striped mt-3">
                <thead><tr><th>Ativo</th><th>Operação</th><th>Qtd.</th><th>Preço Entrada</th><th>Preço Saída/Atual</th><th>Resultado</th><th>Ações</th></tr></thead>
                <tbody>${operationsHtml}</tbody>
            </table>
            <hr>
            <div class="text-end fs-5">Resultado Total: <strong class="${resultClass}">R$ ${result.toFixed(2)}</strong></div>
        `;
    }

    // --- MANIPULADORES DE EVENTOS ---

    function addEventListeners() {
        updatePricesBtn.addEventListener('click', handleUpdatePrices);
        statusFilterTabs.addEventListener('click', handleFilterChange);
        structureForm.addEventListener('submit', handleCreateStructure);
        deleteStructureBtn.addEventListener('click', handleDeleteStructure);
        detailsModalBody.addEventListener('click', handleOpenCloseOperationModal);
        closeOperationForm.addEventListener('submit', handleCloseOperation);
        addLancamentoBtn.addEventListener('click', handleAddLancamento);
        lancamentosContainer.addEventListener('click', handleRemoveLancamento);
    }

    async function handleUpdatePrices() {
        updatePricesBtn.disabled = true;
        updatePricesBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Atualizando...';
        try {
            await fetch(`${STRUCTURES_URL}/update-prices`, { method: 'POST' });
            await fetchAllData();
            // Idealmente, adicionar um toast/notificação de sucesso
        } catch (error) {
            console.error('Erro ao atualizar preços:', error);
        } finally {
            updatePricesBtn.disabled = false;
            updatePricesBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Atualizar Cotações';
        }
    }

    async function handleCreateStructure(e) {
        e.preventDefault();
        const lancamentos = Array.from(lancamentosContainer.querySelectorAll('.lancamento-item')).map(item => ({
            ativo: item.querySelector('.lancamento-ativo').value,
            tipo: item.querySelector('.lancamento-tipo').value,
            operacao: item.querySelector('.lancamento-operacao').value,
            quantidade: parseInt(item.querySelector('.lancamento-quantidade').value)
        }));

        const structureData = {
            estrategia: document.getElementById('estrategia').value,
            ativo: document.getElementById('ativo').value,
            dataEntrada: document.getElementById('dataEntrada').value,
            lancamentos: lancamentos
        };

        try {
            await fetch(STRUCTURES_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(structureData)
            });
            addStructureModal.hide();
            structureForm.reset();
            lancamentosContainer.innerHTML = '';
            await fetchAllData();
        } catch (error) {
            console.error('Erro ao criar estrutura:', error);
        }
    }

    async function handleDeleteStructure() {
        if (!currentStructureId || !confirm('Tem certeza que deseja excluir esta estrutura?')) return;

        try {
            await fetch(`${STRUCTURES_URL}/${currentStructureId}`, { method: 'DELETE' });
            detailsModal.hide();
            await fetchAllData();
        } catch (error) {
            console.error('Erro ao excluir estrutura:', error);
        }
    }

    function handleAddLancamento() {
        lancamentoCounter++;
        const newLancamento = document.createElement('div');
        newLancamento.className = 'lancamento-item';
        newLancamento.innerHTML = `
            <button type="button" class="btn-close remove-lancamento" aria-label="Close"></button>
            <div class="row">
                <div class="col-md-3 mb-3"><input type="text" class="form-control lancamento-ativo" placeholder="Ativo" required></div>
                <div class="col-md-3 mb-3"><input type="text" class="form-control lancamento-tipo" placeholder="Tipo (Call/Put)" required></div>
                <div class="col-md-3 mb-3"><input type="text" class="form-control lancamento-operacao" placeholder="Operação (Compra/Venda)" required></div>
                <div class="col-md-3 mb-3"><input type="number" class="form-control lancamento-quantidade" placeholder="Quantidade" required></div>
            </div>
        `;
        lancamentosContainer.appendChild(newLancamento);
    }

    function handleRemoveLancamento(e) {
        if (e.target.classList.contains('remove-lancamento')) {
            e.target.closest('.lancamento-item').remove();
        }
    }

    function handleFilterChange(e) {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            currentFilter = e.target.dataset.status;
            statusFilterTabs.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            renderFilteredStructures();
        }
    }

    async function showDetails(structureId) {
        currentStructureId = structureId;
        try {
            const response = await fetch(`${STRUCTURES_URL}/${structureId}`);
            const structure = await response.json();
            detailsModalTitle.textContent = `Detalhes: ${structure.estrategia}`;
            detailsModalBody.innerHTML = createDetailsView(structure);
            detailsModal.show();
        } catch (error) {
            console.error(`Erro ao buscar detalhes:`, error);
        }
    }

    function handleOpenCloseOperationModal(e) {
        if (e.target.classList.contains('close-op-btn')) {
            currentOperationId = e.target.dataset.opId;
            closeOperationForm.reset();
            closeOperationModal.show();
        }
    }

    async function handleCloseOperation(e) {
        e.preventDefault();
        const precoSaida = parseFloat(document.getElementById('precoSaida').value);
        if (!currentOperationId || isNaN(precoSaida)) return;

        try {
            await fetch(`${OPERATIONS_URL}/${currentOperationId}/close`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ precoSaida })
            });
            closeOperationModal.hide();
            await showDetails(currentStructureId); // Refresh a modal de detalhes
            await fetchAllData(); // Refresh o dashboard e o resumo
        } catch (error) {
            console.error('Erro ao encerrar operação:', error);
        }
    }

    // --- INICIAR APLICAÇÃO ---
    initialize();
});
