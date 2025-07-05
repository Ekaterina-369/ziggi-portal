const axios = require("axios");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const userMessage = body.message || "Что нужно исправить?";

       // Шаг 1: получить дерево файлов из GitHub
  const { data: treeData } = await octokit.git.getTree({
    owner: process.env.GITHUB_OWNER,
    repo:  process.env.GITHUB_REPO,
    recursive: "true"
  });

  const projectMap = {
    generatedAt: new Date().toISOString(),
    files: treeData.tree.map(item => ({ path: item.path, type: item.type }))
  };

  // Шаг 2: залить project_map.json в репозиторий
  const content = Buffer.from(JSON.stringify(projectMap, null, 2)).toString("base64");
  let sha;
  try {
    const existing = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo:  process.env.GITHUB_REPO,
      path:  "project_map.json"
    });
    sha = existing.data.sha;
  } catch {
    // если файла ещё нет, sha не нужен
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: process.env.GITHUB_OWNER,
    repo:  process.env.GITHUB_REPO,
    path:  "project_map.json",
    message: "Обновить карту проекта",
    content,
    ...(sha ? { sha } : {})
  });

    // Шаг 2: выбрать до 3 файлов для анализа
    const sampleFiles = Object.entries(fileMap)
      .filter(([_, data]) => data.size < 10000)
      .slice(0, 3);

    const fileDescriptions = sampleFiles.map(([name, data]) =>
      `Файл: ${name}\n---\n${data.preview}`).join("\n\n");

    // Шаг 3: systemMessage для DeepSeek
    const systemMessage = `
Ты — Архитектор проекта. Пользователь не умеет программировать.

У тебя есть доступ ко всей структуре проекта: имена и пути всех файлов, а также содержимое ключевых файлов.
Ты должен сам выбрать важные файлы (до 3), и выдать чёткую инструкцию: что и где в них изменить.

Говори строго и чётко: файл, что заменить, на что. Никакой философии.

Все изменения давай ТОЛЬКО в кодовых блоках:
\`\`\`js
// код
\`\`\`
`.trim();

    // Шаг 4: запрос к DeepSeek через OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek-coder:33b",
        messages: [
          { role: "system", content: `${systemMessage}\n\n${fileDescriptions}` },
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
