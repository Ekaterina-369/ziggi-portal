// Файл: injectButtons.js

const DOCUMENT_IDS = {
  memory: "1FZb5sT2x9-RraKzaS-1wY449D0lsQ9e1jRq5UFtnfGQ",
  channelling: "1zmuOqzrW5QSmyhjgkyzMS3HNQwOg4g7hhp2abs0fwhQ",
  ideas: "1hosaiiPPYj_Dp85H-39-03-PVi6hhsLPryZ2jYMlrmI",
  modules: "1UjyjApUebR55q3LWhlWpvPF9tb",
  book: "1dlaHwonAvfAeHfoy6yJqfj226Z3MrzD5kCZQ-Q4p53c"
};

const BUTTON_CONFIG = [
  { id: 'memory', label: '🧠' },
  { id: 'channelling', label: '✨' },
  { id: 'ideas', label: '💡' },
  { id: 'modules', label: '📦' },
  { id: 'book', label: '📖' },
  { id: 'copy', label: '📋' }
];

function createSaveButton(label, docId, content) {
  const button = document.createElement("button");
  button.style.margin = "0 4px";
  button.style.fontSize = "18px";

  if (docId === "copy") {
    button.innerHTML = label;
    button.title = "Скопировать";
    button.onclick = () => {
      navigator.clipboard.writeText(content)
        .then(() => alert("Скопировано в буфер!"))
        .catch(() => alert("Ошибка копирования"));
    };
  } else {
    button.innerHTML = label;
    button.title = "Сохранить";
    button.onclick = () => {
      const text = `Сохрани в ${docId}: ${content}`;
      fetch("/.netlify/functions/saveToDrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })
        .then(res => res.ok ? alert("Сохранено!") : alert("Ошибка сохранения"))
        .catch(() => alert("Ошибка сети"));
    };
  }

  return button;
}

function injectButtonsToMessages() {
  const messages = document.querySelectorAll(".message");
  messages.forEach(msg => {
    if (msg.querySelector(".save-buttons")) return;

    const text = msg.innerText.trim();
    const container = document.createElement("div");
    container.className = "save-buttons";
    container.style.marginTop = "6px";

    BUTTON_CONFIG.forEach(cfg => {
      const btn = createSaveButton(cfg.label, cfg.id, text);
      container.appendChild(btn);
    });

    msg.appendChild(container);
  });
}

setInterval(injectButtonsToMessages, 1000);
