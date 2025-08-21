import { useState, ChangeEvent } from "react";
import {
  Button,
  Card,
  Badge,
  Input,
  NumberInput,
  TimeInput,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
} from "../../ui";

export default function UIPrimitives() {
  const [inputValue, setInputValue] = useState("");
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [timeValue, setTimeValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <div className="container">
      <h1>UI Primitives</h1>

      <section>
        <h2>Кнопки</h2>
        <div className="demo-section">
          <Button>Обычная кнопка</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Маленькая</Button>
          <Button size="lg">Большая</Button>
        </div>
      </section>

      <section>
        <h2>Бейджи</h2>
        <div className="demo-section">
          <Badge tone="default">Default</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
        </div>
      </section>

      <section>
        <h2>Карточки</h2>
        <div className="demo-section">
          <Card>
            <h3>Обычная карточка</h3>
            <p>Содержимое карточки</p>
          </Card>

          <Card className="elevated">
            <h3>Карточка с тенью</h3>
            <p>Карточка с дополнительным классом</p>
          </Card>
        </div>
      </section>

      <section>
        <h2>Формы</h2>
        <div className="demo-section">
          <Card>
            <h3>Элементы форм</h3>

            <div className="form-group">
              <label>Input</label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Введите текст"
              />
            </div>

            <div className="form-group">
              <label>NumberInput</label>
              <NumberInput
                value={numberValue}
                onChange={setNumberValue}
                placeholder="Введите число"
              />
            </div>

            <div className="form-group">
              <label>TimeInput</label>
              <TimeInput value={timeValue} onChange={setTimeValue} />
            </div>

            <div className="form-group">
              <label>Textarea</label>
              <Textarea
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder="Введите текст"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Select</label>
              <Select
                options={[
                  { value: "", label: "Выберите опцию" },
                  { value: "option1", label: "Опция 1" },
                  { value: "option2", label: "Опция 2" },
                  { value: "option3", label: "Опция 3" },
                ]}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              />
            </div>

            <div className="form-group">
              <Checkbox
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
                label="Чекбокс"
              />
            </div>

            <div className="form-group">
              <RadioGroup
                name="demo-radio"
                options={[
                  { value: "option1", label: "Опция 1" },
                  { value: "option2", label: "Опция 2" },
                  { value: "option3", label: "Опция 3" },
                ]}
                value={radioValue}
                onChange={(e) => {
                  if (e.target instanceof HTMLInputElement) {
                    setRadioValue(e.target.value);
                  }
                }}
              />
            </div>

            <div className="form-group">
              <Switch
                checked={switchValue}
                onChange={(e) => setSwitchValue(e.target.checked)}
                label="Переключатель"
              />
            </div>
          </Card>
        </div>
      </section>

      <style>{`
        .container {
          padding: 20px;
        }
        section {
          margin-bottom: 30px;
        }
        .demo-section {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .form-group {
          margin-bottom: 15px;
          width: 100%;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
