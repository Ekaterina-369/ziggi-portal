const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { model, prompt } = JSON.parse(event.body || "{}");

  const modelMap = {
    chatgpt: "gpt-4o",
    yandexgpt: "gpt://b1gqevfgden7l9i7krvs/yandexgpt-lite",
    deepseek: "deepseek-chat"
  };

  const headersMap = {
    chatgpt: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    yandexgpt: {
      "Content-Type": "application/json",
      "Authorization": `Api-Key ${process.env.YANDEX_API_KEY}`
    },
    deepseek: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
    }
  };

  let body;
  let url;

  if (model === "yandexgpt") {
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
    body = JSON.stringify({
      modelUri: modelMap[model],
      completionOptions: {
        stream: false,
        temperature: 0.6,
        maxTokens: 2000
      },
      messages: [{ role: "user", text: prompt }]
    });
  } else {
    url = "https://openrouter.ai/api/v1/chat/completions";
    body = JSON.stringify({
      model: modelMap[model],
      messages: [{ role: "user", content: prompt }]
    });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headersMap[model],
      body
    });

    const data = await response.json();

    let reply;

    if (model === "yandexgpt") {
      reply = data?.result?.alternatives?.[0]?.message?.text || "Яндекс не вернул ответ.";
    } else {
      reply = data?.choices?.[0]?.message?.content || "Модель не вернула ответ.";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
