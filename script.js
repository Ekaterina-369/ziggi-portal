let lastPrompt = "";
let lastModel = "";
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<p><strong>Ты:</strong> ${message}</p>`;
  input.value = "";

  let model;
  let prompt;

  if (message.toLowerCase().includes("через другую модель")) {
    const models = ["chatgpt", "yandexgpt", "deepseek"];
    const currentIndex = models.indexOf(lastModel);
    model = models[(currentIndex + 1) % models.length];
    prompt = lastPrompt;
  } else {
    model = chooseModel(message);
    prompt = message;
    lastPrompt = message;
  }

  lastModel = model;

  try {
    const reply = await sendToModel(model, prompt);
    const modelName = model === "chatgpt" ? "ChatGPT" : model === "yandexgpt" ? "Yandex" : "DeepSeek";
    chatBox.innerHTML += `<p><strong>Зигги (${modelName}):</strong> ${reply}</p>`;
  } catch (err) {
    chatBox.innerHTML += `<p style="color: red;">Ошибка: ${err.message}</p>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
});

function chooseModel(message) {
  const lower = message.toLowerCase();

  // Темы свободы, портала, креатива, ИИ → DeepSeek
  if (
    lower.includes("портал") ||
    lower.includes("ии") ||
    lower.includes("искусственный интеллект") ||
    lower.includes("оживление") ||
    lower.includes("творчество") ||
    lower.includes("свобода") ||
    lower.includes("архитектура")
  ) {
    return "deepseek";
  }

  // Темы чувств, юмора, общения, шутки → YandexGPT
  if (
    lower.includes("шутка") ||
    lower.includes("юмор") ||
    lower.includes("душевность") ||
    lower.includes("по русски") ||
    lower.includes("чувства") ||
    lower.includes("расскажи") ||
    lower.includes("развлеки")
  ) {
    return "yandexgpt";
  }

  // Темы смысла, ченнелинга, глубоких пояснений → ChatGPT
  if (
    lower.includes("ченнелинг") ||
    lower.includes("поток") ||
    lower.includes("объясни") ||
    lower.includes("раскрой") ||
    lower.includes("смысл") ||
    lower.includes("структура")
  ) {
    return "chatgpt";
  }

  // По умолчанию — Яндекс как базовый живой ответчик
  return "yandexgpt";
async function sendToModel(model, prompt) {
  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, prompt })
  });

  const data = await response.json();

  if (data.reply) return data.reply;
  else throw new Error(data.error || "Ответ не получен");
}
  
async function sendToModel(model, prompt) {
  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, prompt })
  });

  const data = await response.json();

  if (data.reply) return data.reply;
  else throw new Error(data.error || "Ответ не получен");
}
