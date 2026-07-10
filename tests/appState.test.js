import { appState } from '../src/store/appState.js';
import { eventBus } from '../src/events/eventBus.js';
import { jest } from '@jest/globals'; 

describe('AppState: Regras de Negócio', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    
    // Substitui o jest.mock e evita o erro do require()
    jest.spyOn(eventBus, 'emit').mockImplementation(() => {});
    
    appState.posts = [];
    appState.filters = { minChars: 0, minPosts: 0 };
    appState.analyzedUsers.clear();
  });

  test('Deve calcular médias ignorando posts descartados pelo filtro', () => {
    appState.currentUserId = 1;
    appState.posts = [
      { id: 1, body: "12345", comments: [1] }, // 5 chars
      { id: 2, body: "12345678901234567890", comments: [1, 2, 3] } // 20 chars
    ];
    
    appState.updateFilters({ minChars: 10, minPosts: 0 });

    expect(eventBus.emit).toHaveBeenCalledWith('METRICS_UPDATED', expect.objectContaining({
      quantidadePosts: 1,
      mediaCaracteres: "20.00",
      mediaComentarios: "3.00",
      isUserActive: true
    }));
  });

  test('Deve proteger contra divisão por zero (NaN) se nenhum post for válido', () => {
    appState.currentUserId = 1;
    appState.posts = [ { id: 1, body: "curto", comments: [] } ];
    
    appState.updateFilters({ minChars: 50, minPosts: 1 });

    expect(eventBus.emit).toHaveBeenCalledWith('METRICS_UPDATED', expect.objectContaining({
      quantidadePosts: 0,
      mediaCaracteres: 0,
      mediaComentarios: 0,
      isUserActive: false
    }));
  });

  test('Deve emitir METRICS_UPDATED mesmo quando o usuário tem zero posts totais (guarda corrigida)', () => {
    // Antes da correção, `calculateMetrics()` retornava em silêncio (sem
    // emitir nada) quando `this.posts.length === 0`, mesmo com um usuário
    // selecionado. Isso deixava a UI travada na última métrica exibida.
    appState.currentUserId = 5;
    appState.currentUserName = 'Usuário Sem Posts';
    appState.posts = [];

    appState.calculateMetrics();

    // Com filtro minPosts=0 (padrão), 0 posts >= 0 é tecnicamente "ativo" —
    // o ponto do teste não é o valor de isUserActive, e sim confirmar que o
    // evento É emitido (antes da correção, não era emitido nada aqui).
    expect(eventBus.emit).toHaveBeenCalledWith('METRICS_UPDATED', expect.objectContaining({
      quantidadePosts: 0,
      mediaCaracteres: 0,
      mediaComentarios: 0
    }));
  });

  test('getAllMetrics() deve consolidar as métricas de todos os usuários já analisados', () => {
    appState.currentUserId = 1;
    appState.currentUserName = 'Usuário 1';
    appState.posts = [{ id: 1, body: 'a'.repeat(20), comments: [1, 2] }];
    appState.calculateMetrics();

    appState.currentUserId = 2;
    appState.currentUserName = 'Usuário 2';
    appState.posts = [{ id: 2, body: 'b'.repeat(30), comments: [1] }];
    appState.calculateMetrics();

    const todasAsMetricas = appState.getAllMetrics();

    expect(todasAsMetricas).toHaveLength(2);
    expect(todasAsMetricas.map(m => m.userId)).toEqual([1, 2]);
  });
});