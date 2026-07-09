export function downloadCSV(metrics, filename = 'relatorio_usuario.csv') {
  // Monta o cabeçalho e as linhas do CSV
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Métrica,Valor\n"
    + `Total de Posts,${metrics.totalPosts}\n`
    + `Posts Válidos,${metrics.validPostsCount}\n`
    + `Total de Comentários,${metrics.totalComments}\n`
    + `Status,${metrics.isUserActive ? 'Ativo' : 'Inativo'}\n`;

  // Cria um link virtual para forçar o download no navegador do usuário
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  
  document.body.appendChild(link); // Necessário para compatibilidade com Firefox
  link.click();
  document.body.removeChild(link);
}