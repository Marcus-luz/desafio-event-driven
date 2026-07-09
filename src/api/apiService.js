const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Busca a lista de usuários para popular o <select>
export async function getUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return await response.json();
  } catch (error) {
    console.error('[API Error] getUsers:', error);
    throw error;
  }
}

// Busca os posts de um usuário e os comentários de cada post
export async function getPostsAndComments(userId) {
  try {
    // 1. Busca os posts do usuário selecionado
    const postsResponse = await fetch(`${BASE_URL}/posts?userId=${userId}`);
    if (!postsResponse.ok) throw new Error('Erro ao buscar posts');
    const posts = await postsResponse.json();

    // 2. Resolve o gargalo N+1 paralelizando a busca de comentários
    const commentsPromises = posts.map(post =>
      fetch(`${BASE_URL}/comments?postId=${post.id}`).then(res => res.json())
    );
    
    // Aguarda todas as requisições de comentários finalizarem ao mesmo tempo
    const commentsArrays = await Promise.all(commentsPromises);

    // 3. Mescla os comentários dentro do array de posts correspondente
    return posts.map((post, index) => ({
      ...post,
      comments: commentsArrays[index]
    }));
  } catch (error) {
    console.error('[API Error] getPostsAndComments:', error);
    throw error;
  }
}

// Simula o envio do relatório (evita o erro 404 de um endpoint inexistente)
export async function postReport(reportData) {
  console.log('Simulando envio de relatório para /reports...', reportData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'sucesso', mensagem: 'Relatório salvo com sucesso!' });
    }, 500);
  });
}