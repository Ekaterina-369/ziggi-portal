const axios = require("axios");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

exports.handler = async function(event) {
  console.log("🏗️ ARCH: handler invoked, body:", event.body);
  console.log("🏗️ ARCH: OWNER =", process.env.GITHUB_OWNER);
  console.log("🏗️ ARCH: REPO  =", process.env.GITHUB_REPO);
  console.log("🏗️ ARCH: TOKEN length:", process.env.GITHUB_TOKEN?.length);

  try {
    const body = JSON.parse(event.body || '{}');
const userMessage = body.prompt 
  || body.message 
  || "Что нужно исправить?";
const architectNotes = body.architect || "";

     // Шаг 1.1: узнать SHA текущей ветки main
  const { data: branchData } = await octokit.repos.getBranch({
   owner: process.env.GITHUB_OWNER,
   repo:  process.env.GITHUB_REPO,
   branch: "main"
  });
  const treeSha = branchData.commit.commit.tree.sha;

   // Шаг 1.2: получить полное дерево по SHA
  const { data: treeData } = await octokit.git.getTree({
    owner:       process.env.GITHUB_OWNER,
    repo:        process.env.GITHUB_REPO,
    tree_sha:   treeSha,
    recursive:   "true"
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
    
    // Шаг 3: взять первые 3 пути из карты
   const fileDescriptions = projectMap.files
     .slice(0, 3)
     .map(f => `Файл: ${f.path}`)
     .join("\n\n");

  await octokit.repos.createOrUpdateFileContents({
    owner: process.env.GITHUB_OWNER,
    repo:  process.env.GITHUB_REPO,
    path:  "project_map.json",
    message: "Обновить карту проекта",
    content,
    ...(sha ? { sha } : {})
  });

    // Шаг 4: systemMessage для DeepSeek
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

    // Шаг 5: запрос к DeepSeek через OpenRouter
    const response = await axios.post(
      process.env.OPENROUTER_API_URL,
      {
        model: "deepseek-coder:33b",
        messages: [
          { role: "system", content: `${systemMessage}\n\n${fileDescriptions}` },
           { role: "user",   content: userMessage },
  { role: "assistant", content: "ARCHITECT: " + architectNotes }
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
    console.error("🔥 ARCH ERROR:", e.response?.status, e.response?.data || e.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
