/**
 * ============================================================
 * FICHA DE AVALIAÇÃO PRÉ TELEATENDIMENTO - Clínica de Fisioterapia FAM
 * ============================================================
 *
 * Este script roda DENTRO da sua planilha do Google Sheets
 * (Extensões -> Apps Script), 100% gratuito, sem precisar de
 * Google Cloud, cartão de crédito ou nenhum cadastro além da
 * sua conta Google normal.
 *
 * COMO USAR:
 *   1. Abra sua planilha do Google Sheets.
 *   2. Vá em Extensões -> Apps Script.
 *   3. Apague o conteúdo padrão (function myFunction() {...}) e
 *      cole todo o conteúdo deste arquivo no lugar.
 *   4. Salve (ícone de disquete ou Ctrl+S).
 *   5. Clique em "Implantar" -> "Nova implantação".
 *      - Tipo: "App da Web" (Web app)
 *      - Executar como: "Eu" (sua conta)
 *      - Quem pode acessar: "Qualquer pessoa"
 *   6. Clique em "Implantar", autorize as permissões pedidas
 *      (é a sua própria planilha, então é seguro autorizar).
 *   7. Copie a URL que termina em "/exec" - essa é a URL que
 *      vai no .env do projeto Node.js, em GOOGLE_APPS_SCRIPT_URL.
 *
 * Sempre que você editar este script, você precisa criar uma
 * NOVA implantação (ou gerenciar implantações -> editar a
 * existente) para as mudanças valerem na URL publicada.
 * ============================================================
 */

// Nome da aba (guia) onde as respostas serão gravadas.
// Se não existir, o script cria automaticamente.
var SHEET_NAME = "Avaliacoes";

// Colunas da planilha, na mesma ordem em que os dados chegam
// do formulário (precisa bater com public/js/app.js -> buildExcelData()
// e com src/config/columns.js do projeto Node.js).
var COLUMNS = [
    { header: "ID", key: "id" },
    { header: "Data/Hora (ISO)", key: "dataHora" },
    { header: "Nome", key: "nome" },
    { header: "Data de nascimento", key: "dataNascimento" },
    { header: "Cidade", key: "cidade" },
    { header: "Sexo", key: "sexo" },
    { header: "Estado civil", key: "estadoCivil" },
    { header: "Escolaridade", key: "escolaridade" },
    { header: "Situacao de trabalho", key: "situacaoTrabalho" },
    { header: "Acompanhamento", key: "acompanhamento" },
    { header: "Profissionais", key: "profissionais" },
    { header: "Condicoes de saude", key: "condicoesSaude" },
    { header: "Como conheceu a clinica", key: "comoConheceuClinica" },
    { header: "Disponibilidade", key: "disponibilidade" },
    { header: "Perda de urina", key: "perdaUrina" },
    { header: "Perda ao tossir/espirrar", key: "perdaTosseEspirro" },
    { header: "Perda ao esforco", key: "perdaEsforco" },
    { header: "Urgencia", key: "urgencia" },
    { header: "Perda antes do banheiro", key: "perdaAntesBanheiro" },
    { header: "Frequencia urinaria", key: "frequenciaUrinaria" },
    { header: "Nocturia", key: "nocturia" },
    { header: "Impacto na vida", key: "impactoVida" },
    { header: "Evitacao de atividades", key: "evitacao" },
    { header: "Uso de protecao", key: "protecao" },
    { header: "Dor/ardencia", key: "dorArdencia" },
    { header: "Sangue na urina", key: "sangueUrina" }
];

function doPost(e) {

    try {

        var sheet = getOrCreateSheet();

        ensureHeaderRow(sheet);

        var data = JSON.parse(e.postData.contents);

        var row = COLUMNS.map(function (column) {
            var value = data[column.key];
            return value === undefined || value === null ? "" : value;
        });

        sheet.appendRow(row);

        return jsonResponse({ success: true });

    } catch (error) {

        return jsonResponse({
            success: false,
            message: error && error.message ? error.message : String(error)
        });
    }
}

// Permite testar rapidamente abrindo a URL /exec no navegador
// (deve mostrar uma mensagem simples confirmando que esta no ar).
function doGet(e) {
    return ContentService
        .createTextOutput("Servico do formulario 'Ficha de Avaliacao Pre Teleatendimento' esta funcionando. Use POST para enviar dados.")
        .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    return sheet;
}

function ensureHeaderRow(sheet) {

    if (sheet.getLastRow() === 0) {

        var headers = COLUMNS.map(function (column) {
            return column.header;
        });

        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
    }
}

function jsonResponse(payload) {
    return ContentService
        .createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
}
