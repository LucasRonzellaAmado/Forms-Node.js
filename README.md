# Ficha de Avaliação Pré Teleatendimento — Clínica de Fisioterapia FAM

Formulário de avaliação de incontinência urinária, em **Node.js + Express**,
que grava cada resposta automaticamente numa **planilha do Google Sheets
(online)**, com **backup local em Excel** e **logs completos** de tudo o
que acontece.

O visual (cores, fontes, layout) é o mesmo do arquivo HTML original —
nada foi alterado na aparência, só a logo da FAM e os textos pedidos.

## Estrutura do projeto

```
.
├── install.sh                      # instala dependências e já inicia o servidor
├── package.json
├── .env.example                    # copie para .env e ajuste
├── render.yaml                     # config de deploy automático no Render
├── Dockerfile                      # deploy alternativo via container (homelab, VPS)
├── google-apps-script/
│   └── Code.gs                     # script para colar na planilha (ver instruções abaixo)
├── data/
│   └── avaliacoes-backup.xlsx      # backup local (gerado automaticamente)
├── logs/
│   ├── combined-YYYY-MM-DD.log
│   └── error-YYYY-MM-DD.log
├── public/                         # frontend (servido como site estático)
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js
│   └── img/logo-fam.png
└── src/                            # backend
    ├── server.js
    ├── config/env.js
    ├── config/columns.js           # colunas da planilha (usado pelo Sheets e pelo Excel)
    ├── routes/assessment.routes.js
    ├── controllers/assessment.controller.js
    ├── services/googleSheetsService.js   # envia pro Google Sheets (via Apps Script)
    ├── services/excelService.js          # grava o backup local (.xlsx)
    ├── middlewares/requestLogger.js
    ├── middlewares/errorHandler.js
    └── utils/logger.js
```

## Como rodar (modo mais simples)

1. Extraia o `.zip` e abra a pasta na sua IDE.
2. Configure o Google Sheets (passo a passo abaixo) — **ou pule essa
   parte por enquanto**: o formulário funciona normalmente sem ela,
   só que as respostas ficam apenas no backup local até você configurar.
3. No terminal, dentro da pasta do projeto, rode:

```bash
chmod +x install.sh
./install.sh
```

Depois disso, acesse **http://localhost:3000** no navegador.

## Como rodar manualmente (sem o .sh)

```bash
npm install
cp .env.example .env
npm start
```

Para desenvolvimento com reinício automático a cada alteração:

```bash
npm run dev
```

---

## Configurar o Google Sheets (grátis, sem Google Cloud)

Nenhum cadastro pago, nenhum cartão de crédito, nenhum Google Cloud
Console. Só a sua conta Google normal (a mesma que você já usa pra
abrir o Google Sheets). Leva uns 5 minutos.

A ideia: um pequeno script (Google Apps Script) roda **dentro da
própria planilha** e recebe os dados do formulário diretamente.

### 1. Criar a planilha

Crie uma planilha nova no Google Sheets (sheets.new). Pode deixar em
branco — o script cria o cabeçalho automaticamente no primeiro envio.

### 2. Colar o script na planilha

1. Na planilha, vá em **Extensões → Apps Script**.
2. Apague o conteúdo padrão (`function myFunction() {...}`).
3. Abra o arquivo `google-apps-script/Code.gs` (está aqui no projeto),
   copie todo o conteúdo e cole no editor do Apps Script.
4. Salve (ícone de disquete ou `Ctrl+S`). Pode dar o nome que quiser
   ao projeto do script (ex: "Ficha Avaliacao FAM").

### 3. Publicar como "App da Web"

1. Clique em **Implantar → Nova implantação**.
2. Em "Tipo", escolha **App da Web**.
3. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar**.
5. O Google vai pedir autorização (é a sua própria planilha, então
   pode autorizar normalmente — clique em "Avançado" se aparecer um
   aviso de app não verificado, depois em "Acessar [nome do projeto]
   (não seguro)"; é normal para scripts pessoais).
6. Copie a **URL da Web app**, que termina em `/exec`.

### 4. Preencher o `.env`

```
GOOGLE_APPS_SCRIPT_URL=cole_aqui_a_url_que_termina_em_/exec
```

Pronto. Reinicie o servidor (`npm start` ou `./install.sh`) e envie o
formulário uma vez para testar — a linha deve aparecer na planilha em
segundos.

> Se você editar o `Code.gs` depois, precisa criar uma **nova
> implantação** (ou editar a existente em "Gerenciar implantações")
> para as mudanças valerem na URL publicada.

---

## Onde ficam as respostas

- **Destino principal:** a planilha do Google Sheets configurada acima.
  Cada envio vira uma nova linha, em tempo real.
- **Backup local:** toda resposta *também* é salva em
  `data/avaliacoes-backup.xlsx`, mesmo quando o Google Sheets funciona
  normalmente — é só uma rede de segurança para o caso de faltar
  internet ou o Google Sheets ficar fora do ar no momento do envio.
  Se isso acontecer, a resposta some do Google Sheets mas continua
  garantida nesse arquivo local, e fica registrado um erro no log
  para você perceber e reenviar manualmente se precisar.

Se quiser rodar **sem** o backup local (só o Google Sheets), me avise
que eu ajusto.

## Logs

Todos os eventos (requisições, avaliações gravadas, erros) ficam
registrados em `logs/`, com um arquivo por dia:

- `combined-YYYY-MM-DD.log` — todo o histórico de eventos.
- `error-YYYY-MM-DD.log` — somente os erros (inclui falhas de envio
  para o Google Sheets).
- `exceptions-YYYY-MM-DD.log` — falhas graves não tratadas.

Os arquivos giram automaticamente todo dia e são compactados após
algum tempo, então a pasta não cresce sem controle.

## Variáveis de ambiente (`.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `NODE_ENV` | `development` | Ambiente de execução |
| `LOG_LEVEL` | `info` | Nível de detalhe dos logs |
| `EXCEL_FILE_NAME` | `avaliacoes-backup.xlsx` | Nome do arquivo de backup local |
| `GOOGLE_APPS_SCRIPT_URL` | *(vazio)* | URL do Google Apps Script (Web App) que grava na planilha |
| `CORS_ORIGIN` | `*` | Origens permitidas para chamar a API |
| `RATE_LIMIT_WINDOW_MINUTES` | `15` | Janela de tempo do limite de requisições |
| `RATE_LIMIT_MAX_REQUESTS` | `60` | Máximo de envios por IP na janela acima |

## Endpoints da API

- `POST /api/avaliacoes` — recebe os dados do formulário, grava no Google
  Sheets e no backup local.
- `GET /api/health` — checagem de saúde: confirma se o Google Sheets
  está configurado (`googleSheetsConfigured`) e se o backup local existe.

---

## Deploy em produção (GitHub + Render)

O projeto já vem pronto para deploy contínuo: você sobe o código pro
GitHub, conecta o repositório numa plataforma que builda/roda a partir
dele e recebe uma **URL pública de produção**. Toda vez que você der
`git push`, ela atualiza sozinha.

Uso o **Render** como exemplo abaixo porque tem plano gratuito sem
pedir cartão de crédito e já vem configurado neste projeto
(`render.yaml`) — mas os mesmos passos (conectar repo → definir
build/start → preencher variáveis de ambiente) valem pra Railway,
Fly.io ou qualquer outro serviço parecido, se você preferir.

### 1. Subir o projeto para o GitHub

Dentro da pasta do projeto (no seu terminal Git Bash):

```bash
git init
git add .
git commit -m "Ficha de avaliação pré teleatendimento - versão inicial"
```

Crie um repositório novo no GitHub (botão "New" em
github.com/new — pode deixar privado). Depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git branch -M main
git push -u origin main
```

> O `.gitignore` já está configurado para **nunca** subir o `.env`,
> `node_modules/`, os logs nem os arquivos `.xlsx` gerados — só o
> código-fonte vai pro GitHub. Suas credenciais ficam só na sua
> máquina e depois na plataforma de deploy (variáveis de ambiente).

### 2. Conectar no Render e publicar

1. Crie uma conta em https://render.com (dá pra logar direto com o
   GitHub).
2. No painel, clique em **New → Blueprint**.
3. Selecione o repositório que você acabou de criar. O Render lê o
   `render.yaml` deste projeto e já configura o serviço sozinho
   (build `npm install`, start `npm start`, porta, etc).
4. Na tela de variáveis, preencha `GOOGLE_APPS_SCRIPT_URL` com a URL
   do seu Apps Script (a mesma que está no seu `.env` local).
5. Clique em **Apply/Deploy**. Em 1–2 minutos o Render te entrega uma
   URL pública, algo como:

   ```
   https://entenda-sua-bexiga.onrender.com
   ```

Esse é o link que você compartilha pra clínica usar o formulário.
Todo novo `git push` na branch `main` gera um novo deploy automático.

> Sem Blueprint, dá pra fazer manualmente também: **New → Web
> Service**, selecione o repositório, `Build Command: npm install`,
> `Start Command: npm start`, e adicione as mesmas variáveis do
> `.env` na aba "Environment".

### 3. Atenção: disco do Render é temporário

No plano gratuito do Render, os arquivos gravados em disco (o backup
local `data/avaliacoes-backup.xlsx` e os `logs/`) **somem a cada
novo deploy ou reinício** do serviço. Isso não afeta o funcionamento
normal — o **Google Sheets continua sendo a fonte confiável**, já
que é gravado direto na nuvem do Google, fora do servidor. O backup
local em produção serve só como rede de segurança de curtíssimo
prazo (entre um deploy e outro), não como arquivo permanente.

Se quiser um backup local persistente também em produção, dá pra:
- Adicionar um **Persistent Disk** no Render (pago, poucos dólares/mês); ou
- Rodar no seu **homelab** via Docker (o `Dockerfile` já está pronto
  no projeto) — aí o disco é seu e nada some.

### Alternativa: Docker (homelab ou qualquer VPS)

O projeto já inclui um `Dockerfile` pronto:

```bash
docker build -t entenda-sua-bexiga .
docker run -d \
  --name entenda-sua-bexiga \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  entenda-sua-bexiga
```

Isso builda a imagem e sobe o container já reiniciando sozinho se o
servidor reiniciar (`--restart unless-stopped`) — útil pra rodar
permanentemente no seu servidor Ubuntu do homelab, atrás do seu
Nginx como proxy reverso, por exemplo.

## Próximos passos possíveis (fora do escopo desta entrega)

- Autenticação para uma rota de download/visualização das respostas pela web.
- Domínio próprio (ex: avaliacao.suaclinica.com.br) apontando pra URL do Render.
- Envio de e-mail/WhatsApp de notificação a cada nova avaliação recebida.

