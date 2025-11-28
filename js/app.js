// js/app.js - MISSÕES DIÁRIAS 100% ESTÁVEIS - MUDAM SÓ ÀS 21h BR

const address = localStorage.getItem("connectedAddress");
if (!address) {
  window.location.href = "index.html";
} else {
  document.getElementById("accountAddress").textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
}

document.getElementById("disconnectButton").addEventListener("click", () => {
  localStorage.removeItem("connectedAddress");
  window.location.href = "index.html";
});

// Pool de 100 missões
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
  // ... (as outras 88 missões do seu pool anterior)
  { title: "Fazer ginástica", reward: 10 }
];

// Gera 6 missões aleatórias fixas por dia (baseado na data BR)
function generateDailyMissionsForDate(dateString) {
  // Usa a data como seed para sempre gerar as mesmas missões no mesmo dia
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed += dateString.charCodeAt(i);
  }

  const seededRandom = (function(s) {
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  })(seed);

  const shuffled = [...missionPool].sort(() => seededRandom() - 0.5);
  return shuffled.slice(0, 6);
}

// Pega a data atual no fuso horário de Brasília (UTC-3)
function getTodayDateString() {
  const now = new Date();
  const br = new Date(now.getTime() - 3 * 60 * 60 * 1000); // UTC-3
  return br.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Verifica se já passou das 21h BR e se é um novo dia
function shouldUpdateMissions() {
  const now = new Date();
  const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const currentDate = getTodayDateString();
  const lastDate = localStorage.getItem("missionDay");

  if (!lastDate) return true;
  if (lastDate !== currentDate && brNow.getHours() >= 21) {
    return true;
  }
  return false;
}

// Obtém ou gera as missões do dia
function getTodayMissions() {
  const currentDate = getTodayDateString();

  if (shouldUpdateMissions()) {
    const newMissions = generateDailyMissionsForDate(currentDate);
    localStorage.setItem("todayMissions", JSON.stringify(newMissions));
    localStorage.setItem("missionDay", currentDate);
    localStorage.removeItem("completedDaily"); // Reseta completadas ao mudar o dia
  }

  return JSON.parse(localStorage.getItem("todayMissions")) || generateDailyMissionsForDate(currentDate);
}

// Renderiza as missões diárias
function renderDailyMissions() {
  const missions = getTodayMissions();
  const list = document.getElementById("dailyMissionsList");
  list.innerHTML = "";

  const completed = JSON.parse(localStorage.getItem("completedDaily") || "[]");

  missions.forEach(m => {
    const key = `daily-${m.title.replace(/\s+/g, "-").toLowerCase()}`;
    const isCompleted = completed.includes(key);

    const card = document.createElement("div");
    card.className = "mission-card";
    card.innerHTML = `
      <h3>${m.title}</h3>
      <p>Recompensa: ${m.reward} $BHT</p>
      <button class="btn-checkin ${isCompleted ? 'completed' : ''}">
        ${isCompleted ? 'Autenticado' : 'Fazer Check-in'}
      </button>
      <div class="photo-upload ${isCompleted ? '' : 'hidden'}">
        <input type="file" accept="image/*" capture="camera">
        <img class="photo-preview" src="" alt="Preview" style="display:${isCompleted ? 'block' : 'none'};">
      </div>
    `;
    list.appendChild(card);

    const btn = card.querySelector(".btn-checkin");
    const uploadDiv = card.querySelector(".photo-upload");

    if (!isCompleted) {
      btn.addEventListener("click", () => {
        uploadDiv.classList.remove("hidden");
        const input = uploadDiv.querySelector("input");
        input.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const img = uploadDiv.querySelector(".photo-preview");
              img.src = ev.target.result;
              img.style.display = "block";
              btn.textContent = "Autenticado";
              btn.classList.add("completed");
              btn.disabled = true;

              // Salva como completada
              completed.push(key);
              localStorage.setItem("completedDaily", JSON.stringify(completed));
            };
            reader.readAsDataURL(file);
          }
        });
      });
    }
  });
}

// Missões fixas (permanece o mesmo código de antes)
document.querySelectorAll(".fixed-missions .mission-card").forEach(card => {
  const key = card.getAttribute("data-key");
  const completedFixed = JSON.parse(localStorage.getItem("completedFixed") || "[]");
  const btn = card.querySelector(".btn-checkin");
  const uploadDiv = card.querySelector(".photo-upload");

  if (completedFixed.includes(key)) {
    btn.textContent = "Autenticado";
    btn.classList.add("completed");
    btn.disabled = true;
    uploadDiv.classList.remove("hidden");
  } else {
    btn.addEventListener("click", () => {
      uploadDiv.classList.remove("hidden");
      const input = uploadDiv.querySelector("input");
      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = uploadDiv.querySelector(".photo-preview");
            img.src = ev.target.result;
            img.style.display = "block";
            btn.textContent = "Autenticado";
            btn.classList.add("completed");
            btn.disabled = true;
            completedFixed.push(key);
            localStorage.setItem("completedFixed", JSON.stringify(completedFixed));
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }
});

// Inicia tudo
renderDailyMissions();