document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("chat-input");
  const file = document.getElementById("file-input").files[0];

  const message = input.value.trim();
  if (!message && !file) return;

  chatBox.innerHTML += `<p><strong>Ты:</strong> ${message || "[изображение]"}</p>`;

  const formData = new FormData();
  formData.append("message", message);
  if (file) formData.append("file", file);

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    chatBox.innerHTML += `<p><strong>Зигги:</strong> ${data.reply}</p>`;
  } catch (error) {
    chatBox.innerHTML += `<p><strong>Зигги:</strong> Ошибка ответа</p>`;
  }

  input.value = "";
  document.getElementById("file-input").value = "";
});

// Блок для проверки всех ИИ
async function testAll() {
  const prompt = document.getElementById("testPrompt").value;
  const resultBox = document.getElementById("testResult");
  resultBox.textContent = "Запрос отправлен...";

  try {
    const response = await fetch("/.netlify/functions/test-all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    resultBox.textContent =
      `ChatGPT:\n${data.chatgpt}\n\n` +
      `YandexGPT:\n${data.yandexgpt}\n\n` +
      `DeepSeek:\n${data.deepseek}`;
  } catch (e) {
    resultBox.textContent = "Ошибка запроса: " + e.message;
  }
}
