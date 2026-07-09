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
    // Captura o nome do utilizador no select
    const userName = e.target.options[e.target.selectedIndex].text; 
    
    if (userId) {
      appState.loadUser(userId, userName);
    } else {
      elements.results.innerHTML = ''; 
    }
  });

// Na função renderMetrics, mostramos as médias:
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
}