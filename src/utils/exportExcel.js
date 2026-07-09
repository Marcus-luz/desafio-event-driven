export async function downloadExcel(metrics, filename = 'relatorio_usuario_dashboard.xlsx') {
  // A biblioteca ExcelJS já estará disponível globalmente devido à tag <script>
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Automação';
  
  // ==========================================
  // ABA 1: DASHBOARD
  // ==========================================
  const dashSheet = workbook.addWorksheet('Dashboard');
  
  // Adiciona título
  dashSheet.mergeCells('A1:D2');
  dashSheet.getCell('A1').value = 'Dashboard de Engajamento do Usuário';
  dashSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  dashSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
  dashSheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

  // Adiciona as métricas (KPIs)
  dashSheet.addRow([]);
  dashSheet.addRow(['Métricas do Perfil:', metrics.userName]);
  dashSheet.getCell('A4').font = { bold: true };

  dashSheet.addRow([]);
  dashSheet.addRow(['Status do Usuário:', metrics.isUserActive ? 'ATIVO 🟢' : 'INATIVO 🔴']);
  dashSheet.addRow(['Total de Posts (Válidos):', metrics.quantidadePosts]);
  dashSheet.addRow(['Média de Caracteres:', metrics.mediaCaracteres]);
  dashSheet.addRow(['Média de Comentários:', metrics.mediaComentarios]);

  // Estiliza as linhas de KPI
  for(let i = 6; i <= 9; i++) {
    dashSheet.getCell(`A${i}`).font = { bold: true, color: { argb: 'FF415B76' } };
    dashSheet.getCell(`B${i}`).alignment = { horizontal: 'left' };
  }
  
  dashSheet.getColumn('A').width = 30;
  dashSheet.getColumn('B').width = 25;


  // ==========================================
  // ABA 2: DADOS (Simulação para o relatório)
  // ==========================================
  const dataSheet = workbook.addWorksheet('Dados do Sistema');
  
  // Cabeçalho da Tabela
  dataSheet.columns = [
    { header: 'ID Usuário', key: 'id', width: 15 },
    { header: 'Nome', key: 'nome', width: 25 },
    { header: 'Posts Válidos', key: 'posts', width: 18 },
    { header: 'Méd. Caracteres', key: 'chars', width: 20 },
    { header: 'Méd. Comentários', key: 'comments', width: 20 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  // Aplica cor de fundo no cabeçalho da tabela de dados
  dataSheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF415B76' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center' };
  });

  // Adiciona a linha de dados do usuário atual
  const row = dataSheet.addRow({
    id: metrics.userId,
    nome: metrics.userName,
    posts: metrics.quantidadePosts,
    chars: metrics.mediaCaracteres,
    comments: metrics.mediaComentarios,
    status: metrics.isUserActive ? 'Ativo' : 'Inativo'
  });

  // Formatação condicional (Verde se ativo, Vermelho se inativo)
  const statusCell = row.getCell('status');
  statusCell.font = { bold: true };
  if (metrics.isUserActive) {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }; // Fundo Verde claro
    statusCell.font = { color: { argb: 'FF155724' }, bold: true }; // Texto Verde escuro
  } else {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }; // Fundo Vermelho claro
    statusCell.font = { color: { argb: 'FF721C24' }, bold: true }; // Texto Vermelho escuro
  }

  // ==========================================
  // EXPORTAÇÃO DO ARQUIVO (DOWNLOAD)
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Força o download no navegador
  saveAs(blob, filename);
}