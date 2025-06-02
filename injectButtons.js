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
  { id: 'copy', label: null }
];

function createSaveButton(label, docId, content) {
  const button = document.createElement("button");
  button.style.margin = "0 4px";

  if (docId === "copy") {
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v9A1.5 1.5 0 0 1 10 13.5H4A1.5 1.5 0 0 1 2.5 12V4.707a1 1 0 0 1 .293-.707l5-5A1 1 0 0 1 8.707 0H10z"/>
        <path d="M4.5 4a.5.5 0 0 1 .5-.5H9v2A1.5 1.5 0 0 0 10.5 7H13v5a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4z"/>
      </svg>
    `;
    button.title = "Скопировать текст";
    button.onclick = () => {
      navigator.clipboard.writeText(content)
        .then(() => alert("Скопировано в буфер обмена!"))
        .catch(() => alert("Не удалось скопировать."));
    };
  } else {
    button.textContent = label;
    button.onclick = () => {
      fetch("/.netlify/functions/saveToDrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, documentId: docId })
      })
      .then(res => res.ok ? alert("Сохранено!") : alert("Ошибка сохранения."))
      .catch(() => alert("Ошибка запроса."));
    };
  }

  return button;
}

function injectButtonsToMessages() {
  const messages = document.querySelectorAll(".message");
  messages.forEach(msg => {
    if (msg.querySelector(".save-buttons")) return; // уже есть кнопки

    const text = msg.innerText;
    const container = document.createElement("div");
    container.className = "save-buttons";
    container.style.marginTop = "4px";

    BUTTON_CONFIG.forEach(cfg => {
      const docId = cfg.id === "copy" ? "copy" : DOCUMENT_IDS[cfg.id];
      const btn = createSaveButton(cfg.label, docId, text);
      container.appendChild(btn);
    });

    msg.appendChild(container);
  });
}

setInterval(injectButtonsToMessages, 1000);
