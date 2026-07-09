import { initUI } from './ui/render.js';
import { getUsers, postReport } from './api/apiService.js';
import { eventBus } from './events/eventBus.js';
import { downloadCSV } from './utils/exportCSV.js';

async function bootstrap() {
  // 1. Inicializa os ouvintes da interface
  initUI();

  const userSelect = document.getElementById('userSelect');
  const generateBtn = document.getElementById('generateReport');

  // 2. Busca os usuários na API e popula o campo <select>
  try {
    const users = await getUsers();
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Falha crítica ao inicializar usuários.');
  }

  // 3. Captura os dados mais recentes sempre que o estado atualizar
  let latestMetrics = null;
  eventBus.on('METRICS_UPDATED', (metrics) => {
    latestMetrics = metrics;
  });

  // 4. Lógica de clique no botão de gerar relatório
  generateBtn.addEventListener('click', async () => {
    if (!latestMetrics) {
      alert('Selecione um usuário e aguarde o cálculo das métricas antes de gerar o relatório.');
      return;
    }

    // Faz o download do arquivo CSV
    downloadCSV(latestMetrics);

    // Simula o POST para o endpoint /reports exigido pelo case
    try {
      const originalText = generateBtn.textContent;
      generateBtn.textContent = 'Enviando dados...';
      generateBtn.disabled = true;
      
      await postReport(latestMetrics);
      
      generateBtn.textContent = 'Relatório Enviado!';
      setTimeout(() => {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }, 2000);
    } catch (error) {
      alert('Erro ao processar o relatório.');
      generateBtn.disabled = false;
    }
  });
}

// Garante que o script só rode quando o HTML estiver 100% carregado na tela
document.addEventListener('DOMContentLoaded', bootstrap);