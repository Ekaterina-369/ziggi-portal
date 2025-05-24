const { Configuration, OpenAIApi } = require("openai");
const https = require("https");

exports.handler = async function (event) {
  const body = JSON.parse(event.body || "{}");
  const message = body.message || "";

  const openaiKey = process.env.OPENAI_API_KEY;
  const yandexKey = process.env.YANDEX_API_KEY;
  const yandexFolder = process.env.YANDEX_FOLDER_ID;

  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: "Пустое сообщение." }),
    };
  }

  // выбор ИИ
  const target = message.startsWith("@yandex")
    ? "yandex"
    : message.startsWith("@chatgpt")
    ? "chatgpt"
    : "auto";

  try {
    if (target === "chatgpt" || (target === "auto" && openaiKey)) {
      const configuration = new Configuration({ apiKey: openaiKey });
      const openai = new OpenAIApi(configuration);
      const completion = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: message }],
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: completion.data.choices[0].message.content }),
      };
    }

    if (target === "yandex" || (target === "auto" && yandexKey)) {
      const data = JSON.stringify({
        modelUri: `gpt://` + yandexFolder + `/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages: [{ role: "user", text: message }],
      });

      const options = {
        hostname: "llm.api.cloud.yandex.net",
        path: "/foundationModels/v1/completion",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Api-Key ${yandexKey}`,
        },
      };

      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, res => {
          let response = "";
          res.on("data", chunk => (response += chunk));
          res.on("end", () => resolve(response));
        });
        req.on("error", reject);
        req.write(data);
        req.end();
      });

      const parsed = JSON.parse(result);
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: parsed.result.alternatives[0].message.text }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Не удалось определить, к какому ИИ отправить." }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Ошибка: " + error.message }),
    };
  }
};
