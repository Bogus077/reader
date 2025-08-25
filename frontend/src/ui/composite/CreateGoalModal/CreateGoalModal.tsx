import { FC, useState } from "react";
import { Modal } from "../../feedback/Modal";
import { Input } from "../../forms/Input";
import { Textarea } from "../../forms/Textarea";
import { Button } from "../../primitives/Button";
import styles from "./CreateGoalModal.module.scss";

export type CreateGoalForm = {
  title: string;
  reward_text: string;
  required_bonuses: string; // keep as string for controlled input, parse on submit
};

export type CreateGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; reward_text?: string | null; required_bonuses?: number }) => void;
  isLoading?: boolean;
};

export const CreateGoalModal: FC<CreateGoalModalProps> = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [form, setForm] = useState<CreateGoalForm>({ title: "", reward_text: "", required_bonuses: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateGoalForm, string>>>({});

  const handleChange = <K extends keyof CreateGoalForm>(key: K, value: CreateGoalForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof CreateGoalForm, string>> = {};
    if (!form.title.trim()) next.title = "Введите название цели";
    if (form.required_bonuses !== "") {
      const n = Number(form.required_bonuses);
      if (!Number.isFinite(n) || Math.trunc(n) !== n || n < 0) {
        next.required_bonuses = "Введите целое число не меньше 0";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const rbRaw = form.required_bonuses.trim();
    const rbNum = rbRaw === "" ? undefined : Math.max(0, Math.trunc(Number(rbRaw)));
    onSubmit({
      title: form.title.trim(),
      reward_text: form.reward_text.trim() ? form.reward_text.trim() : null,
      required_bonuses: rbNum,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>Создать цель</h2>
      </div>

      <div className={styles.form}>
        <Input
          label="Название цели"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
          disabled={isLoading}
          required
        />

        <Textarea
          label="Награда (необязательно)"
          value={form.reward_text}
          onChange={(e) => handleChange("reward_text", e.target.value)}
          disabled={isLoading}
          rows={3}
        />

        <Input
          label="Требуемые бонусы (необязательно)"
          value={form.required_bonuses}
          onChange={(e) => handleChange("required_bonuses", e.target.value)}
          error={errors.required_bonuses}
          disabled={isLoading}
          type="number"
          min={0}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} loading={isLoading}>
          Создать
        </Button>
      </div>
    </Modal>
  );
};
