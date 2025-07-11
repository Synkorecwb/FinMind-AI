// Simulação de banco de dados de usuários
let users = [
  {
    id: 1,
    name: "Admin",
    login: "admin",
    email: "admin@finmind.com",
    password: "admin123",
    phone: "(11) 99999-9999",
    age: 30,
    address: "Rua Admin, 123",
    role: "admin",
    avatar:
      "https://ui-avatars.com/api/?name=Admin&background=4361ee&color=fff",
  },
];

// Função para autenticar usuário
function authenticateUser(loginInput, password) {
  return new Promise((resolve, reject) => {
    // Simular delay de rede
    setTimeout(() => {
      const user = users.find(
        (u) =>
          (u.login === loginInput || u.email === loginInput) &&
          u.password === password
      );

      if (user) {
        localStorage.setItem("finmind_token", "simulated_token");
        localStorage.setItem("finmind_user_id", user.id);
        resolve(user);
      } else {
        reject(new Error("Login ou senha incorretos"));
      }
    }, 1000);
  });
}

// Verifica se o usuário está autenticado
function isAuthenticated() {
  return localStorage.getItem("finmind_token") !== null;
}

// Obtém o usuário atual
function getCurrentUser() {
  const userId = parseInt(localStorage.getItem("finmind_user_id"));
  const user = users.find((user) => user.id === userId);

  if (!user) {
    logout();
    return null;
  }

  return user;
}

// Função para validar a senha
function validatePassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  return regex.test(password);
}

// Função para registrar novo usuário
function registerNewUser(userData) {
  return new Promise((resolve, reject) => {
    // Validações
    if (users.some((u) => u.email === userData.email)) {
      reject(new Error("E-mail já cadastrado"));
      return;
    }

    if (users.some((u) => u.login === userData.login)) {
      reject(new Error("Login já em uso"));
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      reject(new Error("As senhas não coincidem"));
      return;
    }

    if (!validatePassword(userData.password)) {
      reject(
        new Error(
          "A senha deve ter pelo menos 6 caracteres, incluindo letras e números"
        )
      );
      return;
    }

    if (userData.age < 18) {
      reject(new Error("Você deve ter pelo menos 18 anos"));
      return;
    }

    const newUser = {
      id: users.length + 1,
      name: userData.name,
      login: userData.login,
      email: userData.email,
      phone: userData.phone,
      age: userData.age,
      address: userData.address,
      password: userData.password,
      role: "user",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.name
      )}&background=3a0ca3&color=fff`,
    };

    users.push(newUser);
    resolve(newUser);
  });
}

// Função para recuperar senha
function recoverUserPassword(email) {
  return new Promise((resolve, reject) => {
    const user = users.find((u) => u.email === email);

    if (user) {
      // Em produção, você enviaria um e-mail com o link de recuperação
      resolve(`Um link de recuperação foi enviado para ${email}`);
    } else {
      reject(new Error("E-mail não encontrado"));
    }
  });
}

// Função para abrir o modal de cadastro
function showRegisterModal() {
  const modal = document.getElementById("registerModal");
  modal.style.display = "flex";
  document.getElementById("registerForm").reset();

  // Fechar modal ao clicar no X
  document.querySelector(".close-modal").addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Fechar modal ao clicar fora
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// ========== EVENT LISTENERS ========== //

// Formulário de Login
if (document.getElementById("loginForm")) {
  document
    .getElementById("loginForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const loginInput = document.getElementById("login").value.trim();
      const password = document.getElementById("password").value.trim();
      const loginBtn = document.querySelector(
        '#loginForm button[type="submit"]'
      );
      const btnText = loginBtn.querySelector(".btn-text");

      // Validação dos campos
      if (!loginInput || !password) {
        alert("Por favor, preencha todos os campos");
        return;
      }

      // Feedback visual
      loginBtn.disabled = true;
      btnText.textContent = "Entrando...";
      loginBtn.insertAdjacentHTML(
        "beforeend",
        '<i class="fas fa-spinner fa-spin"></i>'
      );

      try {
        const user = await authenticateUser(loginInput, password);

        // Redirecionar após login bem-sucedido
        window.location.href = "../pages/dashboard.html";
      } catch (error) {
        alert(error.message);
      } finally {
        loginBtn.disabled = false;
        btnText.textContent = "Entrar";
        const spinner = loginBtn.querySelector(".fa-spinner");
        if (spinner) spinner.remove();
      }
    });
}

// Link "Criar nova conta"
if (document.getElementById("showRegister")) {
  document
    .getElementById("showRegister")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showRegisterModal();
    });
}

// Formulário de Cadastro
if (document.getElementById("registerForm")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const registerBtn = document.querySelector(
        '#registerForm button[type="submit"]'
      );
      const btnText = registerBtn.querySelector(".btn-text");
      registerBtn.disabled = true;
      btnText.textContent = "Cadastrando...";
      registerBtn.insertAdjacentHTML(
        "beforeend",
        '<i class="fas fa-spinner fa-spin"></i>'
      );

      try {
        const userData = {
          name: document.getElementById("regName").value.trim(),
          login: document.getElementById("regLogin").value.trim(),
          email: document.getElementById("regEmail").value.trim(),
          phone: document.getElementById("regPhone").value.trim(),
          age: parseInt(document.getElementById("regAge").value),
          address: document.getElementById("regAddress").value.trim(),
          password: document.getElementById("regPassword").value,
          confirmPassword: document.getElementById("regConfirmPassword").value,
        };

        const user = await registerNewUser(userData);

        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        document.getElementById("registerModal").style.display = "none";
        document.getElementById("registerForm").reset();
      } catch (error) {
        alert(error.message);
      } finally {
        registerBtn.disabled = false;
        btnText.textContent = "Cadastrar";
        const spinner = registerBtn.querySelector(".fa-spinner");
        if (spinner) spinner.remove();
      }
    });
}

// Link "Esqueci minha senha"
if (document.getElementById("forgotPassword")) {
  document
    .getElementById("forgotPassword")
    .addEventListener("click", function (e) {
      e.preventDefault();

      const email = prompt("Digite seu e-mail cadastrado:");
      if (email) {
        recoverUserPassword(email)
          .then((message) => {
            alert(message);
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    });
}

// Link de Logout
if (document.getElementById("logoutLink")) {
  document.getElementById("logoutLink").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });
}

// Carrega informações do usuário no dashboard
if (document.getElementById("userName")) {
  document.addEventListener("DOMContentLoaded", function () {
    if (!isAuthenticated()) {
      window.location.href = "../pages/login.html";
      return;
    }

    const user = getCurrentUser();
    if (user) {
      document.getElementById("userName").textContent = user.name;
      document.getElementById("userAvatar").src = user.avatar;

      // Mostra/oculta itens baseados no papel do usuário
      if (user.role !== "admin") {
        const usersLink = document.getElementById("usersLink");
        if (usersLink) usersLink.style.display = "none";
      }
    }
  });
}

// Menu toggle para mobile
if (document.getElementById("menuToggle")) {
  document.getElementById("menuToggle").addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("active");
  });
}

// Função de logout
function logout() {
  localStorage.removeItem("finmind_token");
  localStorage.removeItem("finmind_user_id");
  window.location.href = "../pages/login.html";
}
