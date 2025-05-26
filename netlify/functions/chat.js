const axios = require('axios');

exports.handler = async (event) => {
  const { model, prompt } = JSON.parse(event.body || '{}');

  let reply = "";

  try {
    if (model === "chatgpt") {
      const chatResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      reply = chatResponse.data.choices?.[0]?.message?.content || "Модель ChatGPT не вернула ответ.";
    }

    else if (model === "yandexgpt") {
      const yandexResponse = await axios.post(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
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
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`
          }
        }
      );
      reply = yandexResponse.data?.result?.alternatives?.[0]?.message?.text || "Yandex не вернул ответ.";
    }

    else if (model === "deepseek") {
      const deepseekResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'tngtech/deepseek-r1t-chimera:free',
          messages: [
            { role: 'system', content: 'Отвечай пользователю по-русски' },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://ziggi-portal.netlify.app/',
            'X-Title': 'Ziggi Portal'
          }
        }
      );
      reply = deepseekResponse.data?.choices?.[0]?.message?.content || "DeepSeek не вернул ответ.";
    }

    else {
      reply = "Неизвестная модель.";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Произошла ошибка при обращении к модели." })
    };
  }
};
