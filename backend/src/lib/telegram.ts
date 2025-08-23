import https from 'https';
import User from '../modules/users/model';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NOTIFY_CHAT_IDS = (process.env.TELEGRAM_NOTIFICATIONS_CHAT_ID || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function postJson<T = any>(path: string, payload: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload));

    const req = https.request({
      hostname: 'api.telegram.org',
      method: 'POST',
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            // Если Telegram вернул не-JSON, всё равно считаем успешным
            // и возвращаем как строку
            // @ts-expect-error allow string
            resolve(body);
          }
        } else {
          reject(new Error(`Telegram API error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

export async function sendTelegramMessage(chatId: string | number, text: string) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not set; skipping telegram notification');
    return;
  }
  const path = `/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  try {
    await postJson(path, payload);
  } catch (e) {
    console.error('Failed to send Telegram message:', e);
  }
}

export async function notifyMentors(text: string) {
  // 1) Если явно задан список в env — используем его
  const explicitIds = NOTIFY_CHAT_IDS;
  if (explicitIds.length) {
    await Promise.all(explicitIds.map(id => sendTelegramMessage(id, text)));
    return;
  }

  // 2) Иначе — подгружаем всех менторов из БД с указанным telegram_id
  try {
    const mentors = await User.findAll({
      where: {
        role: 'mentor'
      }
    });
    const ids = mentors
      .map(m => (m as any).telegram_id as string)
      .filter(Boolean)
      .map(s => String(s).trim())
      .filter(s => s.length > 0);

    if (!ids.length) {
      console.warn('No mentor telegram_id found in DB and TELEGRAM_NOTIFICATIONS_CHAT_ID is empty; skipping mentors notification');
      return;
    }

    // Убираем дубли
    const uniqueIds = Array.from(new Set(ids));
    await Promise.all(uniqueIds.map(id => sendTelegramMessage(id, text)));
  } catch (e) {
    console.error('Failed to load mentors from DB for telegram notification:', e);
  }
}

export async function notifyUser(telegramId: string | number, text: string) {
  await sendTelegramMessage(telegramId, text);
}
