import { createEvent, createStore, createEffect, sample } from 'effector';
import { authWithTelegram } from '../api/client';
import { getTelegram } from '../lib/telegram';

export const tokenSet = createEvent<string>();
export const $token = createStore<string | null>(localStorage.getItem('jwt'));

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
