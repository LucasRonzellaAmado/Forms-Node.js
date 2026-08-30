#!/usr/bin/env bash

# ============================================================
# INSTALL.SH - Entenda sua Bexiga
# ============================================================
#
# Este script:
#   1. Verifica se Node.js e npm estao instalados
#   2. Instala todas as dependencias do projeto (npm install)
#   3. Cria o arquivo .env a partir do .env.example (se nao existir)
#   4. Cria as pastas /data e /logs (se nao existirem)
#   5. Inicia o servidor
#
# Uso:
#   chmod +x install.sh
#   ./install.sh
# ============================================================

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

info()  { echo -e "${GREEN}[OK]${RESET} $1"; }
warn()  { echo -e "${YELLOW}[AVISO]${RESET} $1"; }
error() { echo -e "${RED}[ERRO]${RESET} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BOLD}=============================================="
echo "  Entenda sua Bexiga - Instalacao do projeto"
echo -e "==============================================${RESET}"
echo ""

# ------------------------------------------------------------
# 1) Verificar Node.js
# ------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
    error "Node.js nao foi encontrado."
    echo "Instale o Node.js (versao 18 ou superior) antes de continuar:"
    echo "  https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    warn "Voce esta usando Node.js v$NODE_VERSION. Recomenda-se a versao 18 ou superior."
else
    info "Node.js v$NODE_VERSION encontrado."
fi

# ------------------------------------------------------------
# 2) Verificar npm
# ------------------------------------------------------------
if ! command -v npm >/dev/null 2>&1; then
    error "npm nao foi encontrado. Reinstale o Node.js (o npm vem junto)."
    exit 1
fi

info "npm $(npm -v) encontrado."
echo ""

# ------------------------------------------------------------
# 3) Instalar dependencias
# ------------------------------------------------------------
echo "Instalando dependencias (isso pode levar alguns instantes)..."
npm install
info "Dependencias instaladas com sucesso."
echo ""

# ------------------------------------------------------------
# 4) Criar .env a partir do .env.example
# ------------------------------------------------------------
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        info "Arquivo .env criado a partir de .env.example."
    else
        warn "Arquivo .env.example nao encontrado. Pulei a criacao do .env."
    fi
else
    info "Arquivo .env ja existe. Mantendo configuracao atual."
fi

# ------------------------------------------------------------
# 5) Criar pastas necessarias
# ------------------------------------------------------------
mkdir -p data logs
info "Pastas 'data' e 'logs' prontas."
echo ""

# ------------------------------------------------------------
# 5.1) Avisar sobre a configuracao do Google Sheets
# ------------------------------------------------------------
if ! grep -q "GOOGLE_APPS_SCRIPT_URL=.\+" .env 2>/dev/null; then
    warn "GOOGLE_APPS_SCRIPT_URL nao preenchida no .env"
    echo "     O formulario vai funcionar normalmente, mas as respostas ficarao"
    echo "     apenas no backup local (data/) ate voce configurar o Google Sheets."
    echo "     E gratuito e leva uns 5 minutos - veja o passo a passo em"
    echo "     README.md, secao 'Configurar o Google Sheets (grátis, sem Google Cloud)'."
fi
echo ""

# ------------------------------------------------------------
# 6) Iniciar o servidor
# ------------------------------------------------------------
echo -e "${BOLD}=============================================="
echo "  Instalacao concluida! Iniciando o servidor..."
echo -e "==============================================${RESET}"
echo ""
echo "O formulario ficara disponivel em: http://localhost:3000"
echo "(ou na porta definida no arquivo .env)"
echo ""
echo "Pressione Ctrl+C para parar o servidor a qualquer momento."
echo ""

npm start
