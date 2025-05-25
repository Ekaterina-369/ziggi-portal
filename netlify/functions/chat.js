const axios = require('axios');

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body || '{}');

  const results = {
    chatgpt: '',
    yandex: '',
    deepseek: '',
  };

  // ChatGPT через OpenRouter
  try {
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
    results.chatgpt = chatResponse.data.choices[0].message.content;
  } catch (error) {
    results.chatgpt = '❌ Ошибка ChatGPT';
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
  
// DeepSeek через OpenRouter
try {
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
  results.deepseek = deepseekResponse.data.choices[0].message.content;
} catch (error) {
  results.deepseek = `❌ Ошибка: ${error.response?.data?.error?.message || error.message}`;
}

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
