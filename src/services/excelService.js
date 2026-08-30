"use strict";

/**
 * ============================================================
 * SERVICO DE PLANILHA EXCEL (BACKUP LOCAL)
 * ============================================================
 *
 * A planilha "oficial" agora e o Google Sheets (online), gravado
 * pelo googleSheetsService.js. Este arquivo continua existindo
 * como uma copia de seguranca local: toda avaliacao tambem cai
 * aqui, em /data, para o caso de o Google Sheets ficar fora do
 * ar ou sem internet no momento do envio.
 *
 * Como varias pessoas podem enviar o formulario ao mesmo tempo,
 * as gravacoes passam por uma fila (writeQueue) para garantir
 * que o arquivo nunca seja lido e escrito por duas requisicoes
 * simultaneamente (o que poderia corromper a planilha).
 * ============================================================
 */

const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const logger = require("../utils/logger");
const { COLUMNS } = require("../config/columns");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const EXCEL_FILE_NAME = process.env.EXCEL_FILE_NAME || "avaliacoes-backup.xlsx";
const EXCEL_FILE_PATH = path.join(DATA_DIR, EXCEL_FILE_NAME);

const SHEET_NAME = "Avaliacoes";


function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        logger.info("Pasta de dados criada", { path: DATA_DIR });
    }
}

async function loadOrCreateWorkbook() {
    const workbook = new ExcelJS.Workbook();

    if (fs.existsSync(EXCEL_FILE_PATH)) {
        await workbook.xlsx.readFile(EXCEL_FILE_PATH);

        let sheet = workbook.getWorksheet(SHEET_NAME);
        if (!sheet) {
            sheet = workbook.addWorksheet(SHEET_NAME);
            sheet.columns = COLUMNS;
        }

        return { workbook, sheet };
    }

    const sheet = workbook.addWorksheet(SHEET_NAME);
    sheet.columns = COLUMNS;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: COLUMNS.length }
    };

    return { workbook, sheet };
}

// Fila simples: cada nova gravacao so comeca depois que a
// anterior termina (evita ler/escrever o arquivo ao mesmo tempo).
let writeQueue = Promise.resolve();

function appendAssessment(data) {
    const task = writeQueue.then(() => performAppend(data));

    // Garante que uma falha em uma gravacao nao trave a fila
    // para as proximas requisicoes.
    writeQueue = task.catch(() => {});

    return task;
}

async function performAppend(data) {
    ensureDataDir();

    const { workbook, sheet } = await loadOrCreateWorkbook();

    sheet.addRow(data);

    await workbook.xlsx.writeFile(EXCEL_FILE_PATH);

    logger.info("Avaliacao gravada no backup local (Excel)", {
        id: data.id,
        arquivo: EXCEL_FILE_PATH
    });

    return { filePath: EXCEL_FILE_PATH };
}

function getExcelFilePath() {
    return EXCEL_FILE_PATH;
}

function excelFileExists() {
    return fs.existsSync(EXCEL_FILE_PATH);
}

module.exports = {
    appendAssessment,
    getExcelFilePath,
    excelFileExists
};
