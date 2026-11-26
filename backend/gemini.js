// Minimal Gemini API client using Node's built-in fetch (no extra package needed).
// Docs: https://ai.google.dev/gemini-api/docs/generate-content/text-generation
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

// Change with the GEMINI_MODEL environment variable if this model is not available to your key.
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Sends a conversation to Gemini and returns the reply text ('' if the model returned no text,
 * for example when its safety filters blocked the answer).
 * Throws an Error with a `status` property when the request fails or times out.
 *
 * @param {object} options
 * @param {string} options.system  System instruction.
 * @param {{role: 'user' | 'assistant', content: string}[]} options.messages  Conversation, starting with a user message.
 * @param {number} options.maxOutputTokens
 * @param {number} [options.timeoutMs]
 */
async function generateText({ system, messages, maxOutputTokens, timeoutMs = 8000 }) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  let response;
  try {
    response = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: messages.map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        })),
        generationConfig: { maxOutputTokens },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    const error = new Error('Gemini request failed or timed out');
    error.status = cause && cause.name === 'TimeoutError' ? 'timeout' : 'network';
    throw error;
  }

  if (!response.ok) {
    const error = new Error('Gemini API returned an error');
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts) || [];
  return parts
    .filter((part) => typeof part.text === 'string' && !part.thought)
    .map((part) => part.text)
    .join('\n')
    .trim();
}

module.exports = { generateText, isConfigured };
