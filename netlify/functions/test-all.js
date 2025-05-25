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
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Ziggi Portal'
        }
      }
    );
    results.chatgpt = chatResponse.data.choices?.[0]?.message?.content || '! Нет ответа';
  } catch (err) {
    results.chatgpt = '! Ошибка ChatGPT';
  }

  // YandexGPT напрямую
  try {
    const yandexResp = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: 'gpt://b1gpnvp4e6d54l2k6qcn/yandexgpt-lite',
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages: [
          { role: 'user', text: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
          'x-folder-id': process.env.YANDEX_FOLDER_ID,
          'Content-Type': 'application/json',
        }
      }
    );
    results.yandex = yandexResp.data.choices?.[0]?.text || '! Нет ответа';
  } catch (err) {
    results.yandex = '! Ошибка YandexGPT';
  }

  // DeepSeek через OpenRouter
  try {
    const deepResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Ziggi Portal'
        }
      }
    );
    results.deepseek = deepResponse.data.choices?.[0]?.message?.content || '! Нет ответа';
  } catch (err) {
    results.deepseek = '! Ошибка DeepSeek';
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
