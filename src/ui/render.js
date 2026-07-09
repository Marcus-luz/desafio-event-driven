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

  // Escuta a troca de utilizador no select
  elements.userSelect.addEventListener('change', (e) => {
    const userId = e.target.value;
    
    if (userId) {
      // Captura o NOME do utilizador selecionado para enviar ao State
      const userName = e.target.options[e.target.selectedIndex].text;
      appState.loadUser(userId, userName);
    } else {
      elements.results.innerHTML = ''; // Limpa a tela se voltar para a opção vazia
    }
  });

  // Assina os eventos orquestrados pelo EventBus
  eventBus.on('LOADING_START', () => {
    elements.results.innerHTML = '<p>Carregando e processando dados...</p>';
  });

  // É fundamental que esta linha exista para a tela atualizar!
  eventBus.on('METRICS_UPDATED', renderMetrics);
  
  eventBus.on('ERROR', (msg) => {
    elements.results.innerHTML = `<p style="color: red;">Erro: ${msg}</p>`;
  });
}

// Função pura dedicada a atualizar a div de resultados com as MÉDIAS
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