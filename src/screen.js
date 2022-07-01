const blessed = require("blessed");
const contrib = require("blessed-contrib");

const screen = blessed.screen({
  smartCSR: true,
  title: "Processando Planilha",
});
screen.render()



const box = blessed.box({
  left: "center",
  height: "50%",
  tags: true,
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    border: {
      fg: "#f0f0f0",
    },
  },
});

const StatusBar = blessed.box({
  height: "20%",
  tags: true,
  style: {
    fg: "white",
    transparent: true,
  },
});

const Errors = blessed.box({
  width: "50%",
  content: "Falhas: 0",
  valign: "middle",
  align: "center",
  style: {
    fg: "white",
    transparent: true,
  },
});

const Success = blessed.box({
  width: "50%",
  right: 0,
  content: "Sucessos: 0",
  tags: true,
  valign: "middle",
  align: "center",
  style: {
    fg: "white",
    transparent: true,
  },
});

const SwitchRouter = blessed.box({
  top: "20%",
  height: "20%",
  content: "Router: ",
  valign: "middle",
  tags: true,
  style: {
    fg: "white",
    transparent: true,
  },
});

const Response = blessed.box({
  top: "35%",
  tags: true,
  style: {
    fg: "white",
    transparent: true,
  },
});

const log = contrib.log({
  width:"50%",
  right:0,
  fg: "green",
  selectedFg: "green",
  label: "Logs",
});

const LineResponse = blessed.box({
  width:"50%",
  content: "Endereço:\nCep: ",
  valign: "middle",
  tags: true,
  style: {
    fg: "white",
    transparent: true,
  },
});

screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});
StatusBar.append(Errors);
StatusBar.append(Success);
Response.append(log);
Response.append(LineResponse);
box.append(StatusBar);
box.append(SwitchRouter);
box.append(Response);
screen.append(box);

function changeLineResponse(value) {
  LineResponse.setContent(`${value}`);
}

function changeStatusBar(falhas, sucessos) {
  Errors.setText(`Falhas: ${falhas}`);
  Success.setText(`Sucessos: ${sucessos}`);
}

function changeSwitch(value) {
  SwitchRouter.setContent(`Api: ${value} `);
}

function addLog(value) {
    log.log(value);
}

function renderScreen() {
  screen.render();
}

module.exports = {
  changeLineResponse,
  changeStatusBar,
  changeSwitch,
  renderScreen,
  addLog,
};
