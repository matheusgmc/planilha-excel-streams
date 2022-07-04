const Planilha = require("./src/planilha");

/////////////////////////////// CONFIGURAÇÃO ////////////////////////////////////
const planilha = new Planilha({
  pathfileIn: "dados.xlsx", // nome ( ou caminho) do arquivo que deseja ler
  pathfileOut: "resultados.xlsx", // nome ( ou caminho) do arquivo que deseja guarda os resultados.
  delay: false, // caso deseja um delay pra prevenir block das api's (default:false)
  delayTime: 1000, //o tempo em milissegundos que deseja espera. (default: 1s)
  writeCountFile: 100, //a cada quantos processos sera escrito no arquivo final.
});
async function main() {
  //le o arquivo .xlsx
  await planilha.readFile();

  //pega a primeira "aba" da planilha
  planilha.getWorkSheet(0);

  //pega o valor, se caso não exista ele adiciona um titulo.
  if (!planilha.getValueCell("H1")) {
    //primeiro paramêtro é o valor que deseja adicionar e o segundo a posição.
    planilha.addValueCell("Endereços", "H1");
  }
  // pega todos os itens da coluna A
  const column = planilha.getColumn("A");
  //iniciar o processo de escrita
  await planilha.startStreams(column);

  // gerando o arquivo final
  //await planilha.writeFile();
  return;
}
main();
