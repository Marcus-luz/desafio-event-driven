import { eventBus } from '../events/eventBus.js';
import { appState } from '../store/appState.js';
import { debounce } from '../utils/debounce.js';

// Cache dos elementos do DOM para evitar buscas repetidas
const elements = {
  userSelect: document.getElementById('userSelect'),
  minChars: document.getElementById('minChars'),
  minPosts: document.getElementById('minPosts'),
  results: document.getElementById('results')
};

export function initUI() {
  // Configura os inputs com o debounce para proteger a performance
  const handleInput = debounce(() => {
    appState.updateFilters({
      minChars: Number(elements.minChars.value) || 0,
      minPosts: Number(elements.minPosts.value) || 0
    });
  }, 300);

  elements.minChars.addEventListener('input', handleInput);
  elements.minPosts.addEventListener('input', handleInput);

  // Escuta a troca de usuário no select
  elements.userSelect.addEventListener('change', (e) => {
    const userId = e.target.value;
    if (userId) {
      appState.loadUser(userId);
    } else {
      elements.results.innerHTML = ''; // Limpa a tela se voltar para a opção vazia
    }
  });

  // Assina os eventos orquestrados pelo EventBus
  eventBus.on('LOADING_START', () => {
    elements.results.innerHTML = '<p>Carregando e processando dados...</p>';
  });

  eventBus.on('METRICS_UPDATED', renderMetrics);
  
  eventBus.on('ERROR', (msg) => {
    elements.results.innerHTML = `<p style="color: red;">Erro: ${msg}</p>`;
  });
}

// Função pura dedicada a atualizar a div de resultados
function renderMetrics(metrics) {
  elements.results.innerHTML = `
    <h3>Métricas Calculadas</h3>
    <ul>
      <li>Total de Posts do Usuário: <strong>${metrics.totalPosts}</strong></li>
      <li>Posts Válidos (filtro de caracteres): <strong>${metrics.validPostsCount}</strong></li>
      <li>Total de Comentários (nos posts válidos): <strong>${metrics.totalComments}</strong></li>
      <li>Status do Usuário: <strong>${metrics.isUserActive ? 'Ativo' : 'Inativo'}</strong></li>
    </ul>
  `;
}