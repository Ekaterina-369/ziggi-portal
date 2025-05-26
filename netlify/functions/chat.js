// Вернём рабочую версию: только ChatGPT, YandexGPT, DeepSeek без поиска

const axios = require("axios");

exports.handler = async (event) => {
  const { model, prompt } = JSON.parse(event.body || "{}");

  try {
    if (model === "chatgpt") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: res.data.choices[0].message.content }),
      };
    }

    if (model === "deepseek") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "tngtech/deepseek-r1t-chimera:free",
          messages: [
            { role: "system", content: "Отвечай пользователю по-русски" },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: res.data.choices[0].message.content }),
      };
    }

    if (model === "yandexgpt") {
      const res = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
        },
        body: JSON.stringify({
          modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt/latest`,
          completionOptions: {
            stream: false,
            temperature: 0.7,
            maxTokens: 200,
          },
          messages: [{ role: "user", text: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.result?.alternatives?.[0]?.message?.text || "Нет ответа от Яндекса.";
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: text }),
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Неизвестная модель" }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
