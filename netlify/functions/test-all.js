const axios = require("axios");

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body);
  const results = {};

  try {
    const chatgpt = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    results.chatgpt = chatgpt.data.choices[0].message.content;
  } catch (e) {
    results.chatgpt = "❌ Ошибка ChatGPT";
  }

  try {
    const yandex = await axios.post(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000
        },
        messages: [{ role: "user", text: prompt }]
      },
      {
        headers: {
          Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    results.yandexgpt = yandex.data.result.alternatives[0].message.text;
  } catch (e) {
    results.yandexgpt = "❌ Ошибка YandexGPT";
  }

  try {
    const deepseek = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    results.deepseek = deepseek.data.choices[0].message.content;
  } catch (e) {
    results.deepseek = "❌ Ошибка DeepSeek";
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};
