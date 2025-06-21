import axios from 'axios';

export async function handler(event) {
  try {
    const { messages, model, temperature } = JSON.parse(event.body);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model || 'deepseek-chat',
        messages,
        temperature: temperature || 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ziggi-portal.netlify.app',
          'X-Title': 'Ziggi Portal',
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Ошибка при вызове DeepSeek API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Ошибка API' }),
    };
  }
}

