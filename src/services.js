const axios = require("axios").default;

const router = axios.create({
  baseURL: "https://cep.awesomeapi.com.br/json",
});

const routerBackup = axios.create({
  baseURL: "https://viacep.com.br/ws",
});

function formaterAddress(data) {
  return `${data.address}, ${data.district}, ${data.city}-${data.state}`;
}
function formaterAddressBackup(data) {
  return `${data.logradouro} ${data.complemento}, ${data.bairro}, ${data.localidade}-${data.uf}`;
}

async function Request(cep, switchRouter) {
  try {
    const { data, status } = switchRouter
      ? await router.get(`/${cep}`)
      : await routerBackup.get(`/${cep}/json`);
    return data;
  } catch (error) {
    return { error: "Não foi encontrado" };
  }
}

async function RetryRequest(cep, switchRouter) {
  var data = await Request(cep, switchRouter);
  if (data.error) {
    data = await Request(`0${cep}`, switchRouter);
  }
  return data;
}

module.exports = {
  formaterAddress,
  formaterAddressBackup,
  RetryRequest,
  RouterUrl: router.getUri(),
  RouterUrlBackup:routerBackup.getUri()
};
