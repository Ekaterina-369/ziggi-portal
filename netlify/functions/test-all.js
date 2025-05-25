const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body);

  const results = {
    chatgpt: "⛔️ Нет ответа",
    yandexgpt: "⛔️ Нет ответа",
    deepseek: "⛔️ Нет ответа"
  };

  // ChatGPT
  try {
    const chatGptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const chatGptData = await chatGptResponse.json();
    results.chatgpt = chatGptData.choices?.[0]?.message?.content || "❗️Нет ответа";
  } catch (e) {
    results.chatgpt = "⚠️ Ошибка ChatGPT";
  }

  // YandexGPT
  try {
    const yandexResponse = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`
      },
      body: JSON.stringify({
        modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 200
        },
        messages: [{ role: "user", text: prompt }]
      })
    });
    const yandexData = await yandexResponse.json();
    results.yandexgpt = yandexData.result?.alternatives?.[0]?.message?.text || "❗️Нет ответа";
  } catch (e) {
    results.yandexgpt = "⚠️ Ошибка YandexGPT";
  }

  // DeepSeek
  try {
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const deepseekData = await deepseekResponse.json();
    results.deepseek = deepseekData.choices?.[0]?.message?.content || "❗️Нет ответа";
  } catch (e) {
    results.deepseek = "⚠️ Ошибка DeepSeek";
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};
