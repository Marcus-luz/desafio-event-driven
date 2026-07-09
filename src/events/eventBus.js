class EventBus {
  constructor() {
    this.listeners = {};
  }

  // Registra um ouvinte para um evento específico
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Emite um evento, disparando todos os callbacks registrados
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// Exportamos uma instância única para ser usada globalmente no projeto
export const eventBus = new EventBus();