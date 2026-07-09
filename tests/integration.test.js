/** @jest-environment jsdom */
import { initUI } from '../src/ui/render.js';
import { eventBus } from '../src/events/eventBus.js';
import { jest } from '@jest/globals';

describe('Testes de Impacto: Integração de UI (Event-Driven)', () => {
  beforeEach(() => {
    // 1. Preparamos um "Navegador Falso" (Mock do DOM) para o teste
    document.body.innerHTML = `
      <select id="userSelect"></select>
      <input id="minChars" value="0" />
      <input id="minPosts" value="0" />
      <div id="results"></div>
    `;
    
    // 2. Inicializamos a UI (agora é seguro, pois o DOM já foi criado acima)
    initUI();
  });

  test('O HTML deve sofrer impacto visual e exibir os dados quando o EventBus transmitir as métricas', () => {
    // Ação (Act): Simulamos o appState emitindo o evento
    const pacoteDeDados = {
      userId: 1,
      userName: 'Marcus Luz',
      quantidadePosts: 42,
      mediaCaracteres: "150.00",
      mediaComentarios: "5.00",
      isUserActive: true
    };

    eventBus.emit('METRICS_UPDATED', pacoteDeDados);

    // Asserção (Assert): Inspecionamos o DOM
    const resultsDiv = document.getElementById('results').innerHTML;
    
    expect(resultsDiv).toContain('Marcus Luz');
    expect(resultsDiv).toContain('42');
    expect(resultsDiv).toContain('Ativo');
  });

  test('O HTML deve mostrar mensagem vermelha de erro se o EventBus transmitir falha', () => {
    eventBus.emit('ERROR', 'Servidor fora do ar');

    const resultsDiv = document.getElementById('results').innerHTML;
    
    expect(resultsDiv).toContain('color: red;');
    expect(resultsDiv).toContain('Servidor fora do ar');
  });
});