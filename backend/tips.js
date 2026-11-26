const { generateText, isConfigured } = require('./gemini');

// Team decision: a mood at or below this value skips the AI tip and shows support resources.
const SUPPORT_MAX_MOOD = 2;

const FALLBACK_TIPS = [
  'Que tal uma pausa de dois minutos? Levante, alongue os ombros e olhe pela janela.',
  'Talvez um copo de água ajude agora. Beba com calma e depois volte ao que estava fazendo.',
  'Se você está há muito tempo sentado, uma volta curta pelo corredor ou pelo pátio pode ajudar.',
  'Que tal respirar fundo três vezes, bem devagar, antes de continuar? Sem pressa.',
  'Olhar para algo distante por um minuto pode descansar os olhos. Vale a pena tentar.',
];

const SUPPORT_TIP =
  'Parece que o dia está pesado. Você não precisa passar por isso sozinho: veja os recursos de apoio e, se puder, converse com alguém de confiança.';

const TIP_SYSTEM_PROMPT = `Você escreve dicas curtas de bem-estar para estudantes em um app de campus.
Regras:
- Responda em português do Brasil, em 1 ou 2 frases, com no máximo 250 caracteres.
- Use um tom gentil, de convite ("que tal...", "talvez..."). Nunca dê ordens nem cobre resultados.
- Sugira uma pausa concreta e curta, que caiba em um intervalo no campus (água, alongar, caminhar, respirar, olhar para longe).
- Não faça diagnóstico, não fale de doenças ou transtornos, não cite remédios e não prometa resultados.
- Não pareça atendimento clínico nem terapia.
- Responda apenas com o texto da dica, sem aspas, sem emojis e sem listas.`;

function pickFallback() {
  return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
}

async function askAi({ mood, energy }) {
  if (!isConfigured()) return null;
  try {
    // The output budget is generous because some Gemini models count internal "thinking" tokens in it.
    const text = await generateText({
      system: TIP_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Humor de hoje: ${mood} de 5. Energia de hoje: ${energy} de 5.` },
      ],
      maxOutputTokens: 512,
      timeoutMs: 8000,
    });
    return text && text.length <= 400 ? text : null;
  } catch (error) {
    console.error('AI tip failed, using a fallback tip. Status:', error.status || 'unknown');
    return null;
  }
}

// Only mood and energy (numbers) are sent to the AI; the free-text note never is.
async function getTip({ mood, energy }) {
  if (mood <= SUPPORT_MAX_MOOD) {
    return { tip: SUPPORT_TIP, showSupport: true, source: 'safety' };
  }
  const aiTip = await askAi({ mood, energy });
  if (aiTip) return { tip: aiTip, showSupport: false, source: 'ai' };
  return { tip: pickFallback(), showSupport: false, source: 'fallback' };
}

module.exports = { getTip, SUPPORT_MAX_MOOD };