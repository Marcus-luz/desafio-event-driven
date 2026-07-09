export function debounce(func, delay) {
  let timeoutId;
  
  return function (...args) {
    // Limpa o timer anterior se o usuário continuar digitando
    clearTimeout(timeoutId);
    
    // Cria um novo timer
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}