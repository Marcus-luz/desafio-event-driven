import { eventBus } from '../events/eventBus.js';
import { getPostsAndComments, getUsers } from '../api/apiService.js';
import { calculateUserMetrics } from '../utils/metricsCalculator.js';

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

  // Busca TODOS os usuários da base (não apenas os já clicados na tela)
  // e calcula as métricas de cada um, aplicando os filtros atuais.
  async getAllSystemMetrics() {
    const users = await getUsers();

    const metricsPromises = users.map(async (user) => {
      try {
        const posts = await getPostsAndComments(user.id);
        return calculateUserMetrics(posts, this.filters, user.id, user.name);
      } catch (error) {
        console.error(`[getAllSystemMetrics] Falha ao processar usuário ${user.id}:`, error);
        return null; // Um usuário com falha não deve derrubar o relatório inteiro
      }
    });

    const results = await Promise.all(metricsPromises);
    return results.filter(Boolean); // Remove eventuais falhas (null)
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

    // Delega a matemática das médias para a função pura compartilhada,
    const metrics = calculateUserMetrics(
      this.posts,
      this.filters,
      this.currentUserId,
      this.currentUserName
    );

    // Registra/atualiza este usuário na lista de analisados da sessão,
    // para que o relatório final possa consolidar todos, não só o atual.
    this.analyzedUsers.set(this.currentUserId, metrics);

    // Avisa a UI que os cálculos estão prontos
    eventBus.emit('METRICS_UPDATED', metrics);
  }
}

export const appState = new AppState();