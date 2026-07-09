import { getUsers } from '../src/api/apiService.js';
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