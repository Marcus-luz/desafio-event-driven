import { apiCache } from '../cache/dataCache.js'; 

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Busca a lista de usuários para popular o <select>
export async function getUsers() {
  const CACHE_KEY = 'all_users';

  // 1. Verifica o Cache Modular
  if (apiCache.has(CACHE_KEY)) {
    console.log('[Cache Hit] Lista de usuários carregada da memória.');
    return apiCache.get(CACHE_KEY);
  }

  try {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    
    const data = await response.json();
    
    // 2. Salva no Cache Modular
    apiCache.set(CACHE_KEY, data);
    return data;
  } catch (error) {
    console.error('[API Error] getUsers:', error);
    throw error;
  }
}

// Busca os posts de um usuário e os comentários de cada post
export async function getPostsAndComments(userId) {
  const CACHE_KEY = `posts_user_${userId}`;

  // 1. Verifica o Cache Modular
  if (apiCache.has(CACHE_KEY)) {
    console.log(`[Cache Hit] Dados do usuário ${userId} carregados da memória.`);
    return apiCache.get(CACHE_KEY);
  }

  try {
    const postsResponse = await fetch(`${BASE_URL}/posts?userId=${userId}`);
    if (!postsResponse.ok) throw new Error('Erro ao buscar posts');
    const posts = await postsResponse.json();

    const commentsPromises = posts.map(post =>
      fetch(`${BASE_URL}/comments?postId=${post.id}`).then(res => res.json())
    );
    
    const commentsArrays = await Promise.all(commentsPromises);

    const result = posts.map((post, index) => ({
      ...post,
      comments: commentsArrays[index]
    }));

    // 2. Salva no Cache Modular
    apiCache.set(CACHE_KEY, result);
    return result;

  } catch (error) {
    console.error('[API Error] getPostsAndComments:', error);
    throw error;
  }
}

// Simula o envio do relatório
export async function postReport(reportData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'sucesso', mensagem: 'Relatório salvo com sucesso!' });
    }, 500);
  });
}