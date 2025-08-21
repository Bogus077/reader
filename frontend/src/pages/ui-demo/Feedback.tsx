import { useState, useEffect } from "react";
import { Button, Card, Modal, GradeModal, AssignmentEditModal } from "../../ui";
import { toast as toastManager } from "../../ui/feedback/Toast/toastManager";
import { AssignmentData } from "../../ui/composite/AssignmentEditModal/AssignmentEditModal";

export default function UIFeedback() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  // Используем менеджер тостов вместо локального состояния

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openGradeModal = () => setIsGradeModalOpen(true);
  const closeGradeModal = () => setIsGradeModalOpen(false);

  const openAssignmentModal = () => setIsAssignmentModalOpen(true);
  const closeAssignmentModal = () => setIsAssignmentModalOpen(false);

  const showToast = (type: "success" | "error" | "info") => {
    const message =
      type === "success"
        ? "Операция выполнена успешно!"
        : type === "error"
        ? "Произошла ошибка!"
        : "Информационное сообщение";

    // Используем менеджер тостов для отображения уведомлений
    if (type === "success") {
      toastManager.success(message);
    } else if (type === "error") {
      toastManager.error(message);
    } else {
      toastManager.info(message);
    }
  };

  const handleGradeSubmit = (data: { rating: number; comment: string }) => {
    toastManager.success("Оценка успешно сохранена!");
    closeGradeModal();
    console.log("Grade submitted:", data);
  };

  const handleAssignmentSubmit = (data: AssignmentData) => {
    toastManager.success("Задание успешно сохранено!");
    closeAssignmentModal();
    console.log("Assignment submitted:", data);
  };

  return (
    <div className="container">
      <h1>UI Feedback Components</h1>

      <section>
        <h2>Модальные окна</h2>
        <Card>
          <div className="button-group">
            <Button onClick={openModal}>Открыть простую модалку</Button>
            <Button onClick={openGradeModal}>Открыть модалку оценки</Button>
            <Button onClick={openAssignmentModal}>
              Открыть модалку задания
            </Button>
          </div>

          {/* Простая модалка */}
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div>
              <h3>Пример модального окна</h3>
              <p>
                Это пример простого модального окна с заголовком и содержимым.
              </p>
              <p>
                Модальное окно можно закрыть, нажав на крестик, кнопку "Закрыть"
                или кликнув вне окна.
              </p>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button onClick={closeModal}>Закрыть</Button>
              </div>
            </div>
          </Modal>

          {/* Модалка оценки */}
          <GradeModal
            isOpen={isGradeModalOpen}
            onClose={closeGradeModal}
            onSubmit={handleGradeSubmit}
            initialRating={0}
            initialComment=""
            date="2025-08-20"
            targetSummary="Демонстрационное задание"
          />

          {/* Модалка задания */}
          <AssignmentEditModal
            isOpen={isAssignmentModalOpen}
            onClose={closeAssignmentModal}
            onSubmit={handleAssignmentSubmit}
            initialData={{
              title: "",
              pages: 0,
              time: "",
              description: "",
            }}
          />
        </Card>
      </section>

      <section>
        <h2>Тосты</h2>
        <Card>
          <div className="button-group">
            <Button onClick={() => showToast("success")} variant="primary">
              Показать успешный тост
            </Button>
            <Button onClick={() => showToast("error")} variant="ghost">
              Показать тост с ошибкой
            </Button>
            <Button onClick={() => showToast("info")}>
              Показать информационный тост
            </Button>
          </div>

          {/* Тосты будут отображаться через портал в body */}
        </Card>
      </section>

      {/* Секция с тултипами удалена, так как компонент Tooltip не экспортируется из UI */}

      <style>{`
        .container {
          padding: 20px;
        }
        section {
          margin-bottom: 30px;
        }
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        /* Удаляем стили toast-container, так как тосты отображаются через портал */
        .tooltip-demos {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
      `}</style>
    </div>
  );
}
