// js/app.js - Aqui vamos colocar toda a lógica de hábitos, mint de BHT, etc
console.log("BaseHabits carregado! Pronto para construir o futuro dos hábitos on-chain.");
// js/app.js - Lógica de missões diárias, mudança automática e upload de foto

// Verifica se conectado, senão redireciona
const address = localStorage.getItem("connectedAddress");
if (!address) {
  window.location.href = "index.html";
} else {
  document.getElementById("accountAddress").textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Botão desconectar
document.getElementById("disconnectButton").addEventListener("click", () => {
  localStorage.removeItem("connectedAddress");
  window.location.href = "index.html";
});

// Pool de 100 missões (hábitos diários variados)
const missionPool = [
  { title: "Beber 2L de água", reward: 10 },
  { title: "Fazer 30min de exercício", reward: 15 },
  { title: "Ler 20 páginas de um livro", reward: 20 },
  { title: "Meditar por 10min", reward: 10 },
  { title: "Caminhar 10.000 passos", reward: 15 },
  { title: "Comer 5 porções de frutas/vegetais", reward: 10 },
  { title: "Dormir 8h", reward: 20 },
  { title: "Escrever 3 gratidões", reward: 5 },
  { title: "Aprender uma palavra nova", reward: 5 },
  { title: "Beber chá verde", reward: 5 },
  { title: "Fazer alongamento", reward: 10 },
  { title: "Ouvir um podcast", reward: 10 },
  { title: "Organizar a mesa", reward: 5 },
  { title: "Ligar para um amigo", reward: 10 },
  { title: "Planejar o dia", reward: 5 },
  { title: "Evitar açúcar", reward: 15 },
  { title: "Praticar idioma por 15min", reward: 10 },
  { title: "Tomar sol por 15min", reward: 5 },
  { title: "Fazer respiração profunda", reward: 5 },
  { title: "Ler notícias por 10min", reward: 5 },
  { title: "Beber café sem açúcar", reward: 5 },
  { title: "Fazer 50 abdominais", reward: 10 },
  { title: "Correr 5km", reward: 20 },
  { title: "Estudar programação por 30min", reward: 15 },
  { title: "Limpar a casa por 20min", reward: 10 },
  { title: "Beber suco natural", reward: 5 },
  { title: "Fazer yoga", reward: 15 },
  { title: "Escrever diário", reward: 10 },
  { title: "Evitar redes sociais por 1h", reward: 10 },
  { title: "Comer salada", reward: 10 },
  { title: "Aprender uma receita nova", reward: 15 },
  { title: "Fazer flexões", reward: 10 },
  { title: "Ouvir música relaxante", reward: 5 },
  { title: "Planejar finanças", reward: 10 },
  { title: "Ler um artigo científico", reward: 15 },
  { title: "Fazer jardinagem", reward: 10 },
  { title: "Beber 1L de chá", reward: 5 },
  { title: "Praticar gratidão", reward: 5 },
  { title: "Fazer prancha por 1min", reward: 10 },
  { title: "Estudar história", reward: 10 },
  { title: "Cozinhar refeição saudável", reward: 15 },
  { title: "Fazer limpeza digital", reward: 5 },
  { title: "Aprender instrumento por 15min", reward: 10 },
  { title: "Fazer voluntariado", reward: 20 },
  { title: "Ler poesia", reward: 5 },
  { title: "Fazer massagem", reward: 10 },
  { title: "Estudar filosofia", reward: 10 },
  { title: "Beber smoothie", reward: 5 },
  { title: "Praticar mindfulness", reward: 10 },
  { title: "Fazer ciclismo", reward: 15 },
  { title: "Ler biografia", reward: 15 },
  { title: "Organizar guarda-roupa", reward: 10 },
  { title: "Fazer arte", reward: 10 },
  { title: "Estudar ciência", reward: 15 },
  { title: "Beber água com limão", reward: 5 },
  { title: "Fazer natação", reward: 20 },
  { title: "Ler ficção", reward: 10 },
  { title: "Planejar viagens", reward: 5 },
  { title: "Fazer dança", reward: 15 },
  { title: "Estudar economia", reward: 10 },
  { title: "Comer proteína", reward: 10 },
  { title: "Fazer pilates", reward: 15 },
  { title: "Ler não-ficção", reward: 10 },
  { title: "Organizar arquivos", reward: 5 },
  { title: "Praticar xadrez", reward: 10 },
  { title: "Fazer hiking", reward: 20 },
  { title: "Estudar arte", reward: 10 },
  { title: "Beber leite vegetal", reward: 5 },
  { title: "Fazer karatê", reward: 15 },
  { title: "Ler quadrinhos", reward: 5 },
  { title: "Planejar carreira", reward: 10 },
  { title: "Fazer boxe", reward: 15 },
  { title: "Estudar música", reward: 10 },
  { title: "Comer grãos integrais", reward: 10 },
  { title: "Fazer tai chi", reward: 10 },
  { title: "Ler revistas", reward: 5 },
  { title: "Organizar livros", reward: 5 },
  { title: "Praticar golfe", reward: 15 },
  { title: "Fazer escalada", reward: 20 },
  { title: "Estudar geografia", reward: 10 },
  { title: "Beber infusão", reward: 5 },
  { title: "Fazer surf", reward: 20 },
  { title: "Ler blogs", reward: 5 },
  { title: "Planejar férias", reward: 10 },
  { title: "Fazer esqui", reward: 20 },
  { title: "Estudar psicologia", reward: 10 },
  { title: "Comer nozes", reward: 5 },
  { title: "Fazer judô", reward: 15 },
  { title: "Ler jornais", reward: 5 },
  { title: "Organizar fotos", reward: 5 },
  { title: "Praticar tênis", reward: 15 },
  { title: "Fazer voleibol", reward: 15 },
  { title: "Estudar sociologia", reward: 10 },
  { title: "Beber iogurte", reward: 5 },
  { title: "Fazer basquete", reward: 15 },
  { title: "Ler enciclopédia", reward: 10 },
  { title: "Planejar metas", reward: 10 },
  { title: "Fazer futebol", reward: 15 },
  { title: "Estudar antropologia", reward: 10 },
  { title: "Comer frutas frescas", reward: 5 },
  { title: "Fazer ginástica", reward: 10 }
];

// Função para gerar 5 missões diárias aleatórias do pool (exemplo, pode mudar o número)
function getDailyMissions() {
  const shuffled = missionPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5); // 5 missões por dia, para não sobrecarregar a página
}

// Lógica de mudança automática às 21h BR (UTC-3)
function checkMissionUpdate() {
  const now = new Date();
  const lastUpdate = localStorage.getItem("lastMissionUpdate");
  const lastDate = lastUpdate ? new Date(lastUpdate) : new Date(0);

  // Hora atual em BR (UTC-3)
  const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const updateHour = 21;
  const needsUpdate = brNow.getHours() >= updateHour && (lastDate.getDate() !== brNow.getDate() || lastDate.getMonth() !== brNow.getMonth() || lastDate.getFullYear() !== brNow.getFullYear());

  if (needsUpdate) {
    localStorage.setItem("dailyMissions", JSON.stringify(getDailyMissions()));
    localStorage.setItem("lastMissionUpdate", now.toISOString());
  }

  return JSON.parse(localStorage.getItem("dailyMissions")) || getDailyMissions();
}

// Renderiza missões diárias
function renderDailyMissions() {
  const missions = checkMissionUpdate();
  const list = document.getElementById("dailyMissionsList");
  list.innerHTML = "";
  missions.forEach(m => {
    const card = document.createElement("div");
    card.className = "mission-card";
    card.innerHTML = `
      <h3>${m.title}</h3>
      <p>Recompensa: ${m.reward} $BHT</p>
      <button class="btn-checkin">Fazer Check-in</button>
      <div class="photo-upload hidden">
        <input type="file" accept="image/*" capture="camera">
        <img class="photo-preview" src="" alt="Preview" style="display:none;">
      </div>
    `;
    list.appendChild(card);
  });
}

// Inicializa
renderDailyMissions();

// Lógica de check-in e upload de foto para autenticação (preview local)
document.querySelectorAll(".btn-checkin").forEach(btn => {
  btn.addEventListener("click", () => {
    const uploadDiv = btn.nextElementSibling;
    uploadDiv.classList.remove("hidden");
    const input = uploadDiv.querySelector("input");
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = uploadDiv.querySelector(".photo-preview");
          preview.src = ev.target.result;
          preview.style.display = "block";
          btn.textContent = "Autenticado ✓";
          btn.disabled = true;
          // Aqui no futuro: integrar com backend para salvar foto e mint BHT
        };
        reader.readAsDataURL(file);
      }
    });
  });
});