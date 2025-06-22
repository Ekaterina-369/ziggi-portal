export async function handler(event) {
  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ziggi-portal.netlify.app',
        'X-Title': 'Ziggi Portal',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error('Ошибка при вызове DeepSeek API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Ошибка API' })
    };
  }
}
