export async function downloadExcel(metrics, filename = 'relatorio_usuario_dashboard.xlsx') {
  // A biblioteca ExcelJS já estará disponível globalmente devido à tag <script>
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Automação';
  
  // ==========================================
  // ABA 1: DASHBOARD VISUAL
  // ==========================================
  const dashSheet = workbook.addWorksheet('Dashboard', {
    views: [{ showGridLines: false }] // Remove as linhas de grade para visual de sistema
  });

  // Ajusta a largura das colunas para estruturar os nossos "Cards"
  dashSheet.columns = [
    { width: 4 },  // A: Apenas espaçamento lateral
    { width: 25 }, // B: Card 1 / Textos
    { width: 25 }, // C: Card 2 / Gráficos
    { width: 25 }, // D: Card 3
    { width: 25 }  // E: Card 4
  ];

  // 1. TÍTULO PRINCIPAL
  dashSheet.mergeCells('B2:E3');
  const title = dashSheet.getCell('B2');
  title.value = `RELATÓRIO EXECUTIVO DE ENGAJAMENTO`;
  title.font = { name: 'Segoe UI', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A93' } }; // Azul escuro
  title.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. INFORMAÇÕES DO USUÁRIO
  dashSheet.getCell('B5').value = 'PERFIL ANALISADO:';
  dashSheet.getCell('B5').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF7F8C8D' } };
  
  dashSheet.getCell('C5').value = metrics.userName.toUpperCase();
  dashSheet.getCell('C5').font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF2C3E50' } };

  // 3. FUNÇÃO PARA DESENHAR CARDS DE KPI (Indicadores de Performance)
  const createCard = (col, titleText, valueText, titleColor, valueColor) => {
    const titleCell = dashSheet.getCell(`${col}7`);
    const valueCell = dashSheet.getCell(`${col}8`);

    // Topo do Card (Título)
    titleCell.value = titleText;
    titleCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: titleColor } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Corpo do Card (Valor numérico gigante)
    valueCell.value = valueText;
    valueCell.font = { name: 'Segoe UI', size: 22, bold: true, color: { argb: valueColor } };
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }; // Fundo cinza bem claro
    valueCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Bordas para parecer uma caixa
    const borderStyle = { style: 'medium', color: { argb: titleColor } };
    titleCell.border = { top: borderStyle, left: borderStyle, right: borderStyle };
    valueCell.border = { bottom: borderStyle, left: borderStyle, right: borderStyle };
  };

  // Desenhando os 4 Cards de KPI
  createCard('B', 'TOTAL DE POSTS', metrics.quantidadePosts, 'FF34495E', 'FF2C3E50');
  createCard('C', 'MÉDIA CARACTERES', metrics.mediaCaracteres, 'FF2980B9', 'FF2980B9');
  createCard('D', 'MÉDIA COMENTÁRIOS', metrics.mediaComentarios, 'FF8E44AD', 'FF8E44AD');
  
  const isAtivo = metrics.isUserActive;
  createCard('E', 'STATUS', isAtivo ? 'ATIVO' : 'INATIVO', isAtivo ? 'FF27AE60' : 'FFC0392B', isAtivo ? 'FF27AE60' : 'FFC0392B');

  // Ajusta a altura da linha dos valores para dar volume ao Card
  dashSheet.getRow(8).height = 45; 

  // 4. SEÇÃO DE GRÁFICOS IN-CELL (Data Bars)
  dashSheet.getCell('B11').value = 'Desempenho Relativo (Escala de Volume)';
  dashSheet.getCell('B11').font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF2C3E50' } };

  dashSheet.getCell('B13').value = 'Volume Médio de Caracteres';
  dashSheet.getCell('B13').font = { name: 'Segoe UI', size: 11, bold: true };
  dashSheet.getCell('C13').value = Number(metrics.mediaCaracteres); // Convertido para número para o gráfico funcionar

  dashSheet.getCell('B14').value = 'Volume Médio de Comentários';
  dashSheet.getCell('B14').font = { name: 'Segoe UI', size: 11, bold: true };
  dashSheet.getCell('C14').value = Number(metrics.mediaComentarios);

  // Mágica aqui: Adiciona Barras de Dados (DataBars) geradas pelo próprio Excel nas células!
  dashSheet.addConditionalFormatting({
    ref: 'C13:C14',
    rules: [
      {
        type: 'dataBar',
        cfvo: [{ type: 'min' }, { type: 'max' }],
        color: { argb: 'FF3498DB' } // Azul claro
      }
    ]
  });


  // ==========================================
  // ABA 2: DADOS (Tabela Oculta/Detalhada)
  // ==========================================
  const dataSheet = workbook.addWorksheet('Dados do Sistema');
  
  dataSheet.columns = [
    { header: 'ID Usuário', key: 'id', width: 15 },
    { header: 'Nome', key: 'nome', width: 25 },
    { header: 'Posts Válidos', key: 'posts', width: 18 },
    { header: 'Méd. Caracteres', key: 'chars', width: 20 },
    { header: 'Méd. Comentários', key: 'comments', width: 20 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  dataSheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF415B76' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center' };
  });

  const row = dataSheet.addRow({
    id: metrics.userId,
    nome: metrics.userName,
    posts: metrics.quantidadePosts,
    chars: Number(metrics.mediaCaracteres),     
    comments: Number(metrics.mediaComentarios), 
    status: metrics.isUserActive ? 'Ativo' : 'Inativo'
  });

  const statusCell = row.getCell('status');
  statusCell.font = { bold: true };
  statusCell.alignment = { horizontal: 'center' };
  
  if (metrics.isUserActive) {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }; 
    statusCell.font = { color: { argb: 'FF155724' }, bold: true };
  } else {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }; 
    statusCell.font = { color: { argb: 'FF721C24' }, bold: true };
  }

  // ==========================================
  // EXPORTAÇÃO DO ARQUIVO (DOWNLOAD)
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, filename);
}