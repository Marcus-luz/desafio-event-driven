import { eventBus } from '../events/eventBus.js';
import { getPostsAndComments } from '../api/apiService.js';

class AppState {
  constructor() {
    this.currentUserId = null;
    this.currentUserName = '';
    this.posts = []; 
    this.filters = {
      minChars: 0,
      minPosts: 0
    };
    // Guarda as últimas métricas calculadas de CADA usuário já analisado
    // na sessão (chave = userId), para que o relatório final possa
    // consolidar todos os perfis, e não apenas o selecionado no momento.
    this.analyzedUsers = new Map();
  }

  // Retorna as métricas de todos os usuários já analisados nesta sessão,
  // na ordem em que foram calculadas.
  getAllMetrics() {
    return Array.from(this.analyzedUsers.values());
  }

  // Acionado quando o utilizador escolhe alguém no <select>
  async loadUser(userId, userName) {
    this.currentUserId = userId;
    this.currentUserName = userName; // Guardamos o nome para o CSV
    eventBus.emit('LOADING_START');
    
    try {
      this.posts = await getPostsAndComments(userId);
      this.calculateMetrics(); // Calcula e atualiza a tela
    } catch (error) {
      eventBus.emit('ERROR', 'Falha ao carregar os dados do utilizador.');
    } finally {
      eventBus.emit('LOADING_END');
    }
  }

  // Acionado quando o utilizador digita nos campos de filtro
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.calculateMetrics();
  }

  // matemática das médias
  calculateMetrics() {
  
    if (!this.currentUserId) return;

    // Filtra os posts pelo mínimo de caracteres
    const validPosts = this.posts.filter(post => post.body.length >= this.filters.minChars);
    
    const quantidadePosts = validPosts.length;
    let somaCaracteres = 0;
    let somaComentarios = 0;

    validPosts.forEach(post => {
      somaCaracteres += post.body.length;
      somaComentarios += post.comments.length;
    });

    // Calcula as médias (evitando divisão por zero se não houver posts válidos)
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

    // Registra/atualiza este usuário na lista de analisados da sessão,
    // para que o relatório final possa consolidar todos, não só o atual.
    this.analyzedUsers.set(this.currentUserId, metrics);

    // Avisa a UI que os cálculos estão prontos
    eventBus.emit('METRICS_UPDATED', metrics);
  }
}

export const appState = new AppState();