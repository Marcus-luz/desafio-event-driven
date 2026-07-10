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

// Simula o envio do relatório.
// A decisão aqui foi enviar um POST real para /posts do JSONPlaceholder: a API é fake
// (não persiste nada de verdade — sempre responde 201 com um id simulado),
// então continua sendo, na prática, uma "simulação de envio", só que agora
// exercitando de fato o ciclo de requisição/resposta/erro assíncrono.
export async function postReport(reportData) {
  if (!reportData || !reportData.userId) {
    throw new Error('Dados do relatório inválidos ou ausentes.');
  }

  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        title: `Relatorio_${reportData.userName}`,
        body: JSON.stringify(reportData),
        userId: reportData.userId
      })
    });

    if (!response.ok) {
      throw new Error(`Falha ao enviar relatório (status ${response.status})`);
    }

    // O JSONPlaceholder devolve um id fake (ex.: 101) simulando persistência
    const data = await response.json();

    return {
      status: 'sucesso',
      mensagem: 'Relatório salvo com sucesso!',
      id: data.id
    };
  } catch (error) {
    console.error('[API Error] postReport:', error);
    throw error;
  }
}