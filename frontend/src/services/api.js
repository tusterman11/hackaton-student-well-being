import { getDeviceId } from '../utils/deviceId';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const FALLBACK_TIPS = [
  'Que tal olhar para longe por 20 segundos? Procure algo verde ou um pedaço de céu.',
  'Solte os ombros por um instante e tome um copo de água devagar.',
  'Que tal levantar por 2 minutos e alongar os braços antes de voltar para a tela?'
];

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-device-id': getDeviceId()
  };
}

export async function submitCheckin(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/checkins`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    const isDistress = payload.mood <= 1;
    const randomTip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    return {
      checkin: { ...payload, date: new Date().toISOString() },
      tip: isDistress ? null : randomTip,
      showSupportAlert: isDistress
    };
  }
}

export async function logBreak(type) {
  try {
    const res = await fetch(`${API_BASE_URL}/breaks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type })
    });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return {
      id: Date.now(),
      type,
      createdAt: new Date().toISOString()
    };
  }
}

export async function fetchWeeklyHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return null;
  }
}
