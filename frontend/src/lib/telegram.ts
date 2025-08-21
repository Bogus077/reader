export function getTelegram() {
  return (window as any).Telegram?.WebApp;
}

export function isTelegramEnv(): boolean {
  return !!getTelegram();
}
