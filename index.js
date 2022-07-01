const Planilha = require("./src/planilha");

/////////////////////////////// CONFIGURAÇÃO ////////////////////////////////////
const planilha = new Planilha({
  pathfileIn: "dados.xlsx", // nome ( ou caminho) do arquivo que deseja ler
  pathfileOut: "resultados.xlsx", // nome ( ou caminho) do arquivo que deseja guarda os resultados.
  delay: true, // caso deseja um delay pra prevenir block das api's (default:false)
  delayTime: 1000, //o tempo em milissegundos que deseja espera. (default: 1s)
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

  const ceps = [];
  // pega todos os itens da coluna A
  planilha.getColumn("A").eachCell((cep, rowNumber) => {
    //verifica se o valor é um numero inteiro.
    if (!Number.isInteger(cep.value)) return;
    // adiciona na lista
    ceps.push({ cep: cep.value, row: rowNumber });
  });

  //iniciar o processo de escrita
  await planilha.startStreams(ceps);

  // gerando o arquivo final
  await planilha.writeFile();
  return;
}
main();
