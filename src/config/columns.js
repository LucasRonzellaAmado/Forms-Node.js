"use strict";

/**
 * ============================================================
 * COLUNAS DA PLANILHA
 * ============================================================
 *
 * Definicao unica das colunas usadas tanto na planilha Excel
 * local (backup) quanto na planilha do Google Sheets (online).
 *
 * "key" precisa bater com os campos enviados pelo formulario
 * (ver public/js/app.js -> buildExcelData()).
 * ============================================================
 */

const COLUMNS = [
    { header: "ID", key: "id", width: 24 },
    { header: "Data/Hora (ISO)", key: "dataHora", width: 22 },
    { header: "Nome", key: "nome", width: 28 },
    { header: "Data de nascimento", key: "dataNascimento", width: 18 },
    { header: "Cidade", key: "cidade", width: 22 },
    { header: "Sexo", key: "sexo", width: 16 },
    { header: "Estado civil", key: "estadoCivil", width: 20 },
    { header: "Escolaridade", key: "escolaridade", width: 28 },
    { header: "Situacao de trabalho", key: "situacaoTrabalho", width: 32 },
    { header: "Acompanhamento", key: "acompanhamento", width: 16 },
    { header: "Profissionais", key: "profissionais", width: 30 },
    { header: "Condicoes de saude", key: "condicoesSaude", width: 34 },
    { header: "Como conheceu a clinica", key: "comoConheceuClinica", width: 30 },
    { header: "Disponibilidade", key: "disponibilidade", width: 30 },
    { header: "Perda de urina", key: "perdaUrina", width: 18 },
    { header: "Perda ao tossir/espirrar", key: "perdaTosseEspirro", width: 24 },
    { header: "Perda ao esforco", key: "perdaEsforco", width: 18 },
    { header: "Urgencia", key: "urgencia", width: 18 },
    { header: "Perda antes do banheiro", key: "perdaAntesBanheiro", width: 24 },
    { header: "Frequencia urinaria", key: "frequenciaUrinaria", width: 20 },
    { header: "Nocturia", key: "nocturia", width: 16 },
    { header: "Impacto na vida", key: "impactoVida", width: 18 },
    { header: "Evitacao de atividades", key: "evitacao", width: 22 },
    { header: "Uso de protecao", key: "protecao", width: 18 },
    { header: "Dor/ardencia", key: "dorArdencia", width: 16 },
    { header: "Sangue na urina", key: "sangueUrina", width: 18 }
];

function getHeaders() {
    return COLUMNS.map((column) => column.header);
}

function getKeys() {
    return COLUMNS.map((column) => column.key);
}

function rowToArray(data) {
    return COLUMNS.map((column) => {
        const value = data[column.key];
        return value === undefined || value === null ? "" : String(value);
    });
}

module.exports = {
    COLUMNS,
    getHeaders,
    getKeys,
    rowToArray
};
