const { generateText, isConfigured } = require('./gemini');

// Team decision: a mood at or below this value skips the AI tip and shows support resources.
const SUPPORT_MAX_MOOD = 2;

const FALLBACK_TIPS = [
  'Que tal reservar dois minutos para alongar os ombros, se isso fizer sentido agora?',
  'Talvez uma pausa para beber água caiba bem neste momento; você pode voltar à tarefa no seu ritmo.',
  'Se estiver há muito tempo sentado, talvez uma caminhada curta pelo corredor ou pátio caiba no seu intervalo.',
  'Que tal experimentar três respirações lentas, sem pressa e sem precisar fazer nada perfeito?',
  'Se fizer sentido, você pode descansar os olhos olhando para algo distante por um minuto.',
];

const SUPPORT_TIP =
  'Seu check-in pode indicar que este é um momento difícil. Você não precisa passar por isso sozinho: se puder, converse com alguém de confiança ou veja os recursos de apoio.';

const TIP_SYSTEM_PROMPT = `Você escreve dicas curtas de bem-estar para estudantes em um app de campus.
Regras:
- Considere somente o humor e a energia numéricos do check-in; não infira causas nem use a anotação livre.
- Responda em português do Brasil, em 1 ou 2 frases, com no máximo 250 caracteres.
- Escreva como um convite gentil ("que tal...", "talvez...", "se fizer sentido"). Não dê ordens nem cobre resultados.
- Sugira uma única pausa concreta e curta, adequada a um intervalo no campus. Escolha uma ação simples (água, alongar, caminhar, respirar ou olhar para longe), sem empilhar tarefas.
- Ajuste o tom ao check-in sem rotular a pessoa. Varie a formulação e não prometa que a sugestão resolverá algo.
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