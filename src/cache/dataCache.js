class DataCache {
  constructor() {
    this.memory = new Map();
  }

  // Verifica se o dado existe
  has(key) {
    return this.memory.has(key);
  }

  // Pega o dado
  get(key) {
    return this.memory.get(key);
  }

  // Guarda o dado
  set(key, value) {
    this.memory.set(key, value);
  }

  // Limpa o cache (útil se quisermos criar um botão de "Atualizar Dados" no futuro)
  clear() {
    this.memory.clear();
  }
}

// Exporta uma instância única (Singleton) para a aplicação inteira
export const apiCache = new DataCache();