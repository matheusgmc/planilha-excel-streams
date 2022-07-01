const ExcelNode = require("exceljs");
const { pipeline, Readable, Writable, Transform } = require("stream");
const { promisify } = require("util");
const fs = require("fs");

const pipelineAsync = promisify(pipeline);

const {
  RetryRequest,
  formaterAddress,
  formaterAddressBackup,
  RouterUrl,
  RouterUrlBackup,
} = require("./services");

var falhas = 0;
var sucessos = 0;
var switchRouter = true;

const {
  renderScreen,
  changeStatusBar,
  changeLineResponse,
  changeSwitch,
  addLog,
} = require("./screen");

class Planilha {
  constructor({
    pathfileIn = "dados.xlsx",
    pathfileOut = "resultados.xlsx",
    delay = false,
    delayTime = 1000,
    renderActive = false,
  }) {
    this.file = pathfileIn;
    this.outfile = pathfileOut;
    this.WorkBook = new ExcelNode.Workbook();
    this.stream = fs.createReadStream(this.file);
    this.worksheet = null;
    this.delay = delay;
    this.delayTime = delayTime;
    this.falhas = 0;
    this.sucessos = 0;
  }
  async readFile() {
    renderScreen();
    changeSwitch(`${switchRouter ? RouterUrl : RouterUrlBackup}`);
    this.logs(`Lendo Arquivo ${this.file}`);
    await this.WorkBook.xlsx.read(this.stream);
  }
  async writeFile() {
    this.logs(`Gerando o Arquivo ${this.outfile}`);
    await this.WorkBook.xlsx.writeFile(this.outfile);
    this.logs("Gerado com Sucesso!")
    this.logs(`Ctrl+C ou Ctrl+D para sair.`)
  }
  console(address, cep) {
    if (address == "Não foi encontrado o endereço") {
      this.falhas++;
    } else {
      this.sucessos++;
    }
    changeStatusBar(this.falhas, this.sucessos);
    changeLineResponse(`Endereço:${address} \nCep:${cep} `);
    changeSwitch(`${switchRouter ? RouterUrl : RouterUrlBackup}`);
    return;
  }
  logs(value) {
    addLog(value);
  }

  async sleep() {
    return new Promise((resolve) => setTimeout(resolve, this.delayTime));
  }
  getWorkSheet(number = 0) {
    this.worksheet = this.WorkBook.worksheets[number];
  }

  addValueCell(value, pos = "A1") {
    const cell = this.worksheet.getCell(pos);
    cell.value = value;
  }

  getValueCell(pos = "A1") {
    return this.worksheet.getCell(pos).value;
  }
  getColumn(column = "A1") {
    return this.worksheet.getColumn(column);
  }
  async startStreams(data = []) {
    ///Streams para pega cada cep
    const readableStream = Readable({
      read: function () {
        // CASO QUERIA LIMITAR PRA 11 LINHAS APENAS
        data.slice(0, 10).forEach((cep) => this.push(JSON.stringify(cep)));
        //ceps.forEach((cep) => this.push(JSON.stringify(cep)));
        this.push(null);
      },
    });
    ///Transform para tratar cada chunk de cep que receber e converter para o endereço.
    const TransformStream = Transform({
      transform: async (chunk, encoding, cb) => {
        const { cep, row } = JSON.parse(chunk.toString());
        this.logs(`Processando: ${cep} | Linha: ${row}`);
        var value = "Não foi encontrado o endereço";
        const data = await RetryRequest(cep, switchRouter);
        if (!data.error) {
          value = switchRouter
            ? formaterAddress(data)
            : formaterAddressBackup(data);
        } else {
          switchRouter = !switchRouter;
        }
        this.console(value, cep);
        if (this.delay) await this.sleep();
        cb(null, JSON.stringify({ cep, row, address: value }));
      },
    });
    ///Writable para escrever a chunk com o endereço na planilha.
    const writableStream = Writable({
      write: (chunk, encoding, cb) => {
        const { cep, row, address } = JSON.parse(chunk.toString());
        this.addValueCell(address, `H${row}`);
        cb();
      },
    });

    await pipelineAsync(readableStream, TransformStream, writableStream);
  }
}

module.exports = Planilha;
