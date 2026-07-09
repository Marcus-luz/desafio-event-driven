export function downloadCSV(metrics, filename = 'relatorio_utilizador.csv') {
  // Cabeçalho exato exigido pelo PDF
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID do Usuário,Nome do Usuário,Quantidade de Posts,Média de Caracteres,Média de Comentários,Status\n";
  
  // Linha com os dados
  const statusString = metrics.isUserActive ? 'Ativo' : 'Inativo';
  csvContent += `${metrics.userId},${metrics.userName},${metrics.quantidadePosts},${metrics.mediaCaracteres},${metrics.mediaComentarios},${statusString}\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}