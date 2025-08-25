import { Transaction } from 'sequelize';
import BonusTransaction from './model';
import Goal from '../goals/model';

// Простая мапа начислений по оценке
// TODO: вынести в конфиг/ENV при необходимости
const ratingDeltaMap: Record<number, number> = {
  5: 2,
  4: 1,
  3: -1,
  2: -2,
  1: -3,
};

export async function getStudentBonusBalance(student_id: number, transaction?: Transaction): Promise<number> {
  const rows = await BonusTransaction.findAll({
    where: { student_id },
    attributes: ['delta'],
    transaction,
  });
  return rows.reduce((acc, r: any) => acc + (r.delta || 0), 0);
}

export async function getStudentBonusHistory(student_id: number, limit = 50) {
  return BonusTransaction.findAll({
    where: { student_id },
    order: [['createdAt', 'DESC']],
    limit,
  });
}

async function checkGoalAutoAchieveAndReset(opts: {
  student_id: number;
  transaction?: Transaction;
}) {
  const { student_id, transaction } = opts;
  // Берем самую свежую ожидающую цель
  const goal = await Goal.findOne({
    where: { student_id, status: 'pending' },
    order: [['createdAt', 'DESC']],
    transaction,
  });
  if (!goal) return;
  const required = goal.required_bonuses || 0;
  if (required <= 0) return;
  const balance = await getStudentBonusBalance(student_id, transaction);
  if (balance >= required) {
    goal.status = 'achieved';
    goal.achieved_at = new Date();
    await goal.save({ transaction });
    await resetStudentBonusToZero({ student_id, reason: `goal achieved: ${goal.title}`, transaction });
  }
}

export async function applyGradeBonus(opts: {
  student_id: number;
  assignment_id: number;
  mentor_rating: number;
  reason?: string | null;
  transaction?: Transaction;
}) {
  const { student_id, assignment_id, mentor_rating, reason = null, transaction } = opts;
  const delta = ratingDeltaMap[mentor_rating] ?? 0;

  // На один assignment — одна запись в bonus_transactions (idempotent)
  const existing = await BonusTransaction.findOne({
    where: { assignment_id },
    transaction,
  });

  let record: BonusTransaction;
  if (existing) {
    existing.delta = delta;
    existing.source = 'grade';
    existing.reason = reason ?? `mentor_rating=${mentor_rating}`;
    await existing.save({ transaction });
    record = existing;
  } else {
    record = await BonusTransaction.create({
      student_id,
      assignment_id,
      delta,
      source: 'grade',
      reason: reason ?? `mentor_rating=${mentor_rating}`,
    }, { transaction });
  }

  await checkGoalAutoAchieveAndReset({ student_id, transaction });
  return record;
}

export async function applyManualBonus(opts: {
  student_id: number;
  delta: number; // может быть отрицательным
  reason?: string | null;
  assignment_id?: number | null;
  transaction?: Transaction;
}) {
  const { student_id, delta, reason = null, assignment_id = null, transaction } = opts;
  const record = await BonusTransaction.create({
    student_id,
    assignment_id,
    delta,
    source: 'manual',
    reason,
  }, { transaction });
  await checkGoalAutoAchieveAndReset({ student_id, transaction });
  return record;
}

export async function resetStudentBonusToZero(opts: {
  student_id: number;
  reason?: string | null;
  transaction?: Transaction;
}) {
  const { student_id, reason = 'reset to zero', transaction } = opts;
  const balance = await getStudentBonusBalance(student_id, transaction);
  if (balance === 0) return null;
  // Добавляем транзакцию на противоположную сумму, чтобы обнулить баланс
  return BonusTransaction.create({
    student_id,
    assignment_id: null,
    delta: -balance,
    source: 'reset',
    reason,
  }, { transaction });
}
