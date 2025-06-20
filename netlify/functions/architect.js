const axios = require("axios");
const fs = require("fs");

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || '{}');
    const projectMap = JSON.parse(fs.readFileSync("project_map.json", "utf8"));

    const systemMessage = `
Ты — Архитектор проекта. Пользователь не умеет программировать.
Твоя задача — на основе карты проекта подсказать, в каком файле и что нужно изменить.
Никогда ничего не меняй сам. Говори строго: где, что заменить. Без философии.
Карта проекта:
${JSON.stringify(projectMap, null, 2)}
    `.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek-coder:33b",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
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

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
