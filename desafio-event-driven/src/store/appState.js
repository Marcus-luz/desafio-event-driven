import { eventBus } from '../events/eventBus.js';
import { getPostsAndComments } from '../api/apiService.js';

class AppState {
  constructor() {
    this.currentUserId = null;
    this.posts = []; // Cache dos posts carregados
    this.filters = {
      minChars: 0,
      minPosts: 0
    };
  }

  // Acionado quando o usuário escolhe alguém no <select>
  async loadUser(userId) {
    this.currentUserId = userId;
    eventBus.emit('LOADING_START');
    
    try {
      this.posts = await getPostsAndComments(userId);
      this.calculateMetrics(); // Calcula e atualiza a tela
    } catch (error) {
      eventBus.emit('ERROR', 'Falha ao carregar os dados do usuário.');
    } finally {
      eventBus.emit('LOADING_END');
    }
  }

  // Acionado quando o usuário digita nos campos de filtro
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.calculateMetrics(); // Recalcula instantaneamente usando o cache em memória
  }

  // Onde a mágica matemática acontece
  calculateMetrics() {
    if (!this.currentUserId || this.posts.length === 0) return;

    let validPostsCount = 0;
    let totalComments = 0;

    // Filtra e calcula com base nas regras de negócio (minChars)
    this.posts.forEach(post => {
      if (post.body.length >= this.filters.minChars) {
        validPostsCount++;
        totalComments += post.comments.length;
      }
    });

    // Define se o usuário é "ativo" baseado na métrica (minPosts)
    const isUserActive = validPostsCount >= this.filters.minPosts;

    const metrics = {
      totalPosts: this.posts.length,
      validPostsCount,
      totalComments,
      isUserActive,
      // Exportamos os filtros atuais para ajudar na geração do relatório depois
      currentFilters: this.filters 
    };

    // Avisa a UI que os cálculos estão prontos para serem renderizados
    eventBus.emit('METRICS_UPDATED', metrics);
  }
}

export const appState = new AppState();