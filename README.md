# Planilha Excel

Projeto para obter ceps de um arquivo `.xlsx` converter para um endereço completo e adicionar em uma nova coluna na planilha, usando streams para poder processar arquivos com uma grande quantidade linhas divindo em várias chunks o processo.

### Como usar?
é preciso no mínimo o `Node.Js 16.15.1 LTS` caso queira baixa só [clique aqui](https://nodejs.org/en/).

##### Instalação
```bash
## copiar o repositório localmente
$ git clone https://github.com/matheusgmc/planilha-excel-streams.git
## entrar na pasta do projeto
$ cd planilha-excel-streams
## instalar as dependências
$ npm install
```

##### Configuração
dentro do arquivo `index.js` se encontra a configuração do codigo
![Config](/.github/config_planilha.png)
- `pathfileIn` - Sera o nome do arquivo que deseja ler para obter os dados. (lembra de adicionar a extensão, no caso xlsx)
- `pathfileOut` - O nome do arquivo que sera gerado no final do processo (lembrando da extensão)
- `delay` - Caso muitos processos comecem a falha, tente ativar o delay para as api’s não bloquearem o acesso. (padrão = false )
- `delayTime` - Adicione um valor em milissegundos para o delay (padrão= 1 segundo)

para os arquivo, se tiver dentro da `pasta raiz` basta apenas informa o nome dele (com a extensão) `ex: dados.xlsx`, se estiver em outra pasta dentro do projeto, pasta informar `ex: ./src/planilhas/dados.xlsx`.

`(O mesmo vale para o arquivo que sera gerado no final do processo.)`

##### Iniciar
Para executar o código basta ir no seu terminal e digitar o comando
```bash
$ node .
# ou
$ npm start
```
Lembrando que para executar um comando pelo terminal é necessário esta dentro da pasta do projeto.

##### Processo
enquanto estiver processando as informações ira aparecer essa telinha para ir atualizando sobre os resultados.
![preview](/.github/preview_terminal.png)

- `Falhas` - Contador para o número de operações que deram erro.
- `Sucessos` - Contador para o número de operações que foram concluídas com sucesso.
- `SwitchRouter(Switch)` - É a mudança feita entre as duas api's para caso uma caia ou bloqueie o acesso.
- `Resultado` - Informa o resultado das operações, em caso de falha, sucesso ou termino.

