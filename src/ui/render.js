import { eventBus } from '../events/eventBus.js';
import { appState } from '../store/appState.js';
import { debounce } from '../utils/debounce.js';

// Declara o cache vazio
const elements = {};

export function initUI() {
  // Preenche o cache apenas quando a UI for de fato inicializada!
  elements.userSelect = document.getElementById('userSelect');
  elements.minChars = document.getElementById('minChars');
  elements.minPosts = document.getElementById('minPosts');
  elements.results = document.getElementById('results');

  // Configura os inputs com o debounce
  const handleInput = debounce(() => {
    appState.updateFilters({
      minChars: Number(elements.minChars.value) || 0,
      minPosts: Number(elements.minPosts.value) || 0
    });
  }, 300);

  elements.minChars.addEventListener('input', handleInput);
  elements.minPosts.addEventListener('input', handleInput);

  // Escuta a troca de utilizador no select
  elements.userSelect.addEventListener('change', (e) => {
    const userId = e.target.value;
    if (userId) {
      const userName = e.target.options[e.target.selectedIndex].text;
      appState.loadUser(userId, userName);
    } else {
      elements.results.innerHTML = ''; 
    }
  });

  // Assina os eventos
  eventBus.on('LOADING_START', () => {
    elements.results.innerHTML = '<p>Carregando e processando dados...</p>';
  });

  eventBus.on('METRICS_UPDATED', renderMetrics);
  
  eventBus.on('ERROR', (msg) => {
    elements.results.innerHTML = `<p style="color: red;">Erro: ${msg}</p>`;
  });
}

function renderMetrics(metrics) {
  elements.results.innerHTML = `
    <h3>Métricas Calculadas para ${metrics.userName}</h3>
    <ul>
      <li>Quantidade de Posts (Válidos): <strong>${metrics.quantidadePosts}</strong></li>
      <li>Média de Caracteres: <strong>${metrics.mediaCaracteres}</strong></li>
      <li>Média de Comentários: <strong>${metrics.mediaComentarios}</strong></li>
      <li>Status do Utilizador: <strong>${metrics.isUserActive ? 'Ativo' : 'Inativo'}</strong></li>
    </ul>
  `;
}