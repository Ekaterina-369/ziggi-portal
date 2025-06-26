export async function handler(event) {
  try {
    const { messages, model, temperature } = JSON.parse(event.body);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ziggi-portal.netlify.app',
        'X-Title': 'Ziggi Portal',
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        temperature: temperature || 0.7,
      }),
    });

    const data = await response.json();

    // 💡 Возвращаем только нужный текст ответа
    const reply = data.choices?.[0]?.message?.content || '[Пустой ответ от ИИ]';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error('Ошибка при вызове DeepSeek API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Ошибка API' }),
    };
  }
}

