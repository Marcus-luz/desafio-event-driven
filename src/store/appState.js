import { eventBus } from '../events/eventBus.js';
import { getPostsAndComments } from '../api/apiService.js';

class AppState {
  constructor() {
    this.currentUserId = null;
    this.currentUserName = ''; // NOVO: Precisamos do nome para o CSV
    this.posts = [];
    this.filters = {
      minChars: 0,
      minPosts: 0
    };
  }

  // NOVO: Agora recebemos o nome também
  async loadUser(userId, userName) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    eventBus.emit('LOADING_START');
    
    try {
      this.posts = await getPostsAndComments(userId);
      this.calculateMetrics();
    } catch (error) {
      eventBus.emit('ERROR', 'Falha ao carregar os dados do utilizador.');
    } finally {
      eventBus.emit('LOADING_END');
    }
  }

  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.calculateMetrics();
  }

  calculateMetrics() {
    if (!this.currentUserId || this.posts.length === 0) return;

    // Filtra os posts pelo mínimo de caracteres
    const validPosts = this.posts.filter(post => post.body.length >= this.filters.minChars);
    
    const quantidadePosts = validPosts.length;
    let somaCaracteres = 0;
    let somaComentarios = 0;

    validPosts.forEach(post => {
      somaCaracteres += post.body.length;
      somaComentarios += post.comments.length;
    });

    // Calcula as médias (evitando divisão por zero)
    const mediaCaracteres = quantidadePosts > 0 ? (somaCaracteres / quantidadePosts).toFixed(2) : 0;
    const mediaComentarios = quantidadePosts > 0 ? (somaComentarios / quantidadePosts).toFixed(2) : 0;

    // Define o status
    const isUserActive = quantidadePosts >= this.filters.minPosts;

    const metrics = {
      userId: this.currentUserId,
      userName: this.currentUserName,
      quantidadePosts,
      mediaCaracteres,
      mediaComentarios,
      isUserActive
    };

    eventBus.emit('METRICS_UPDATED', metrics);
  }
}

export const appState = new AppState();