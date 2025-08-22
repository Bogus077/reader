import { createEvent, createStore, createEffect, sample } from 'effector';
import { authWithTelegram } from '../api/client';
import { getTelegram } from '../lib/telegram';
import { jwtDecode } from 'jwt-decode';

export const tokenSet = createEvent<string>();
export const $token = createStore<string | null>(localStorage.getItem('jwt'));

// Тип для данных пользователя из JWT
type UserData = {
  id: number;
  role: 'student' | 'mentor';
  name: string;
  tz: string;
  iat: number;
  exp: number;
};

// Функция для декодирования JWT и получения данных пользователя
const decodeToken = (token: string): UserData | null => {
  try {
    return jwtDecode<UserData>(token);
  } catch (e) {
    console.error('Ошибка декодирования токена:', e);
    return null;
  }
};

// Создаем стор для хранения данных пользователя
export const $user = $token.map(token => {
  if (!token) return null;
  return decodeToken(token);
});

$token.on(tokenSet, (_, t) => t);

$token.watch(t => {
  if (t) localStorage.setItem('jwt', t);
});

export const authFx = createEffect(async () => {
  const tg = getTelegram();
  const initData: string = tg?.initData || '';
  if (!initData) return null;
  const res = await authWithTelegram(initData);
  if (res.ok && res.token) return res.token;
  return null;
});

sample({
  clock: authFx.doneData,
  filter: (t): t is string => typeof t === 'string' && t.length > 0,
  target: tokenSet,
});
