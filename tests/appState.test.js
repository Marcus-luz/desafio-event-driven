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
});