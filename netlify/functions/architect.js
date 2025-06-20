const fs = require("fs");
const path = require("path");
const axios = require("axios");

function scanProject(dir, ignore = ["node_modules", ".git", "netlify/functions"]) {
  let map = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(".", fullPath);
    if (ignore.includes(entry.name)) continue;
    if (entry.isDirectory()) {
      Object.assign(map, scanProject(fullPath, ignore));
    } else if (entry.isFile() && /\.(js|html|css|json|txt)$/.test(entry.name)) {
      map[relative] = {
        size: fs.statSync(fullPath).size,
        preview: fs.readFileSync(fullPath, "utf8").slice(0, 1000)
      };
    }
  }
  return map;
}

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const userMessage = body.message || "Что нужно исправить?";

    const fileMap = scanProject(".");
    const entries = Object.entries(fileMap)
      .filter(([_, data]) => data.size < 10000)
      .slice(0, 3); // максимум 3 файла

    const filePreviews = entries.map(([name, data]) =>
      `Файл: ${name}\n---\n${data.preview}`).join("\n\n");

    const systemMessage = `
Ты — Архитектор проекта. Пользователь не умеет программировать.

У тебя есть доступ ко всей структуре проекта: имена и пути всех файлов, а также содержимое ключевых файлов.
Твоя задача — на основе анализа структуры и содержания файлов выбрать, какие файлы важны для решения задачи пользователя (до 3 штук), и дать точную инструкцию: что и где в них изменить.

Говори строго и чётко: в каком файле, какую часть заменить и на что. 
Не объясняй очевидного, не давай лишней информации. Только факты и шаги. 

Все примеры изменений кода — только в формате кодовых блоков.
Пример:
\`\`\`js
// пример кода
\`\`\`
`.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek-coder:33b",
        messages: [
          { role: "system", content: `${systemMessage}\n\n${filePreviews}` },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://ziggi-portal.netlify.app/",
          "X-Title": "Ziggi Portal"
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "Нет ответа от ИИ.";
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
