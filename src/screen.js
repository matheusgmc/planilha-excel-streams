const blessed = require("blessed");
const screen = blessed.screen({
  smartCSR: true,
});

screen.title = "Planilha grande";

const box = blessed.box({
  left: "center",
  width: "50%",
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
  width: "60%",
  top: "10%",
  height: 10,
  tags: true,
  style: {
    fg: "white",
  },
});

const Errors = blessed.box({
  left: "center",
  width: "60%",
  height: 2,
  content: "Falhas: 0",
  tags: true,
  style: {
    fg: "white",
  },
});

const Success = blessed.box({
  left: "center",
  width: "60%",
  top: "10%",
  height: 2,
  content: "Sucessos: 0",
  tags: true,
  style: {
    fg: "white",
  },
});

const SwitchRouter = blessed.box({
  left: 30,
  top: "10%",
  height: 2,
  content: "SwitchRouter: true",
  tags: true,
  style: {
    fg: "white",
  },
});

const LineResponse = blessed.box({
  top: "30%",
  left: "center",
  width: "60%",
  height: 10,
  content: "Resultado:",
  tags: true,
  style: {
    fg: "white",
  },
});

screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});
box.append(StatusBar);
box.append(LineResponse);
box.append(SwitchRouter);
StatusBar.append(Errors);
StatusBar.append(Success);
screen.append(box);
screen.render();

function changeLineResponse(value) {
  LineResponse.setContent(`Resultado: ${value}`);
}

function changeStatusBar(falhas, sucessos) {
  Errors.setContent(`Falhas: ${falhas}`);
  Success.setContent(`Sucessos: ${sucessos}`);
}

function changeSwitch(value) {
  SwitchRouter.setContent(value);
}

function renderScreen() {
  screen.render();
}



module.exports = {
  screen,
  StatusBar,
  LineResponse,
  Errors,
  Success,
  SwitchRouter,
  changeLineResponse,
  changeStatusBar,
  changeSwitch,
  renderScreen,
};
