const { pipeline, Readable, Writable, Transform } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

const Planilha = require("./src/planilha");
const {
  RetryRequest,
  formaterAddress,
  formaterAddressBackup,
} = require("./src/services");
const {
  renderScreen,
  changeStatusBar,
  changeLineResponse,
  changeSwitch,
} = require("./src/screen");

var falhas = 0;
var sucessos = 0;
var switchRouter = true;

function changeConsole(address, cep) {
  if (address == "Não foi encontrado o endereço") {
    falhas++;
  } else {
    sucessos++;
  }
  changeStatusBar(falhas, sucessos);
  changeLineResponse(`${address} || ${cep}`);
  changeSwitch(`SwitchRouter: ${switchRouter}`);
  renderScreen();
}
/////////////////////////////// CONFIGURAÇÃO ////////////////////////////////////
const planilha = new Planilha({
  pathfileIn: "dados.xlsx", // nome ( ou caminho) do arquivo que deseja ler
  pathfileOut: "resultados.xlsx", // nome ( ou caminho) do arquivo que deseja guarda os resultados.
  delay: false, // caso deseja um delay pra prevenir block das api's (default:false)
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

  ///Streams para pega cada cep
  const readableStream = Readable({
    read: function () {
      // CASO QUERIA LIMITAR PRA 11 LINHAS APENAS
      //ceps.slice(0, 10).forEach((cep) => this.push(JSON.stringify(cep)));
      ceps.forEach((cep) => this.push(JSON.stringify(cep)));
      this.push(null);
    },
  });
  ///Transform para tratar cada chunk de cep que receber e converter para o endereço.
  const TransformStream = Transform({
    transform: async (chunk, encoding, cb) => {
      const { cep, row } = JSON.parse(chunk.toString());
      var value = "Não foi encontrado o endereço";
      const data = await RetryRequest(cep, switchRouter);
      if (!data.error) {
        value = switchRouter
          ? formaterAddress(data)
          : formaterAddressBackup(data);
      } else {
        switchRouter = !switchRouter;
      }
      changeConsole(value, cep);
      cb(null, JSON.stringify({ cep, row, address: value }));
    },
  });
  ///Writable para escrever a chunk com o endereço na planilha.
  const writableStream = Writable({
    write: (chunk, encoding, cb) => {
      const { cep, row, address } = JSON.parse(chunk.toString());
      planilha.addValueCell(address, `H${row}`);
      cb();
    },
  });

  await pipelineAsync(readableStream, TransformStream, writableStream);
  await planilha.writeFile();

  changeLineResponse(
    `Concluido com Sucesso: ${planilha.outfile}, Ctrl+C ou Ctrl+D para encerrar.`
  );
  renderScreen();
  return;
}

main();
