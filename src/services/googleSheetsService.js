"use strict";

/**
 * ============================================================
 * SERVICO DE GOOGLE SHEETS (via Google Apps Script Web App)
 * ============================================================
 *
 * Grava cada avaliacao diretamente numa planilha do Google
 * Sheets, sem usar Google Cloud, sem Service Account e sem
 * nenhum cadastro pago: o Apps Script roda "dentro" da propria
 * planilha, na sua conta Google normal, 100% gratuito.
 *
 * Como funciona:
 *   1. Voce cola um pequeno script (google-apps-script/Code.gs)
 *      dentro da planilha (Extensoes -> Apps Script).
 *   2. Publica esse script como "Web App" -> ganha uma URL.
 *   3. Cola essa URL aqui no .env (GOOGLE_APPS_SCRIPT_URL).
 *
 * O passo a passo completo esta no README.md, secao
 * "Configurar o Google Sheets (grátis, sem Google Cloud)".
 *
 * Se a URL nao estiver configurada, o servico fica "desativado":
 * o formulario continua funcionando normalmente e as respostas
 * caem no backup local (excelService.js) ate a URL ser preenchida.
 * ============================================================
 */

const logger = require("../utils/logger");

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "";

function isConfigured() {
    return Boolean(APPS_SCRIPT_URL && APPS_SCRIPT_URL.trim());
}

async function appendAssessment(data) {
    if (!isConfigured()) {
        const error = new Error(
            "Google Sheets nao configurado (preencha GOOGLE_APPS_SCRIPT_URL no .env)."
        );
        error.code = "GOOGLE_APPS_SCRIPT_NOT_CONFIGURED";
        throw error;
    }

    let response;

    try {
        response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
    } catch (networkError) {
        throw new Error(
            "Nao foi possivel conectar ao Google Apps Script: " +
            networkError.message
        );
    }

    if (!response.ok) {
        throw new Error(
            "O Google Apps Script retornou HTTP " + response.status
        );
    }

    let payload = null;

    try {
        payload = await response.json();
    } catch (parseError) {
        // Algumas implantacoes do Apps Script podem responder
        // sem JSON valido; nesse caso seguimos em frente, ja que
        // o HTTP 200 acima ja indica que a chamada foi aceita.
    }

    if (payload && payload.success === false) {
        throw new Error(
            "O Google Apps Script recusou os dados: " +
            (payload.message || "motivo nao informado")
        );
    }

    logger.info("Avaliacao gravada no Google Sheets (via Apps Script)", {
        id: data.id
    });

    return { via: "apps-script" };
}

module.exports = {
    appendAssessment,
    isConfigured
};
