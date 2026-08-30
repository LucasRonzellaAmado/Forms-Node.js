"use strict";

/**
 * ============================================================
 * REQUEST LOGGER
 * ============================================================
 *
 * - Gera um ID curto para cada requisicao (req.id), util para
 *   rastrear uma unica chamada em todos os logs relacionados.
 * - Usa o Morgan para logar metodo, rota, status e tempo de
 *   resposta de toda requisicao HTTP, enviando tudo para o
 *   Winston (console + arquivos).
 * ============================================================
 */

const crypto = require("crypto");
const morgan = require("morgan");
const logger = require("../utils/logger");

function assignRequestId(req, res, next) {
    req.id = crypto.randomBytes(6).toString("hex");
    res.setHeader("X-Request-Id", req.id);
    next();
}

morgan.token("id", (req) => req.id);

const morganFormat =
    ":id :method :url :status :res[content-length]B - :response-time ms";

const httpLogger = morgan(morganFormat, {
    stream: {
        write: (message) => logger.http(message.trim())
    }
});

module.exports = {
    assignRequestId,
    httpLogger
};
