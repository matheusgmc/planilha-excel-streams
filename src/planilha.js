const ExcelNode = require("exceljs");
const { pipeline, Readable, Writable, Transform } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

const fs = require("fs");

const {
  renderScreen,
  changeStatusBar,
  changeLineResponse,
  changeSwitch,
} = require("./screen");
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
  changeSwitch(`SwitchRouter: ${switchRouter}`);
  changeLineResponse(`${address} || ${cep}`);
  renderScreen();
}

class Planilha {
  constructor({
    pathfileIn = "dados.xlsx",
    pathfileOut = "resultados.xlsx",
    delay = false,
    delayTime = 1000,
  }) {
    this.file = pathfileIn;
    this.outfile = pathfileOut;
    this.WorkBook = new ExcelNode.Workbook();
    this.stream = fs.createReadStream(this.file);
    this.worksheet = null;
    this.delay = delay;
    this.delayTime = delayTime;
  }
  async readFile() {
    await this.WorkBook.xlsx.read(this.stream);
  }
  async writeFile() {
    await this.WorkBook.xlsx.writeFile(this.outfile);
  }
  async sleep(ms = this.delayTime) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
  async main() {
    await this.readFile();
    this.getWorkSheet();
    if (!this.getValueCell("H1")) {
      this.addValueCell("Endereços", "H1");
      //await this.writeFile()
    }
    const ceps = [];
    this.getColumn("A").eachCell((cep, rowNumber) => {
      if (!Number.isInteger(cep.value)) return;
      ceps.push({ cep: cep.value, row: rowNumber });
    });
    const readableStream = Readable({
      read: function () {
        ceps.slice(0, 10).forEach((cep) => this.push(JSON.stringify(cep)));
        this.push(null);
      },
    });
    const writableMapStream = Transform({
      transform: async (chunk, encoding, cb) => {
        const { cep, row } = JSON.parse(chunk.toString());
        var value = "Não foi encontrado o endereço";
        const data = await RetryRequest(cep);
        if (!data.error) {
          value = switchRouter
            ? this.formaterAddress(data)
            : this.formaterAddressBackup(data);
        } else {
          switchRouter = !switchRouter;
        }
        changeConsole(value, cep, switchRouter);
        cb(null, JSON.stringify({ cep, row, address: value }));
      },
    });

    const writableStream = Writable({
      write: (chunk, encoding, cb) => {
        const { cep, row, address } = JSON.parse(chunk.toString());
        this.addValueCell(address, `H${row}`);
        cb();
      },
    });

    await pipelineAsync(readableStream, writableMapStream, writableStream);
    await this.writeFile();
    ChangeResponse("Concluido!");
    screen.render();
  }
}

module.exports = Planilha;
