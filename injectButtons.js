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

function addArchitectButtonsToMessage(messageElement) {
  const isArchitectMessage = messageElement.innerText.includes("архитектор") || messageElement.innerText.includes("Architect");

  if (!isArchitectMessage) return;

  const container = document.createElement("div");
  container.style.marginTop = "8px";

  const saveMapButton = document.createElement("button");
  saveMapButton.innerText = "🗺 Сохранить карту";
  saveMapButton.onclick = () => fetch("/.netlify/functions/save-map").then(() => alert("Карта отправлена на сохранение."));

  const backupButton = document.createElement("button");
  backupButton.innerText = "💾 Сохранить все файлы";
  backupButton.onclick = () => fetch("/.netlify/functions/backup-all").then(() => alert("Файлы отправлены на сохранение."));

  [saveMapButton, backupButton].forEach(btn => {
    btn.style.marginRight = "8px";
    btn.style.padding = "6px 12px";
    btn.style.borderRadius = "6px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.backgroundColor = "#e0e0e0";
  });

  container.appendChild(saveMapButton);
  container.appendChild(backupButton);
  messageElement.appendChild(container);
}

// Автоматически следим за появлением новых сообщений
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.classList.contains("message")) {
        addArchitectButtonsToMessage(node);
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });
