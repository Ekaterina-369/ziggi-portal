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
    const yandexResponse = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://{your-folder-id}/yandexgpt/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 1000,
        },
        messages: [{ role: 'user', text: prompt }],
      },
      {
        headers: {
          Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    results.yandex = yandexResponse.data.result.alternatives[0].message.text;
  } catch (error) {
    results.yandex = '❌ Ошибка YandexGPT';
  }

  // DeepSeek напрямую
  try {
    const deepseekResponse = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    results.deepseek = deepseekResponse.data.choices[0].message.content;
  } catch (error) {
    results.deepseek = '❌ Ошибка DeepSeek';
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
