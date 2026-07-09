import { debounce } from '../src/utils/debounce.js';
import { jest } from '@jest/globals';

// Diz ao Jest para assumir o controle do "relógio" do sistema
jest.useFakeTimers();

describe('Utils: Debounce', () => {
  test('Deve aguardar o tempo de delay antes de executar a função', () => {
    const mockFunction = jest.fn();
    const debouncedFunction = debounce(mockFunction, 300);

    // O utilizador digita 3 vezes rápido
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    // O tempo ainda não passou, logo a função não deve ter sido chamada
    expect(mockFunction).not.toHaveBeenCalled();

    // Avançamos o relógio do sistema em 300 milissegundos
    jest.advanceTimersByTime(300);

    // Agora sim, a função deve ter sido chamada EXATAMENTE UMA VEZ
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});