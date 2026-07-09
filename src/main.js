import { initUI } from './ui/render.js';
import { getUsers, postReport } from './api/apiService.js';
import { eventBus } from './events/eventBus.js';
// Importação atualizada para utilizar o gerador de Excel
import { downloadExcel } from './utils/exportExcel.js';

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

    const originalText = generateBtn.textContent;

    try {
      // Bloqueia o botão e dá feedback visual de geração
      generateBtn.textContent = 'Gerando Excel...';
      generateBtn.disabled = true;
      
      // Monta o nome do arquivo dinamicamente removendo espaços do nome do usuário
      const nomeArquivo = `Dashboard_${latestMetrics.userName.replace(/\s+/g, '_')}.xlsx`;
      
      // Faz o download do arquivo Excel
      await downloadExcel(latestMetrics, nomeArquivo);

      // Simula o POST para o endpoint /reports exigido pelo case
      generateBtn.textContent = 'Enviando dados...';
      await postReport(latestMetrics);
      
      // Mensagem de sucesso final
      generateBtn.textContent = 'Relatório Concluído!';
      
      // Restaura o botão após 2.5 segundos
      setTimeout(() => {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }, 2500);

    } catch (error) {
      console.error(error);
      alert('Erro ao processar o relatório.');
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
    }
  });
}

// Como type="module" já é adiado por padrão, podemos executar diretamente.
bootstrap();