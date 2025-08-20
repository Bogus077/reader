import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface InitDataResult {
  user: TelegramUser;
  params: URLSearchParams;
}

/**
 * Проверяет подпись и валидность initData от Telegram WebApp
 * @param initDataRaw Сырые данные initData из Telegram WebApp
 * @param botToken Токен бота Telegram
 * @returns Объект с данными пользователя и параметрами
 */
export function verifyInitData(initDataRaw: string, botToken: string): InitDataResult {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');
  
  if (!hash) {
    throw new Error('Hash not found in init data');
  }
  
  // Удаляем hash из параметров для проверки
  params.delete('hash');
  
  // Создаем data_check_string - отсортированные пары key=value, склеенные через \n
  const dataCheckArray: string[] = [];
  params.forEach((value, key) => {
    dataCheckArray.push(`${key}=${value}`);
  });
  dataCheckArray.sort();
  const dataCheckString = dataCheckArray.join('\n');
  
  // Создаем secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  // Вычисляем HMAC_SHA256(data_check_string, secret_key)
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  // Сравниваем хеши с использованием crypto.timingSafeEqual
  const hashBuffer = Buffer.from(hash, 'hex');
  const calculatedHashBuffer = Buffer.from(calculatedHash, 'hex');
  
  if (hashBuffer.length !== calculatedHashBuffer.length || !crypto.timingSafeEqual(hashBuffer, calculatedHashBuffer)) {
    throw new Error('Invalid hash');
  }
  
  // Проверяем auth_date (не старше 10 минут / 600 секунд)
  const authDate = params.get('auth_date');
  if (!authDate) {
    throw new Error('Auth date not found');
  }
  
  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  
  if (currentTimestamp - authTimestamp > 600) {
    throw new Error('Auth date expired');
  }
  
  // Получаем данные пользователя
  const userString = params.get('user');
  if (!userString) {
    throw new Error('User data not found');
  }
  
  const user = JSON.parse(userString) as TelegramUser;
  
  return { user, params };
}

/**
 * Создает JWT токен
 * @param payload Данные для включения в токен
 * @param secret Секретный ключ для подписи
 * @param days Срок действия токена в днях
 * @returns JWT токен
 */
export function issueJwt(payload: object, secret: string, days: number): string {
  return jwt.sign(payload, secret, {
    expiresIn: `${days}d`,
    algorithm: 'HS256'
  });
}

/**
 * Проверяет JWT токен
 * @param token JWT токен
 * @param secret Секретный ключ для проверки подписи
 * @returns Декодированные данные из токена
 */
export function verifyJwt(token: string, secret: string): any {
  return jwt.verify(token, secret);
}
