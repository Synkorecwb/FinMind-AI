document.addEventListener("DOMContentLoaded", function () {
  // Elementos da interface
  const chatContainer = document.getElementById("chatContainer");
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const usernameElement = document.getElementById("username");

  // Função para adicionar mensagem ao chat
  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(isUser ? "user-message" : "assistant-message");
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Respostas pré-definidas do assistente
  const assistantResponses = {
    economizar:
      "Para economizar mais, recomendo: 1) Analisar seus gastos por categoria, 2) Criar um orçamento realista, 3) Automatizar suas economias.",
    investir:
      "Para começar a investir: 1) Defina seus objetivos, 2) Avalie seu perfil de risco, 3) Considere fundos de investimento ou ETFs para começar.",
    orçamento:
      "Para criar um orçamento eficaz: 1) Liste todas suas receitas, 2) Categorize seus gastos, 3) Defina limites realistas, 4) Acompanhe regularmente.",
    dívidas:
      "Para lidar com dívidas: 1) Liste todas suas dívidas, 2) Priorize as com juros mais altos, 3) Negocie melhores condições, 4) Considere consolidar dívidas.",
    default:
      "Entendi sua pergunta. Aqui está uma análise baseada em seus dados financeiros: Sua saúde financeira está boa (82/100), mas você pode melhorar reduzindo gastos com alimentação fora de casa.",
  };

  // Função para processar a entrada do usuário
  function processUserInput() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, true);
    userInput.value = "";

    // Simular processamento
    setTimeout(() => {
      let response = assistantResponses.default;

      // Verificar palavras-chave
      const lowerMessage = message.toLowerCase();
      if (
        lowerMessage.includes("economizar") ||
        lowerMessage.includes("economia")
      ) {
        response = assistantResponses.economizar;
      } else if (
        lowerMessage.includes("investir") ||
        lowerMessage.includes("investimento")
      ) {
        response = assistantResponses.investir;
      } else if (
        lowerMessage.includes("orçamento") ||
        lowerMessage.includes("orçamentar")
      ) {
        response = assistantResponses.orçamento;
      } else if (
        lowerMessage.includes("dívida") ||
        lowerMessage.includes("dívidas")
      ) {
        response = assistantResponses.dívidas;
      }

      addMessage(response);
    }, 1000);
  }

  // Event listeners
  sendButton.addEventListener("click", processUserInput);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      processUserInput();
    }
  });

  // Simular dados do usuário
  function simulateUserData() {
    // Nome do usuário (poderia ser obtido de um login)
    const names = ["Carlos", "Ana", "Pedro", "Mariana"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    usernameElement.textContent = randomName;

    // Atualizar saúde financeira aleatoriamente
    setInterval(() => {
      const healthScore = document.getElementById("healthScore");
      const currentScore = parseInt(healthScore.textContent);
      const newScore = Math.min(
        100,
        Math.max(60, currentScore + Math.floor(Math.random() * 5) - 2)
      );
      healthScore.textContent = newScore;

      // Mudar cor baseada na pontuação
      if (newScore >= 80) {
        healthScore.style.backgroundColor = "#4ad66d"; // Verde
      } else if (newScore >= 60) {
        healthScore.style.backgroundColor = "#f8961e"; // Laranja
      } else {
        healthScore.style.backgroundColor = "#f94144"; // Vermelho
      }
    }, 5000);
  }

  // Inicializar
  simulateUserData();

  // Adicionar estilo para mensagens do usuário
  const style = document.createElement("style");
  style.textContent = `
        .user-message {
            background-color: #e3f2fd;
            padding: 0.8rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            align-self: flex-end;
            max-width: 80%;
        }
    `;
  document.head.appendChild(style);
});
