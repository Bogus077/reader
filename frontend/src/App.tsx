import { HashRouter, Routes, Route, Link } from "react-router-dom";
import "./styles/globals.scss";
import StudentToday from "./pages/student/Today";
import StudentProgress from "./pages/student/Progress";
import StudentLibrary from "./pages/student/Library";
import DayHistory from "./pages/student/DayHistory";
import MentorDashboard from "./pages/mentor/Dashboard";
import MentorStudentCard from "./pages/mentor/StudentCard";
import MentorLibrary from "./pages/mentor/Library";
import MentorAddBook from "./pages/mentor/AddBook";
import UIPrimitives from "./pages/ui-demo/Primitives";
import UIData from "./pages/ui-demo/Data";
import UIFeedback from "./pages/ui-demo/Feedback";
import { useEffect } from "react";
import { useUnit } from "effector-react";
import { authFx } from "./store/auth";
import { isTelegramEnv } from "./lib/telegram";

export default function App() {
  const auth = useUnit(authFx);
  useEffect(() => {
    if (isTelegramEnv()) auth(); // авторизуемся по initData, если запущено внутри Telegram
  }, []);

  return (
    <HashRouter>
      {/* Демо-навигация для разработки */}
      {/* <nav style={{padding:'8px 16px', borderBottom:'1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
        <div>
          <strong>Ученик:</strong>
          <Link to="/" style={{marginLeft: '8px'}}>Сегодня</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/progress">Прогресс</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/library">Библиотека</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/history?date=2025-08-21">История</Link>
        </div>
        <div>
          <strong>Ментор:</strong>
          <Link to="/mentor" style={{marginLeft: '8px'}}>Дашборд</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/mentor/student/123">Карточка ученика</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/mentor/library">Библиотека</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/mentor/books/add">Добавить книгу</Link>
        </div>
        <div>
          <strong>UI:</strong>
          <Link to="/ui/primitives" style={{marginLeft: '8px'}}>Примитивы</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/ui/data">Данные</Link>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to="/ui/feedback">Обратная связь</Link>
        </div>
      </nav> */}

      <Routes>
        {/* Студенческие маршруты */}
        <Route path="/" element={<StudentToday />} />
        <Route path="/progress" element={<StudentProgress />} />
        <Route path="/library" element={<StudentLibrary />} />
        <Route path="/history" element={<DayHistory />} />

        {/* Менторские маршруты */}
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/mentor/student/:id" element={<MentorStudentCard />} />
        <Route path="/mentor/library" element={<MentorLibrary />} />
        <Route path="/mentor/books/add" element={<MentorAddBook />} />

        {/* UI демо маршруты */}
        <Route path="/ui/primitives" element={<UIPrimitives />} />
        <Route path="/ui/data" element={<UIData />} />
        <Route path="/ui/feedback" element={<UIFeedback />} />
      </Routes>
    </HashRouter>
  );
}
