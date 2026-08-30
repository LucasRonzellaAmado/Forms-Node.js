"use strict";

const excelService = require("../services/excelService");
const googleSheetsService = require("../services/googleSheetsService");
const logger = require("../utils/logger");

// Campos que o formulario sempre envia (ver public/js/app.js
// -> buildExcelData()). Usado para validar o payload recebido
// e evitar gravar lixo na planilha.
const EXPECTED_FIELDS = [
    "id",
    "dataHora",
    "nome",
    "dataNascimento",
    "cidade",
    "sexo",
    "estadoCivil",
    "escolaridade",
    "situacaoTrabalho",
    "acompanhamento",
    "profissionais",
    "condicoesSaude",
    "comoConheceuClinica",
    "disponibilidade",
    "perdaUrina",
    "perdaTosseEspirro",
    "perdaEsforco",
    "urgencia",
    "perdaAntesBanheiro",
    "frequenciaUrinaria",
    "nocturia",
    "impactoVida",
    "evitacao",
    "protecao",
    "dorArdencia",
    "sangueUrina"
];

function sanitizeValue(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).slice(0, 2000);
}

function buildSanitizedRow(body) {
    const row = {};

    EXPECTED_FIELDS.forEach((field) => {
        row[field] = sanitizeValue(body[field]);
    });

    return row;
}

async function createAssessment(req, res, next) {
    const requestId = req.id;

    try {
        const body = req.body || {};

        if (!body.nome || !body.nome.trim()) {
            logger.warn("Avaliacao rejeitada: nome ausente", { requestId });

            return res.status(400).json({
                success: false,
                message: "O campo 'nome' e obrigatorio."
            });
        }

        const row = buildSanitizedRow(body);

        if (!row.id) {
            row.id = "AV-" + Date.now();
        }

        if (!row.dataHora) {
            row.dataHora = new Date().toISOString();
        }

        // Destino principal: Google Sheets (planilha online).
        let savedOnline = false;

        try {
            await googleSheetsService.appendAssessment(row);
            savedOnline = true;
        } catch (googleError) {
            logger.error(
                "Falha ao gravar no Google Sheets - a resposta sera mantida no backup local",
                {
                    requestId,
                    id: row.id,
                    error: googleError.message
                }
            );
        }

        // Backup local: grava sempre, mesmo quando o Google Sheets
        // funciona, para nunca perder uma resposta caso a internet
        // caia ou a planilha online fique indisponivel.
        await excelService.appendAssessment(row);

        logger.info("Avaliacao recebida e processada com sucesso", {
            requestId,
            id: row.id,
            nome: row.nome,
            savedOnline
        });

        return res.status(201).json({
            success: true,
            message: savedOnline
                ? "Avaliacao registrada com sucesso."
                : "Avaliacao registrada (salva localmente; verifique a conexao com o Google Sheets).",
            id: row.id,
            savedOnline
        });
    } catch (error) {
        logger.error("Falha ao processar avaliacao", {
            requestId,
            error: error.message,
            stack: error.stack
        });

        return next(error);
    }
}

async function healthCheck(req, res) {
    return res.status(200).json({
        success: true,
        status: "ok",
        googleSheetsConfigured: googleSheetsService.isConfigured(),
        excelBackupReady: excelService.excelFileExists(),
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    createAssessment,
    healthCheck
};
