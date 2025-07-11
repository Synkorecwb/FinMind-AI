// Simulação de banco de dados de transações
let transactions = [
  {
    id: 1,
    userId: 1,
    type: "expense",
    category: "Alimentação",
    amount: 45.9,
    date: "2023-05-15",
    description: "Almoço no restaurante",
    receipt: null,
  },
  {
    id: 2,
    userId: 1,
    type: "income",
    category: "Salário",
    amount: 3500.0,
    date: "2023-05-05",
    description: "Salário mensal",
    receipt: null,
  },
];

// Categorias padrão
const categories = [
  { id: 1, name: "Alimentação", type: "expense", color: "#4ad66d" },
  { id: 2, name: "Transporte", type: "expense", color: "#4361ee" },
  { id: 3, name: "Moradia", type: "expense", color: "#f8961e" },
  { id: 4, name: "Lazer", type: "expense", color: "#f94144" },
  { id: 5, name: "Salário", type: "income", color: "#2a9d8f" },
  { id: 6, name: "Investimentos", type: "income", color: "#3a0ca3" },
];

// Variáveis globais
let transactionModal = null;
let currentEditingId = null;

// Função para carregar o conteúdo principal
function loadContent(page) {
  const user = getCurrentUser();
  if (!user) return;

  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  switch (page) {
    case "transactions":
      loadTransactions(user.id);
      break;
    case "categories":
      loadCategories();
      break;
    case "reports":
      loadReports(user.id);
      break;
    case "goals":
      loadGoals(user.id);
      break;
    case "users":
      if (user.role === "admin") {
        loadUsers();
      } else {
        contentArea.innerHTML =
          '<div class="alert">Acesso não autorizado</div>';
      }
      break;
    default:
      loadDashboard(user.id);
  }
}

// Função para carregar o dashboard
function loadDashboard(userId) {
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  const userTransactions = transactions.filter((t) => t.userId === userId);
  const totalIncome = calculateTotal(userTransactions, "income");
  const totalExpenses = calculateTotal(userTransactions, "expense");
  const balance = totalIncome - totalExpenses;

  contentArea.innerHTML = `
      <div class="dashboard-summary">
          <div class="summary-card balance">
              <h3>Saldo Atual</h3>
              <div class="amount">R$ ${balance.toFixed(2)}</div>
          </div>
          
          <div class="summary-card income">
              <h3>Receitas</h3>
              <div class="amount">R$ ${totalIncome.toFixed(2)}</div>
          </div>
          
          <div class="summary-card expenses">
              <h3>Despesas</h3>
              <div class="amount">R$ ${totalExpenses.toFixed(2)}</div>
          </div>
      </div>
      
      <div class="recent-transactions">
          <h3>Últimas Transações</h3>
          ${renderTransactionsTable(userTransactions.slice(0, 5))}
      </div>
  `;
}

// Função auxiliar para calcular totais
function calculateTotal(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

// Função para renderizar tabela de transações
function renderTransactionsTable(transactionsList) {
  if (!transactionsList.length) return "<p>Nenhuma transação encontrada</p>";

  return `
      <table>
          <thead>
              <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
              </tr>
          </thead>
          <tbody>
              ${transactionsList
                .map(
                  (t) => `
                  <tr class="${t.type}">
                      <td>${formatDate(t.date)}</td>
                      <td>${t.description}</td>
                      <td>${t.category}</td>
                      <td>R$ ${t.amount.toFixed(2)}</td>
                  </tr>
              `
                )
                .join("")}
          </tbody>
      </table>
  `;
}

// Função para formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

// Função para carregar transações
function loadTransactions(userId) {
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  const userTransactions = transactions.filter((t) => t.userId === userId);

  contentArea.innerHTML = `
      <div class="transactions-header">
          <h2>Transações</h2>
          <button id="addTransaction" class="btn-primary">
              <i class="fas fa-plus"></i> Nova Transação
          </button>
      </div>
      
      <div class="transactions-filters">
          <select id="filterType">
              <option value="all">Todas</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
          </select>
          
          <select id="filterCategory">
              <option value="all">Todas categorias</option>
              ${categories
                .map((c) => `<option value="${c.id}">${c.name}</option>`)
                .join("")}
          </select>
          
          <input type="month" id="filterMonth" value="${new Date()
            .toISOString()
            .slice(0, 7)}">
      </div>
      
      ${renderFullTransactionsTable(userTransactions)}
      
      ${renderTransactionModal()}
  `;

  initTransactionModal();
  setupTransactionEventListeners();
}

// Função para renderizar tabela completa de transações
function renderFullTransactionsTable(transactionsList) {
  if (!transactionsList.length) return "<p>Nenhuma transação encontrada</p>";

  return `
      <table class="transactions-table">
          <thead>
              <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Ações</th>
              </tr>
          </thead>
          <tbody>
              ${transactionsList
                .map(
                  (t) => `
                  <tr class="${t.type}">
                      <td>${formatDate(t.date)}</td>
                      <td>${t.description}</td>
                      <td>${t.type === "income" ? "Receita" : "Despesa"}</td>
                      <td>${t.category}</td>
                      <td>R$ ${t.amount.toFixed(2)}</td>
                      <td>
                          <button class="btn-icon edit" data-id="${t.id}">
                              <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn-icon delete" data-id="${t.id}">
                              <i class="fas fa-trash"></i>
                          </button>
                      </td>
                  </tr>
              `
                )
                .join("")}
          </tbody>
      </table>
  `;
}

// Função para renderizar modal de transação
function renderTransactionModal() {
  return `
      <div class="modal" id="transactionModal">
          <div class="modal-content">
              <span class="close-modal">&times;</span>
              <h2 id="transactionModalTitle">Nova Transação</h2>
              <form id="transactionForm">
                  <input type="hidden" id="transactionId">
                  
                  <div class="form-group">
                      <label for="transactionType">Tipo</label>
                      <select id="transactionType" required>
                          <option value="">Selecione...</option>
                          <option value="income">Receita</option>
                          <option value="expense">Despesa</option>
                      </select>
                  </div>
                  
                  <div class="form-group">
                      <label for="transactionCategory">Categoria</label>
                      <select id="transactionCategory" required>
                          <option value="">Selecione...</option>
                          ${categories
                            .map(
                              (c) =>
                                `<option value="${c.id}" data-type="${c.type}">${c.name}</option>`
                            )
                            .join("")}
                      </select>
                  </div>
                  
                  <div class="form-group">
                      <label for="transactionAmount">Valor</label>
                      <input type="number" id="transactionAmount" step="0.01" min="0" required>
                  </div>
                  
                  <div class="form-group">
                      <label for="transactionDate">Data</label>
                      <input type="date" id="transactionDate" required>
                  </div>
                  
                  <div class="form-group">
                      <label for="transactionDescription">Descrição</label>
                      <input type="text" id="transactionDescription" required>
                  </div>
                  
                  <button type="submit" class="btn-primary">Salvar</button>
              </form>
          </div>
      </div>
  `;
}

// Função para configurar event listeners
function setupTransactionEventListeners() {
  // Botão para adicionar transação
  document
    .getElementById("addTransaction")
    ?.addEventListener("click", showTransactionModal);

  // Filtros
  document
    .getElementById("filterType")
    ?.addEventListener("change", filterTransactions);
  document
    .getElementById("filterCategory")
    ?.addEventListener("change", filterTransactions);
  document
    .getElementById("filterMonth")
    ?.addEventListener("change", filterTransactions);

  // Botões de ação nas linhas
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.getAttribute("data-id"));
      editTransaction(id);
    });
  });

  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.getAttribute("data-id"));
      deleteTransaction(id);
    });
  });
}

// Função para inicializar o modal
function initTransactionModal() {
  transactionModal = document.getElementById("transactionModal");
  if (!transactionModal) return;

  // Fechar modal
  document
    .querySelector("#transactionModal .close-modal")
    ?.addEventListener("click", () => {
      transactionModal.style.display = "none";
    });

  // Fechar ao clicar fora
  transactionModal.addEventListener("click", (e) => {
    if (e.target === transactionModal) {
      transactionModal.style.display = "none";
    }
  });

  // Atualizar categorias quando o tipo muda
  document
    .getElementById("transactionType")
    ?.addEventListener("change", (e) => {
      updateCategoryOptions(e.target.value);
    });

  // Formulário de transação
  document
    .getElementById("transactionForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      saveTransaction();
    });
}

// Função para atualizar opções de categoria
function updateCategoryOptions(type) {
  const categorySelect = document.getElementById("transactionCategory");
  if (!categorySelect) return;

  const options = categorySelect.querySelectorAll("option");

  options.forEach((option) => {
    if (option.value === "") return;

    const optionType = option.getAttribute("data-type");
    if (type && optionType !== type) {
      option.style.display = "none";
      option.disabled = true;
    } else {
      option.style.display = "block";
      option.disabled = false;
    }
  });
}

// Função para mostrar modal de transação
function showTransactionModal() {
  if (!transactionModal) return;

  currentEditingId = null;
  const form = document.getElementById("transactionForm");
  if (form) form.reset();

  const title = document.getElementById("transactionModalTitle");
  if (title) title.textContent = "Nova Transação";

  const idInput = document.getElementById("transactionId");
  if (idInput) idInput.value = "";

  transactionModal.style.display = "flex";
}

// Função para filtrar transações
function filterTransactions() {
  const type = document.getElementById("filterType")?.value || "all";
  const category = document.getElementById("filterCategory")?.value || "all";
  const month = document.getElementById("filterMonth")?.value;

  const rows = document.querySelectorAll(".transactions-table tbody tr");

  rows.forEach((row) => {
    const rowType = row.classList.contains("income") ? "income" : "expense";
    const rowCategory = row.cells[3]?.textContent || "";
    const rowDate = new Date(row.cells[0]?.textContent);
    const rowMonth = rowDate
      ? `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(
          2,
          "0"
        )}`
      : "";

    const typeMatch = type === "all" || rowType === type;
    const categoryMatch = category === "all" || rowCategory === category;
    const monthMatch = !month || rowMonth === month;

    row.style.display = typeMatch && categoryMatch && monthMatch ? "" : "none";
  });
}

// Função para editar transação
function editTransaction(id) {
  if (!transactionModal) return;

  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  currentEditingId = id;

  const form = document.getElementById("transactionForm");
  if (!form) return;

  form.reset();

  const title = document.getElementById("transactionModalTitle");
  if (title) title.textContent = "Editar Transação";

  const idInput = document.getElementById("transactionId");
  if (idInput) idInput.value = transaction.id;

  const typeInput = document.getElementById("transactionType");
  if (typeInput) typeInput.value = transaction.type;

  const amountInput = document.getElementById("transactionAmount");
  if (amountInput) amountInput.value = transaction.amount;

  const dateInput = document.getElementById("transactionDate");
  if (dateInput) dateInput.value = transaction.date;

  const descInput = document.getElementById("transactionDescription");
  if (descInput) descInput.value = transaction.description;

  updateCategoryOptions(transaction.type);

  const categorySelect = document.getElementById("transactionCategory");
  if (categorySelect) {
    setTimeout(() => {
      const categoryId =
        categories.find((c) => c.name === transaction.category)?.id || "";
      categorySelect.value = categoryId;
    }, 100);
  }

  transactionModal.style.display = "flex";
}

// Função para salvar transação
function saveTransaction() {
  const user = getCurrentUser();
  if (!user) return;

  const form = document.getElementById("transactionForm");
  if (!form) return;

  const type = document.getElementById("transactionType")?.value;
  const categoryId = document.getElementById("transactionCategory")?.value;
  const amount = document.getElementById("transactionAmount")?.value;
  const date = document.getElementById("transactionDate")?.value;
  const description = document.getElementById("transactionDescription")?.value;

  if (!type || !categoryId || !amount || !date || !description) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  const category = categories.find((c) => c.id === parseInt(categoryId))?.name;
  if (!category) {
    alert("Categoria inválida");
    return;
  }

  const transactionData = {
    id: currentEditingId || transactions.length + 1,
    userId: user.id,
    type,
    category,
    amount: parseFloat(amount),
    date,
    description: description.trim(),
    receipt: null,
  };

  if (currentEditingId) {
    const index = transactions.findIndex((t) => t.id === currentEditingId);
    if (index !== -1) {
      transactions[index] = transactionData;
    }
  } else {
    transactions.push(transactionData);
  }

  transactionModal.style.display = "none";
  loadTransactions(user.id);
}

// Função para excluir transação
function deleteTransaction(id) {
  if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

  transactions = transactions.filter((t) => t.id !== id);
  loadTransactions(getCurrentUser().id);
}

// Função para carregar categorias
function loadCategories() {
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  contentArea.innerHTML = `
      <div class="categories-header">
          <h2>Categorias</h2>
          <button id="addCategory" class="btn-primary">
              <i class="fas fa-plus"></i> Nova Categoria
          </button>
      </div>
      
      <table class="categories-table">
          <thead>
              <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Ações</th>
              </tr>
          </thead>
          <tbody>
              ${categories
                .map(
                  (c) => `
                  <tr>
                      <td>${c.name}</td>
                      <td>${c.type === "income" ? "Receita" : "Despesa"}</td>
                      <td>
                          <button class="btn-icon edit" data-id="${c.id}">
                              <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn-icon delete" data-id="${c.id}">
                              <i class="fas fa-trash"></i>
                          </button>
                      </td>
                  </tr>
              `
                )
                .join("")}
          </tbody>
      </table>
  `;
}

// Função para carregar relatórios
function loadReports(userId) {
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  contentArea.innerHTML = `
      <div class="reports-container">
          <h2>Relatórios</h2>
          <p>Relatórios financeiros serão exibidos aqui.</p>
      </div>
  `;
}

// Função para carregar metas
function loadGoals(userId) {
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  contentArea.innerHTML = `
      <div class="goals-container">
          <h2>Metas</h2>
          <p>Suas metas financeiras serão exibidas aqui.</p>
      </div>
  `;
}

// Função para carregar usuários
function loadUsers() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") return;

  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  contentArea.innerHTML = `
      <div class="users-header">
          <h2>Usuários</h2>
          <button id="addUser" class="btn-primary">
              <i class="fas fa-plus"></i> Novo Usuário
          </button>
      </div>
      
      <table class="users-table">
          <thead>
              <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Ações</th>
              </tr>
          </thead>
          <tbody>
              ${users
                .map(
                  (u) => `
                  <tr>
                      <td>
                          <img src="${u.avatar}" alt="${
                    u.name
                  }" class="user-avatar">
                          ${u.name}
                      </td>
                      <td>${u.email}</td>
                      <td>${
                        u.role === "admin" ? "Administrador" : "Usuário"
                      }</td>
                      <td>
                          <button class="btn-icon edit" data-id="${u.id}">
                              <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn-icon delete" data-id="${u.id}">
                              <i class="fas fa-trash"></i>
                          </button>
                      </td>
                  </tr>
              `
                )
                .join("")}
          </tbody>
      </table>
  `;
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  // Configura navegação
  setupNavigation();

  // Carrega conteúdo inicial
  const initialPage = window.location.hash.replace("#", "") || "dashboard";
  loadContent(initialPage);
});

// Configura navegação
function setupNavigation() {
  const navItems = document.querySelectorAll(".main-nav .nav-item");
  if (!navItems.length) return;

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      navItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");

      const page = this.id.replace("Link", "");
      loadContent(page);
      window.location.hash = page;
    });
  });

  // Logout
  document
    .getElementById("logoutLink")
    ?.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
}
