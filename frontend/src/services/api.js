import { getDeviceId } from '../utils/deviceId';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': getDeviceId(),
        ...options.headers
      }
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução e tente novamente.');
  }

  const responseText = await response.text();
  let result = null;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('O servidor retornou uma resposta inválida. Tente novamente mais tarde.');
    }
  }

  if (!response.ok) {
    throw new Error(result?.message || 'Não foi possível salvar os dados no servidor.');
  }
  return result;
}

async function requestList(path) {
  const result = await request(path);
  if (!Array.isArray(result)) {
    throw new Error('O servidor retornou um histórico em formato inválido.');
  }
  return result;
}

export function submitCheckin(payload) {
  return request('/checkins', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function logBreak(type) {
  return request('/pauses', {
    method: 'POST',
    body: JSON.stringify({ type })
  });
}

export function fetchCheckins() {
  return requestList('/checkins');
}

export function fetchPauses() {
  return requestList('/pauses');
}

export function sendChatMessage(payload) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
