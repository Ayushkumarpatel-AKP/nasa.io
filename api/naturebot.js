const MAX_MESSAGES = 20;
const MAX_TEXT_LENGTH = 4000;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json(res, 500, { error: 'NatureBot is not configured on the server.' });
  }

  const { messages, systemPrompt } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return json(res, 400, { error: 'Invalid message history.' });
  }

  const safeMessages = messages.map((message) => ({
    role: message.role === 'model' ? 'assistant' : 'user',
    content: Array.isArray(message.parts)
      ? message.parts.map((part) => String(part.text || '').slice(0, MAX_TEXT_LENGTH)).join('\n')
      : '',
  }));

  const openRouterMessages = [
    { role: 'system', content: String(systemPrompt || '').slice(0, MAX_TEXT_LENGTH) },
    ...safeMessages,
  ];

  const requestBody = {
    model: 'google/gemini-2.5-flash',
    messages: openRouterMessages,
    temperature: 0.5,
    max_tokens: 300,
  };

  try {
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': `https://${req.headers.host || 'nasa-io.vercel.app'}`,
        'X-Title': 'NASA.io Terra Bot',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...requestBody, model: 'openrouter/auto' }),
      });
    }

    if (!response.ok) {
      return json(res, 502, { error: 'The NatureBot provider returned an error.' });
    }

    const data = await response.json();
    return json(res, 200, {
      reply: data.choices?.[0]?.message?.content || 'I could not read the winds. Please try again.',
    });
  } catch (error) {
    console.error('NatureBot request failed:', error);
    return json(res, 502, { error: 'Unable to reach the NatureBot provider.' });
  }
}