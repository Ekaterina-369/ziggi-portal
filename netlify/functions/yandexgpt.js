const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body || "{}");

  try {
    const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${process.env.YANDEX_API_KEY}`,
      },
      body: JSON.stringify({
        modelUri: "gpt://b1gqevfgden7l9i7krvs/yandexgpt-lite",
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000
        },
        messages: [{ role: "user", text: prompt }]
      }),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.result.alternatives[0].message.text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
