import { getUsers, postReport } from '../src/api/apiService.js';
import { apiCache } from '../src/cache/dataCache.js';
import { jest } from '@jest/globals'; 

global.fetch = jest.fn();

describe('ApiService: Integração de Rede e Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiCache.clear();
  });

  test('Deve buscar usuários na API e salvar no Cache', async () => {
    const mockUsers = [{ id: 1, name: 'Marcus' }];
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    const users = await getUsers();
    
    expect(users).toEqual(mockUsers);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(apiCache.has('all_users')).toBe(true);
  });

  test('Deve retornar usuários do Cache sem chamar o fetch novamente', async () => {
    apiCache.set('all_users', [{ id: 2, name: 'Cache User' }]);

    const users = await getUsers();

    expect(users[0].name).toBe('Cache User');
    expect(global.fetch).toHaveBeenCalledTimes(0); 
  });
});

describe('ApiService: postReport (envio real via POST /posts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const reportDataValido = {
    userId: 1,
    userName: 'Marcus Luz',
    quantidadePosts: 5,
    mediaCaracteres: '120.00',
    mediaComentarios: '3.00',
    isUserActive: true
  };

  test('Deve enviar um POST real para /posts com o payload correto e retornar o id simulado', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 101 })
    });

    const result = await postReport(reportDataValido);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/posts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': expect.stringContaining('application/json') })
      })
    );
    expect(result).toEqual(expect.objectContaining({ status: 'sucesso', id: 101 }));
  });

  test('Deve rejeitar (throw) quando a API responder com status de erro', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(postReport(reportDataValido)).rejects.toThrow();
  });

  test('Deve rejeitar (throw) sem sequer chamar fetch se reportData for inválido', async () => {
    await expect(postReport(null)).rejects.toThrow('Dados do relatório inválidos ou ausentes.');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});