// Função pura de cálculo de métricas, extraída do appState.js para poder
// ser reaproveitada tanto no fluxo normal (usuário selecionado na tela)
// quanto no fluxo de exportação "todos os usuários da base" — sem duplicar
// a matemática das médias em dois lugares diferentes.
//

export function calculateUserMetrics(posts, filters, userId, userName) {
  const validPosts = posts.filter(post => post.body.length >= filters.minChars);

  const quantidadePosts = validPosts.length;
  let somaCaracteres = 0;
  let somaComentarios = 0;

  validPosts.forEach(post => {
    somaCaracteres += post.body.length;
    somaComentarios += post.comments.length;
  });

  const mediaCaracteres = quantidadePosts > 0 ? (somaCaracteres / quantidadePosts).toFixed(2) : 0;
  const mediaComentarios = quantidadePosts > 0 ? (somaComentarios / quantidadePosts).toFixed(2) : 0;

  const isUserActive = quantidadePosts >= filters.minPosts;

  return {
    userId,
    userName,
    quantidadePosts,
    mediaCaracteres,
    mediaComentarios,
    isUserActive
  };
}
