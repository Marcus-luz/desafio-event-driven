import { appState } from '../src/store/appState.js';
import { jest } from '@jest/globals';

describe('Testes de Impacto: Performance e Carga (Stress Test)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appState.filters = { minChars: 0, minPosts: 0 };
  });

  test('Deve processar 100.000 posts e calcular as métricas em menos de 50 milissegundos', () => {
    appState.currentUserId = 1;
    appState.currentUserName = 'Heavy User';
    
    // Gerador de Carga (Mock massivo)
    const massivePayload = [];
    for (let i = 0; i < 100000; i++) {
      massivePayload.push({
        id: i,
        body: "Texto simulado para teste de carga com mais de vinte caracteres", // 63 caracteres
        comments: [1, 2, 3] // 3 comentários
      });
    }
    appState.posts = massivePayload;

    // Marca o tempo inicial usando a API nativa de performance do Node
    const startTime = performance.now();

    // Executa a nossa lógica de negócio pesada
    appState.calculateMetrics();

    // Marca o tempo final
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`[Performance] 100.000 posts processados em: ${executionTime.toFixed(2)} ms`);

    // ASSERÇÃO DE IMPACTO: Garantimos que o algoritmo é veloz e não congela a interface (Time < 50ms)
    expect(executionTime).toBeLessThan(50);
  });
});