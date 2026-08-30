"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");
const assessmentController = require("../controllers/assessment.controller");

const router = express.Router();

const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15;
const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60;

// Protecao basica contra abuso/spam no endpoint publico do
// formulario (nao afeta as demais rotas).
const submitLimiter = rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Muitas requisicoes. Tente novamente em instantes."
    }
});

// POST /api/avaliacoes -> grava uma nova avaliacao na planilha
router.post("/avaliacoes", submitLimiter, assessmentController.createAssessment);

// GET /api/health -> checagem simples de saude do servico
router.get("/health", assessmentController.healthCheck);

module.exports = router;
