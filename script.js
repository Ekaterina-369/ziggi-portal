
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const fileInput = document.getElementById('file-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const file = fileInput.files[0];
  if (text || file) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.textContent = 'Ты: ' + text;
    chatBox.appendChild(messageDiv);

    if (file) {
      const fileMsg = document.createElement('div');
      fileMsg.classList.add('chat-message');
      fileMsg.textContent = `Изображение: ${file.name}`;
      chatBox.appendChild(fileMsg);
    }

    // Имитация ответа Зигги
    const reply = document.createElement('div');
    reply.classList.add('chat-message');
    reply.textContent = 'Зигги: я получил твоё сообщение!';
    chatBox.appendChild(reply);

    input.value = '';
    fileInput.value = '';
  }
});
