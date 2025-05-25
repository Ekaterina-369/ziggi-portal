const axios = require('axios');

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body);

  const results = {
    chatgpt: '',
    yandex: '',
    deepseek: ''
  };

  try {
    const openaiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ziggi-portal.netlify.app',
          'X-Title': 'Ziggi Portal'
        }
      }
    );
    results.chatgpt = openaiRes.data.choices[0].message.content;
  } catch (err) {
    results.chatgpt = '❗Ошибка ChatGPT';
  }

  try {
    const yandexRes = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: 'gpt://b1gr4s5g78sdc3uq6m8b/yandexgpt-lite/latest',
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 1000
        },
        messages: [{ role: 'user', text: prompt }]
      },
      {
        headers: {
          Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
          'x-folder-id': process.env.YANDEX_FOLDER_ID,
          'Content-Type': 'application/json'
        }
      }
    );
    results.yandex = yandexRes.data.choices[0].message.text;
  } catch (err) {
    results.yandex = '❗Ошибка YandexGPT';
  }

  try {
    const deepRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ziggi-portal.netlify.app',
          'X-Title': 'Ziggi Portal'
        }
      }
    );
    results.deepseek = deepRes.data.choices[0].message.content;
  } catch (err) {
    results.deepseek = '❗Ошибка DeepSeek';
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};
