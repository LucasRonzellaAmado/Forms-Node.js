"use strict";

/* ============================================================
   CONFIGURAÇÃO
   ============================================================

   A avaliação é enviada para a API própria do projeto
   (backend Node.js/Express), que grava os dados em uma
   planilha Excel (.xlsx) no servidor.

   Não é mais necessário nenhum serviço externo (Power Automate).
============================================================ */

const API_URL = "/api/avaliacoes";


/* ============================================================
   ELEMENTOS
============================================================ */

const welcomeScreen =
    document.getElementById("welcomeScreen");

const quizScreen =
    document.getElementById("quizScreen");

const summaryScreen =
    document.getElementById("summaryScreen");

const startButton =
    document.getElementById("startButton");

const backButton =
    document.getElementById("backButton");

const continueButton =
    document.getElementById("continueButton");

const restartButton =
    document.getElementById("restartButton");

const questionCounter =
    document.getElementById("questionCounter");

const progressBar =
    document.getElementById("progressBar");

const questionCard =
    document.getElementById("questionCard");

const sectionLabel =
    document.getElementById("sectionLabel");

const questionTitle =
    document.getElementById("questionTitle");

const questionHelp =
    document.getElementById("questionHelp");

const questionInput =
    document.getElementById("questionInput");

const errorMessage =
    document.getElementById("errorMessage");

const summaryGreeting =
    document.getElementById("summaryGreeting");

const summaryContent =
    document.getElementById("summaryContent");

const alertBox =
    document.getElementById("alertBox");

const submissionStatus =
    document.getElementById("submissionStatus");

const loadingOverlay =
    document.getElementById("loadingOverlay");


/* ============================================================
   ESTADO
============================================================ */

let answers = {};

let currentIndex = 0;

let submitted = false;


/* ============================================================
   PERGUNTAS
============================================================ */

const questions = [

    {
        id: "name",
        section: "Sobre você",
        title: "Qual é o seu nome completo?",
        type: "text",
        required: true,
        placeholder: "Digite seu nome completo"
    },

    {
        id: "birthDate",
        section: "Sobre você",
        title: "Qual é a sua data de nascimento?",
        type: "date",
        required: true
    },

    {
        id: "address",
        section: "Sobre você",
        title: "Qual é o seu endereço completo?",
        help: "Digite o CEP para preencher rua, bairro e cidade automaticamente. Depois confira e complete o número.",
        type: "address",
        required: true
    },

    {
        id: "sex",
        section: "Sobre você",
        title: "Qual é o seu sexo?",
        type: "single",
        required: true,
        options: [
            "Masculino",
            "Feminino",
            "Não especificado"
        ]
    },

    {
        id: "maritalStatus",
        section: "Sobre você",
        title: "Qual é o seu estado civil?",
        type: "single",
        required: true,
        options: [
            "Solteiro(a)",
            "Casado(a)",
            "Viúvo(a)",
            "Separado(a) judicialmente",
            "Divorciado(a)",
            "União estável"
        ]
    },

    {
        id: "education",
        section: "Sobre você",
        title: "Qual é o seu grau de escolaridade?",
        type: "single",
        required: true,
        options: [
            "Fundamental incompleto",
            "Fundamental completo",
            "Médio incompleto",
            "Médio completo",
            "Superior incompleto",
            "Superior completo",
            "Pós-graduação, mestrado ou doutorado",
            "Outro"
        ],
        other: true,
        otherId: "educationOther",
        otherLabel: "Especifique sua escolaridade"
    },

    {
        id: "work",
        section: "Sobre você",
        title: "Qual é a sua situação de trabalho?",
        type: "single",
        required: true,
        options: [
            "Trabalhando (CLT ou funcionário público)",
            "Trabalhando por conta própria (autônomo / empresário / freelancer)",
            "Desempregado(a) e à procura de emprego",
            "Estudante",
            "Aposentado(a) / Pensionista",
            "Responsável pelos cuidados da casa / do lar",
            "Não estou trabalhando e não estou à procura de emprego",
            "Outro"
        ],
        other: true,
        otherId: "workOther",
        otherLabel: "Especifique sua situação"
    },

    {
        id: "healthFollowUp",
        section: "Cuidados de saúde",
        title: "Você faz acompanhamento regular com algum profissional de saúde?",
        type: "single",
        required: true,
        options: [
            "Não",
            "Sim"
        ]
    },

    {
        id: "professionals",
        section: "Cuidados de saúde",
        title: "Com quais profissionais você faz acompanhamento?",
        type: "multiple",
        required: true,
        condition: function () {
            return answers.healthFollowUp === "Sim";
        },
        options: [
            "Médico",
            "Nutricionista",
            "Psicólogo",
            "Fisioterapeuta",
            "Nenhum",
            "Outro"
        ],
        other: true,
        otherId: "professionalsOther",
        otherLabel: "Especifique o profissional"
    },

    {
        id: "clinicSource",
        section: "Clínica de Fisioterapia FAM",
        title: "Como você conheceu a clínica de Fisioterapia FAM?",
        type: "single",
        required: true,
        options: [
            "Indicação de amigos ou familiares",
            "Indicação médica",
            "Redes sociais (Instagram, Facebook)",
            "Pesquisa no Google / Internet",
            "Cartazes, panfletos ou outdoors",
            "Passei em frente à clínica",
            "Outro"
        ],
        other: true,
        otherId: "clinicSourceOther",
        otherLabel: "Especifique como conheceu"
    },

    {
        id: "availability",
        section: "Clínica de Fisioterapia FAM",
        title: "Qual é a sua disponibilidade de horário para o teleatendimento?",
        help: "Selecione todos os horários em que está disponível.",
        type: "multiple",
        required: true,
        options: [
            "08:00",
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00"
        ]
    },

    {
        id: "healthConditions",
        section: "Condições de saúde",
        title: "Você possui alguma das condições de saúde abaixo?",
        type: "multiple",
        required: true,
        options: [
            "Diabetes",
            "Obesidade",
            "Hipertensão arterial",
            "Constipação intestinal",
            "Condição neurológica (AVC, Parkinson, esclerose múltipla etc.)",
            "Não tenho nenhuma dessas doenças",
            "Não sei informar",
            "Outro"
        ],
        other: true,
        otherId: "healthConditionsOther",
        otherLabel: "Especifique a condição"
    },

    {
        id: "urineLoss",
        section: "Saúde urinária 💧",
        sectionIntro: true,
        title: "Você costuma perder urina sem querer?",
        type: "single",
        required: true,
        options: [
            "Nunca",
            "Às vezes",
            "Frequentemente",
            "Todos os dias"
        ]
    },

    {
        id: "coughSneeze",
        section: "Saúde urinária 💧",
        title: "A perda acontece quando você tosse, espirra ou dá risada?",
        type: "single",
        required: true,
        condition: function () {
            return hasUrineLoss();
        },
        options: [
            "Sim",
            "Não",
            "Não tenho certeza"
        ]
    },

    {
        id: "effort",
        section: "Saúde urinária 💧",
        title: "Acontece quando você corre, pula, levanta peso ou faz esforço?",
        type: "single",
        required: true,
        condition: function () {
            return hasUrineLoss();
        },
        options: [
            "Sim",
            "Não",
            "Não tenho certeza"
        ]
    },

    {
        id: "urgency",
        section: "Saúde urinária 💧",
        title: "Você sente uma vontade muito forte e repentina de urinar?",
        type: "single",
        required: true,
        options: [
            "Nunca",
            "Às vezes",
            "Frequentemente",
            "Todos os dias"
        ]
    },

    {
        id: "urgencyLeak",
        section: "Saúde urinária 💧",
        title: "Essa vontade forte já fez você perder urina antes de chegar ao banheiro?",
        type: "single",
        required: true,
        condition: function () {
            return hasUrgency();
        },
        options: [
            "Nunca",
            "Às vezes",
            "Frequentemente",
            "Todos os dias"
        ]
    },

    {
        id: "frequency",
        section: "Saúde urinária 💧",
        title: "Durante o dia, com que frequência você costuma urinar?",
        type: "single",
        required: true,
        options: [
            "Até 6 vezes",
            "7 a 8 vezes",
            "9 a 12 vezes",
            "Mais de 12 vezes",
            "Não sei"
        ]
    },

    {
        id: "nocturia",
        section: "Saúde urinária 💧",
        title: "Quantas vezes você costuma acordar à noite para urinar?",
        type: "single",
        required: true,
        options: [
            "Nenhuma",
            "1 vez",
            "2 vezes",
            "3 ou mais vezes"
        ]
    },

    {
        id: "impact",
        section: "Saúde urinária 💧",
        title: "Quanto esses sintomas atrapalham sua vida?",
        help: "Considere trabalho, exercícios, viagens, sono, relações sociais e atividades que você gosta.",
        type: "single",
        required: true,
        options: [
            "Nada",
            "Pouco",
            "Moderadamente",
            "Muito",
            "Extremamente"
        ]
    },

    {
        id: "avoidance",
        section: "Saúde urinária 💧",
        title: "Você evita alguma atividade por medo de perder urina ou não encontrar um banheiro?",
        type: "single",
        required: true,
        options: [
            "Nunca",
            "Às vezes",
            "Frequentemente",
            "Sempre"
        ]
    },

    {
        id: "protection",
        section: "Saúde urinária 💧",
        title: "Você usa absorvente, proteção ou troca de roupa por causa da perda de urina?",
        type: "single",
        required: true,
        options: [
            "Não",
            "Às vezes",
            "Frequentemente",
            "Todos os dias"
        ]
    },

    {
        id: "pain",
        section: "Saúde urinária 💧",
        title: "Você sente dor ou ardência ao urinar?",
        type: "single",
        required: true,
        options: [
            "Não",
            "Às vezes",
            "Frequentemente",
            "Sempre"
        ]
    },

    {
        id: "blood",
        section: "Saúde urinária 💧",
        title: "Você já percebeu sangue na urina?",
        type: "single",
        required: true,
        options: [
            "Não",
            "Sim",
            "Não tenho certeza"
        ]
    }

];


/* ============================================================
   CONDIÇÕES
============================================================ */

function hasUrineLoss() {

    return (
        answers.urineLoss &&
        answers.urineLoss !== "Nunca"
    );
}


function hasUrgency() {

    return (
        answers.urgency &&
        answers.urgency !== "Nunca"
    );
}


function shouldShowQuestion(question) {

    if (typeof question.condition !== "function") {
        return true;
    }

    return question.condition();
}


function getVisibleQuestions() {

    return questions.filter(
        shouldShowQuestion
    );
}


/* ============================================================
   UTILITÁRIOS
============================================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function firstName(name) {

    if (!name) {
        return "você";
    }

    return name.trim().split(/\s+/)[0];
}


function showScreen(screen) {

    welcomeScreen.classList.remove("active");
    quizScreen.classList.remove("active");
    summaryScreen.classList.remove("active");

    screen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ============================================================
   RENDERIZAÇÃO
============================================================ */

function renderQuestion() {

    const visibleQuestions =
        getVisibleQuestions();

    if (currentIndex >= visibleQuestions.length) {
        finishAssessment();
        return;
    }

    const question =
        visibleQuestions[currentIndex];

    const total =
        visibleQuestions.length;

    const number =
        currentIndex + 1;

    const progress =
        (number / total) * 100;

    questionCounter.textContent =
        "Pergunta " +
        number +
        " de " +
        total;

    progressBar.style.width =
        progress + "%";

    progressBar.parentElement.setAttribute(
        "aria-valuenow",
        String(Math.round(progress))
    );

    sectionLabel.textContent =
        question.section;

    questionTitle.textContent =
        question.title;

    questionHelp.textContent =
        question.help || "";

    questionHelp.style.display =
        question.help
            ? "block"
            : "none";

    errorMessage.textContent = "";
    errorMessage.classList.remove("visible");

    questionInput.innerHTML = "";

    renderInput(question);

    backButton.style.visibility =
        currentIndex === 0
            ? "hidden"
            : "visible";

    const isLast =
        currentIndex === total - 1;

    continueButton.textContent =
        isLast
            ? "Enviar avaliação ✓"
            : "Continuar →";

    updateContinueButton();

    questionCard.classList.remove("shake");

    void questionCard.offsetWidth;

    questionCard.classList.add("fade");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function renderInput(question) {

    if (question.type === "text") {
        renderText(question);
        return;
    }

    if (question.type === "date") {
        renderDate(question);
        return;
    }

    if (question.type === "address") {
        renderAddress(question);
        return;
    }

    if (
        question.type === "single" ||
        question.type === "multiple"
    ) {
        renderOptions(question);
    }
}


function renderText(question) {

    const input =
        document.createElement("input");

    input.type = "text";
    input.className = "text-input";
    input.placeholder =
        question.placeholder || "";

    input.value =
        answers[question.id] || "";

    input.autocomplete = "off";

    input.addEventListener(
        "input",
        function () {

            answers[question.id] =
                input.value;

            updateContinueButton();
        }
    );

    questionInput.appendChild(input);

    setTimeout(
        function () {
            input.focus();
        },
        100
    );
}


function renderDate(question) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "date-parts";

    const dayInput =
        document.createElement("input");

    const monthInput =
        document.createElement("input");

    const yearInput =
        document.createElement("input");

    dayInput.className = "date-part date-part-day";
    monthInput.className = "date-part date-part-month";
    yearInput.className = "date-part date-part-year";

    dayInput.setAttribute("placeholder", "DD");
    monthInput.setAttribute("placeholder", "MM");
    yearInput.setAttribute("placeholder", "AAAA");

    dayInput.setAttribute("inputmode", "numeric");
    monthInput.setAttribute("inputmode", "numeric");
    yearInput.setAttribute("inputmode", "numeric");

    dayInput.setAttribute("maxlength", "2");
    monthInput.setAttribute("maxlength", "2");
    yearInput.setAttribute("maxlength", "4");

    dayInput.setAttribute("autocomplete", "off");
    monthInput.setAttribute("autocomplete", "off");
    yearInput.setAttribute("autocomplete", "off");

    // Preenche os campos se já existir uma data respondida
    // (formato salvo: "AAAA-MM-DD").
    const existing =
        answers[question.id] || "";

    const existingParts =
        existing.split("-");

    if (existingParts.length === 3) {

        yearInput.value = existingParts[0];
        monthInput.value = existingParts[1];
        dayInput.value = existingParts[2];
    }

    function onlyDigits(value) {

        return value.replace(/\D/g, "");
    }

    function updateBirthDate() {

        const day = onlyDigits(dayInput.value);
        const month = onlyDigits(monthInput.value);
        const year = onlyDigits(yearInput.value);

        const complete =
            day.length === 2 &&
            month.length === 2 &&
            year.length === 4;

        if (!complete) {

            delete answers[question.id];

            updateContinueButton();

            return;
        }

        const dayNumber = Number(day);
        const monthNumber = Number(month);
        const yearNumber = Number(year);

        const candidate =
            new Date(yearNumber, monthNumber - 1, dayNumber);

        const isValidCalendarDate =
            candidate.getFullYear() === yearNumber &&
            candidate.getMonth() === monthNumber - 1 &&
            candidate.getDate() === dayNumber &&
            yearNumber >= 1900 &&
            yearNumber <= new Date().getFullYear();

        if (!isValidCalendarDate) {

            delete answers[question.id];

            updateContinueButton();

            return;
        }

        answers[question.id] =
            year + "-" + month + "-" + day;

        updateContinueButton();
    }

    dayInput.addEventListener("input", function () {

        dayInput.value = onlyDigits(dayInput.value).slice(0, 2);

        if (dayInput.value.length === 2) {
            monthInput.focus();
            monthInput.select();
        }

        updateBirthDate();
    });

    monthInput.addEventListener("input", function () {

        monthInput.value = onlyDigits(monthInput.value).slice(0, 2);

        if (monthInput.value.length === 2) {
            yearInput.focus();
            yearInput.select();
        }

        updateBirthDate();
    });

    yearInput.addEventListener("input", function () {

        yearInput.value = onlyDigits(yearInput.value).slice(0, 4);

        updateBirthDate();
    });

    // Backspace em um campo vazio volta para o campo anterior,
    // como em qualquer app de data (ex.: apps bancários).
    monthInput.addEventListener("keydown", function (event) {

        if (event.key === "Backspace" && monthInput.value === "") {
            dayInput.focus();
        }
    });

    yearInput.addEventListener("keydown", function (event) {

        if (event.key === "Backspace" && yearInput.value === "") {
            monthInput.focus();
        }
    });

    wrapper.appendChild(dayInput);

    const separator1 =
        document.createElement("span");
    separator1.className = "date-separator";
    separator1.textContent = "/";
    wrapper.appendChild(separator1);

    wrapper.appendChild(monthInput);

    const separator2 =
        document.createElement("span");
    separator2.className = "date-separator";
    separator2.textContent = "/";
    wrapper.appendChild(separator2);

    wrapper.appendChild(yearInput);

    questionInput.appendChild(wrapper);

    updateBirthDate();

    setTimeout(
        function () {
            dayInput.focus();
        },
        100
    );
}


function renderAddress(question) {

    const fields = [
        { key: "addressCep", label: "CEP", placeholder: "00000-000", required: true, inputmode: "numeric", maxlength: 9, size: "small" },
        { key: "addressStreet", label: "Rua / Avenida", placeholder: "Nome da rua", required: true },
        { key: "addressNumber", label: "Número", placeholder: "Ex.: 123", required: true, size: "small" },
        { key: "addressComplement", label: "Complemento (opcional)", placeholder: "Apto, bloco, casa..." },
        { key: "addressDistrict", label: "Bairro", placeholder: "Bairro", required: true },
        { key: "addressCity", label: "Cidade", placeholder: "Cidade", required: true },
        { key: "addressState", label: "UF", placeholder: "SP", required: true, maxlength: 2, size: "small" }
    ];

    const grid = document.createElement("div");
    grid.className = "address-grid";

    const inputs = {};
    const status = document.createElement("div");
    status.className = "address-status";

    fields.forEach(function (field) {

        const wrapper = document.createElement("div");
        wrapper.className = "address-field" + (field.size ? " address-field-" + field.size : "");

        const label = document.createElement("label");
        label.className = "other-label";
        label.textContent = field.label;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "text-input";
        input.placeholder = field.placeholder;
        input.autocomplete = "off";
        input.value = answers[field.key] || "";

        if (field.inputmode) { input.setAttribute("inputmode", field.inputmode); }
        if (field.maxlength) { input.setAttribute("maxlength", String(field.maxlength)); }

        input.addEventListener("input", function () {

            if (field.key === "addressCep") {
                const digits = input.value.replace(/\D/g, "").slice(0, 8);
                input.value = digits.length > 5
                    ? digits.slice(0, 5) + "-" + digits.slice(5)
                    : digits;
            }

            if (field.key === "addressState") {
                input.value = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
            }

            answers[field.key] = input.value;

            if (field.key === "addressCep" && input.value.replace(/\D/g, "").length === 8) {
                lookupCep(input.value.replace(/\D/g, ""));
            }

            updateContinueButton();
        });

        inputs[field.key] = input;

        label.htmlFor = "addr-" + field.key;
        input.id = "addr-" + field.key;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        grid.appendChild(wrapper);
    });

    // Busca gratuita de CEP (ViaCEP). Se falhar, a pessoa digita à mão.
    async function lookupCep(cep) {

        status.textContent = "Buscando endereço...";

        try {

            const response = await fetch("https://viacep.com.br/ws/" + cep + "/json/");
            const data = await response.json();

            if (data.erro) {
                status.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
                return;
            }

            const map = {
                addressStreet: data.logradouro,
                addressDistrict: data.bairro,
                addressCity: data.localidade,
                addressState: data.uf
            };

            Object.keys(map).forEach(function (key) {
                if (map[key]) {
                    inputs[key].value = map[key];
                    answers[key] = map[key];
                }
            });

            status.textContent = "";

            updateContinueButton();

            (inputs.addressNumber).focus();

        } catch (error) {
            status.textContent = "Não foi possível buscar o CEP. Preencha manualmente.";
        }
    }

    questionInput.appendChild(grid);
    questionInput.appendChild(status);

    setTimeout(function () { inputs.addressCep.focus(); }, 100);
}


function renderOptions(question) {

    const optionsContainer =
        document.createElement("div");

    optionsContainer.className =
        "options";

    const currentValue =
        answers[question.id];

    question.options.forEach(
        function (option, index) {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "option";

            const input =
                document.createElement("input");

            const inputId =
                question.id +
                "-" +
                index;

            input.id = inputId;

            input.name =
                question.id;

            input.value =
                option;

            input.type =
                question.type === "multiple"
                    ? "checkbox"
                    : "radio";

            if (question.type === "multiple") {

                if (
                    Array.isArray(currentValue) &&
                    currentValue.includes(option)
                ) {
                    input.checked = true;
                }

            } else {

                if (currentValue === option) {
                    input.checked = true;
                }
            }

            const label =
                document.createElement("label");

            label.className =
                "option-label";

            label.htmlFor =
                inputId;

            const indicator =
                document.createElement("span");

            indicator.className =
                "option-indicator";

            const text =
                document.createElement("span");

            text.textContent =
                option;

            label.appendChild(indicator);
            label.appendChild(text);

            input.addEventListener(
                "change",
                function () {

                    handleOptionChange(
                        question,
                        option,
                        input.checked
                    );
                }
            );

            wrapper.appendChild(input);
            wrapper.appendChild(label);

            optionsContainer.appendChild(wrapper);
        }
    );

    questionInput.appendChild(
        optionsContainer
    );

    if (question.other) {

        const otherContainer =
            document.createElement("div");

        otherContainer.className =
            "other-container";

        otherContainer.id =
            question.id +
            "-other-container";

        const label =
            document.createElement("label");

        label.className =
            "other-label";

        label.textContent =
            question.otherLabel;

        label.htmlFor =
            question.otherId;

        const input =
            document.createElement("input");

        input.id =
            question.otherId;

        input.className =
            "other-input";

        input.type = "text";

        input.placeholder =
            "Digite aqui...";

        input.value =
            answers[question.otherId] || "";

        input.addEventListener(
            "input",
            function () {

                answers[question.otherId] =
                    input.value;

                updateContinueButton();
            }
        );

        otherContainer.appendChild(label);
        otherContainer.appendChild(input);

        questionInput.appendChild(
            otherContainer
        );

        updateOtherVisibility(question);
    }
}


/* ============================================================
   OPÇÕES
============================================================ */

function handleOptionChange(
    question,
    option,
    checked
) {

    if (question.type === "single") {

        answers[question.id] =
            option;

        if (
            question.id === "healthFollowUp" &&
            option === "Não"
        ) {
            delete answers.professionals;
            delete answers.professionalsOther;
        }

        if (
            question.id === "healthFollowUp" &&
            option === "Sim"
        ) {
            /* Nada adicional */
        }

    } else {

        let selected =
            Array.isArray(
                answers[question.id]
            )
                ? [...answers[question.id]]
                : [];

        if (
            question.id === "professionals"
        ) {
            selected =
                handleNoneOption(
                    selected,
                    option,
                    ["Nenhum"],
                    checked
                );
        }

        if (
            question.id === "healthConditions"
        ) {
            selected =
                handleNoneOption(
                    selected,
                    option,
                    [
                        "Não tenho nenhuma dessas doenças",
                        "Não sei informar"
                    ],
                    checked
                );
        }

        if (
            option !== "Nenhum" &&
            option !== "Não sei informar" &&
            option !== "Não tenho nenhuma dessas doenças"
        ) {

            if (checked) {

                if (!selected.includes(option)) {
                    selected.push(option);
                }

            } else {

                selected =
                    selected.filter(
                        function (item) {
                            return item !== option;
                        }
                    );
            }
        }

        answers[question.id] =
            selected;
    }

    updateOtherVisibility(question);

    updateContinueButton();
}


function handleNoneOption(
    selected,
    option,
    noneOptions,
    checked
) {

    const noneList =
        Array.isArray(noneOptions)
            ? noneOptions
            : [noneOptions];

    if (noneList.includes(option)) {

        if (checked) {

            return [option];

        }

        return [];
    }

    if (checked) {

        selected =
            selected.filter(
                function (item) {
                    return !noneList.includes(item);
                }
            );
    }

    return selected;
}


function updateOtherVisibility(question) {

    if (!question.other) {
        return;
    }

    const container =
        document.getElementById(
            question.id +
            "-other-container"
        );

    if (!container) {
        return;
    }

    let visible = false;

    if (question.type === "single") {

        visible =
            answers[question.id] === "Outro";

    } else {

        visible =
            Array.isArray(
                answers[question.id]
            ) &&
            answers[question.id].includes(
                "Outro"
            );
    }

    container.classList.toggle(
        "visible",
        visible
    );

    if (!visible) {
        delete answers[question.otherId];
    }
}


/* ============================================================
   VALIDAÇÃO
============================================================ */

function isCurrentAnswerValid() {

    const visibleQuestions =
        getVisibleQuestions();

    const question =
        visibleQuestions[currentIndex];

    if (!question) {
        return false;
    }

    if (!question.required) {
        return true;
    }

    const value =
        answers[question.id];

    if (question.type === "text") {

        return (
            typeof value === "string" &&
            value.trim().length > 0
        );
    }

    if (question.type === "date") {

        return (
            typeof value === "string" &&
            value.length > 0
        );
    }

    if (question.type === "address") {

        const cepDigits =
            (answers.addressCep || "").replace(/\D/g, "");

        return (
            cepDigits.length === 8 &&
            ["addressStreet", "addressNumber", "addressDistrict", "addressCity", "addressState"]
                .every(function (key) {
                    return (answers[key] || "").trim().length > 0;
                }) &&
            answers.addressState.trim().length === 2
        );
    }

    if (question.type === "single") {

        if (
            !value ||
            typeof value !== "string"
        ) {
            return false;
        }

        if (
            value === "Outro" &&
            !answers[question.otherId]?.trim()
        ) {
            return false;
        }

        return true;
    }

    if (question.type === "multiple") {

        if (
            !Array.isArray(value) ||
            value.length === 0
        ) {
            return false;
        }

        if (
            value.includes("Outro") &&
            !answers[question.otherId]?.trim()
        ) {
            return false;
        }

        return true;
    }

    return false;
}


function updateContinueButton() {

    continueButton.disabled =
        !isCurrentAnswerValid();
}


/* ============================================================
   LIMPEZA DE CONDICIONAIS
============================================================ */

function cleanInvalidConditionalAnswers() {

    questions.forEach(
        function (question) {

            if (
                !shouldShowQuestion(question)
            ) {

                delete answers[question.id];

                if (question.otherId) {
                    delete answers[
                        question.otherId
                    ];
                }
            }
        }
    );

    if (
        answers.healthFollowUp === "Não"
    ) {

        delete answers.professionals;
        delete answers.professionalsOther;
    }
}


/* ============================================================
   NAVEGAÇÃO
============================================================ */

function goBack() {

    if (currentIndex <= 0) {
        return;
    }

    currentIndex--;

    renderQuestion();
}


async function continueAssessment() {

    if (!isCurrentAnswerValid()) {

        showValidationError(
            "Selecione ou preencha uma resposta para continuar."
        );

        return;
    }

    cleanInvalidConditionalAnswers();

    const visibleQuestions =
        getVisibleQuestions();

    const isLast =
        currentIndex ===
        visibleQuestions.length - 1;

    if (!isLast) {

        currentIndex++;

        renderQuestion();

        return;
    }

    await finishAssessment();
}


function showValidationError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.add(
        "visible"
    );

    questionCard.classList.remove(
        "shake"
    );

    void questionCard.offsetWidth;

    questionCard.classList.add(
        "shake"
    );
}


/* ============================================================
   DADOS PARA O EXCEL
============================================================ */

function arrayToText(value) {

    if (!Array.isArray(value)) {
        return value || "";
    }

    return value.join(" | ");
}


function valueWithOther(
    value,
    other
) {

    if (
        value === "Outro" &&
        other
    ) {
        return "Outro: " + other;
    }

    return value || "";
}


function arrayWithOther(
    values,
    other
) {

    if (!Array.isArray(values)) {
        return "";
    }

    return values
        .map(
            function (value) {

                if (
                    value === "Outro" &&
                    other
                ) {
                    return "Outro: " + other;
                }

                return value;
            }
        )
        .join(" | ");
}


function createAssessmentId() {

    return (
        "AV-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );
}


function buildFullAddress() {

    const street = answers.addressStreet || "";
    const number = answers.addressNumber || "";
    const complement = answers.addressComplement || "";
    const district = answers.addressDistrict || "";
    const city = answers.addressCity || "";
    const state = answers.addressState || "";
    const cep = answers.addressCep || "";

    if (!street && !city) {
        return "";
    }

    return (
        street +
        (number ? ", " + number : "") +
        (complement ? " - " + complement : "") +
        (district ? " - " + district : "") +
        (city ? ", " + city : "") +
        (state ? "/" + state : "") +
        (cep ? " - CEP " + cep : "")
    );
}


function buildExcelData() {

    return {

        id:
            createAssessmentId(),

        dataHora:
            new Date().toISOString(),

        nome:
            answers.name || "",

        dataNascimento:
            answers.birthDate || "",

        cidade:
            answers.addressCity || "",

        cep:
            answers.addressCep || "",

        rua:
            answers.addressStreet || "",

        numero:
            answers.addressNumber || "",

        complemento:
            answers.addressComplement || "",

        bairro:
            answers.addressDistrict || "",

        uf:
            answers.addressState || "",

        enderecoCompleto:
            buildFullAddress(),

        sexo:
            answers.sex || "",

        estadoCivil:
            answers.maritalStatus || "",

        escolaridade:
            valueWithOther(
                answers.education,
                answers.educationOther
            ),

        situacaoTrabalho:
            valueWithOther(
                answers.work,
                answers.workOther
            ),

        acompanhamento:
            answers.healthFollowUp || "",

        profissionais:
            arrayWithOther(
                answers.professionals,
                answers.professionalsOther
            ),

        condicoesSaude:
            arrayWithOther(
                answers.healthConditions,
                answers.healthConditionsOther
            ),

        comoConheceuClinica:
            valueWithOther(
                answers.clinicSource,
                answers.clinicSourceOther
            ),

        disponibilidade:
            arrayToText(
                answers.availability
            ),

        perdaUrina:
            answers.urineLoss || "",

        perdaTosseEspirro:
            answers.coughSneeze || "",

        perdaEsforco:
            answers.effort || "",

        urgencia:
            answers.urgency || "",

        perdaAntesBanheiro:
            answers.urgencyLeak || "",

        frequenciaUrinaria:
            answers.frequency || "",

        nocturia:
            answers.nocturia || "",

        impactoVida:
            answers.impact || "",

        evitacao:
            answers.avoidance || "",

        protecao:
            answers.protection || "",

        dorArdencia:
            answers.pain || "",

        sangueUrina:
            answers.blood || ""
    };
}


/* ============================================================
   ENVIO PARA A API (grava na planilha Excel do servidor)
============================================================ */

async function sendToPowerAutomate() {

    const data =
        buildExcelData();

    let response;

    try {

        response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );

    } catch (networkError) {

        throw new Error(
            "Não foi possível conectar ao servidor: " +
            networkError.message
        );
    }

    if (!response.ok) {

        let serverMessage = "";

        try {

            const errorBody =
                await response.json();

            serverMessage =
                errorBody && errorBody.message
                    ? errorBody.message
                    : "";

        } catch (parseError) {
            /* corpo sem JSON, ignora */
        }

        throw new Error(
            "O servidor retornou HTTP " +
            response.status +
            (serverMessage ? " - " + serverMessage : "")
        );
    }

    return {
        success: true,
        configured: true,
        data: data
    };
}


/* ============================================================
   FINALIZAÇÃO
============================================================ */

async function finishAssessment() {

    if (submitted) {
        return;
    }

    submitted = true;

    cleanInvalidConditionalAnswers();

    continueButton.disabled = true;
    backButton.disabled = true;

    loadingOverlay.classList.add(
        "visible"
    );

    loadingOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    let result = null;

    try {

        result =
            await sendToPowerAutomate();

    } catch (error) {

        console.error(
            "Erro ao enviar avaliação:",
            error
        );

        result = {
            success: false,
            configured: true,
            error: error
        };
    }

    loadingOverlay.classList.remove(
        "visible"
    );

    loadingOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    showSummary(result);
}


/* ============================================================
   RESUMO
============================================================ */

function showSummary(result) {

    const name =
        answers.name || "";

    summaryGreeting.innerHTML =
        "Obrigado por responder, <strong>" +
        escapeHTML(
            firstName(name)
        ) +
        "</strong>!<br><br>" +
        "Este resumo organiza as informações que você contou " +
        "e não representa um diagnóstico.";

    if (!result) {

        submissionStatus.className =
            "submission-status";

        submissionStatus.textContent =
            "✓ Avaliação concluída.";

    } else if (!result.configured) {

        submissionStatus.className =
            "submission-status offline";

        submissionStatus.textContent =
            "✓ Avaliação concluída. O envio para o Excel ainda não foi configurado.";

    } else if (result.success) {

        submissionStatus.className =
            "submission-status";

        submissionStatus.textContent =
            "✓ Avaliação enviada com sucesso.";

    } else {

        submissionStatus.className =
            "submission-status offline";

        submissionStatus.textContent =
            "⚠️ A avaliação foi concluída, mas não foi possível enviá-la ao Excel. As respostas continuam disponíveis nesta sessão.";
    }

    renderSummary();

    showScreen(summaryScreen);
}


function addSummarySection(
    title,
    items
) {

    if (!items.length) {
        return;
    }

    const section =
        document.createElement("section");

    section.className =
        "summary-section";

    const heading =
        document.createElement("h2");

    heading.textContent =
        title;

    section.appendChild(heading);

    const grid =
        document.createElement("div");

    grid.className =
        "summary-grid";

    items.forEach(
        function (item) {

            if (
                item.value === undefined ||
                item.value === null ||
                item.value === ""
            ) {
                return;
            }

            const card =
                document.createElement("div");

            card.className =
                "summary-item";

            const question =
                document.createElement("div");

            question.className =
                "summary-question";

            question.textContent =
                item.label;

            const answer =
                document.createElement("div");

            answer.className =
                "summary-answer";

            answer.textContent =
                Array.isArray(item.value)
                    ? item.value.join(" | ")
                    : item.value;

            card.appendChild(question);
            card.appendChild(answer);

            grid.appendChild(card);
        }
    );

    section.appendChild(grid);

    summaryContent.appendChild(section);
}


function renderSummary() {

    summaryContent.innerHTML = "";

    addSummarySection(
        "Sobre você",
        [
            {
                label: "Nome",
                value: answers.name
            },
            {
                label: "Data de nascimento",
                value: formatDate(
                    answers.birthDate
                )
            },
            {
                label: "Endereço",
                value: buildFullAddress()
            },
            {
                label: "Sexo",
                value: answers.sex
            },
            {
                label: "Estado civil",
                value: answers.maritalStatus
            },
            {
                label: "Escolaridade",
                value: valueWithOther(
                    answers.education,
                    answers.educationOther
                )
            },
            {
                label: "Situação de trabalho",
                value: valueWithOther(
                    answers.work,
                    answers.workOther
                )
            }
        ]
    );


    addSummarySection(
        "Cuidados de saúde",
        [
            {
                label: "Acompanhamento",
                value: answers.healthFollowUp
            },
            {
                label: "Profissionais",
                value: arrayWithOther(
                    answers.professionals,
                    answers.professionalsOther
                )
            },
            {
                label: "Condições de saúde",
                value: arrayWithOther(
                    answers.healthConditions,
                    answers.healthConditionsOther
                )
            }
        ]
    );


    addSummarySection(
        "Clínica de Fisioterapia FAM",
        [
            {
                label: "Como conheceu a clínica",
                value: valueWithOther(
                    answers.clinicSource,
                    answers.clinicSourceOther
                )
            },
            {
                label: "Disponibilidade",
                value: answers.availability
            }
        ]
    );


    addSummarySection(
        "Saúde urinária",
        [
            {
                label: "Perda de urina",
                value: answers.urineLoss
            },
            {
                label: "Perda ao tossir, espirrar ou rir",
                value: answers.coughSneeze
            },
            {
                label: "Perda ao correr, pular ou fazer esforço",
                value: answers.effort
            },
            {
                label: "Vontade forte e repentina de urinar",
                value: answers.urgency
            },
            {
                label: "Perda antes de chegar ao banheiro",
                value: answers.urgencyLeak
            },
            {
                label: "Frequência urinária",
                value: answers.frequency
            },
            {
                label: "Acordar à noite para urinar",
                value: answers.nocturia
            },
            {
                label: "Impacto na vida",
                value: answers.impact
            },
            {
                label: "Evitação de atividades",
                value: answers.avoidance
            },
            {
                label: "Uso de proteção",
                value: answers.protection
            },
            {
                label: "Dor ou ardência",
                value: answers.pain
            },
            {
                label: "Sangue na urina",
                value: answers.blood
            }
        ]
    );

    updateAlert();
}


function formatDate(date) {

    if (!date) {
        return "";
    }

    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );
}


/* ============================================================
   ALERTAS
============================================================ */

function updateAlert() {

    const shouldAlert =
        hasUrineLoss() ||
        (
            answers.urgency &&
            answers.urgency !== "Nunca"
        ) ||
        (
            answers.impact === "Muito" ||
            answers.impact === "Extremamente"
        ) ||
        answers.blood === "Sim" ||
        (
            answers.pain === "Frequentemente" ||
            answers.pain === "Sempre"
        );

    alertBox.style.display =
        shouldAlert
            ? "block"
            : "none";
}


/* ============================================================
   REINICIAR
============================================================ */

function restartAssessment() {

    answers = {};

    currentIndex = 0;

    submitted = false;

    progressBar.style.width = "0%";

    continueButton.disabled = true;

    backButton.disabled = false;

    showScreen(
        welcomeScreen
    );
}


/* ============================================================
   EVENTOS
============================================================ */

startButton.addEventListener(
    "click",
    function () {

        answers = {};

        currentIndex = 0;

        submitted = false;

        showScreen(
            quizScreen
        );

        renderQuestion();
    }
);


backButton.addEventListener(
    "click",
    function () {

        goBack();
    }
);


continueButton.addEventListener(
    "click",
    async function () {

        await continueAssessment();
    }
);


restartButton.addEventListener(
    "click",
    function () {

        restartAssessment();
    }
);


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

showScreen(
    welcomeScreen
);