import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import './styles/globals.scss';
import StudentToday from './pages/student/Today';
import MentorDashboard from './pages/mentor/Dashboard';
import UIPrimitives from './pages/ui-demo/Primitives';
import UIData from './pages/ui-demo/Data';
import UIFeedback from './pages/ui-demo/Feedback';
import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { authFx } from './store/auth';
import { isTelegramEnv } from './lib/telegram';

export default function App() {
  const auth = useUnit(authFx);
  useEffect(()=>{
    if (isTelegramEnv()) auth(); // авторизуемся по initData, если запущено внутри Telegram
  },[]);

  return (
    <HashRouter>
      <nav style={{padding:'8px 16px', borderBottom:'1px solid #eee'}}>
        <Link to="/">Ученик</Link>
        <span style={{margin:'0 8px'}}>|</span>
        <Link to="/mentor">Ментор</Link>
        <span style={{margin:'0 8px'}}>|</span>
        <Link to="/ui/primitives">UI: Примитивы</Link>
        <span style={{margin:'0 8px'}}>|</span>
        <Link to="/ui/data">UI: Данные</Link>
        <span style={{margin:'0 8px'}}>|</span>
        <Link to="/ui/feedback">UI: Обратная связь</Link>
      </nav>
      <Routes>
        <Route path="/" element={<StudentToday/>} />
        <Route path="/mentor" element={<MentorDashboard/>} />
        <Route path="/ui/primitives" element={<UIPrimitives/>} />
        <Route path="/ui/data" element={<UIData/>} />
        <Route path="/ui/feedback" element={<UIFeedback/>} />
      </Routes>
    </HashRouter>
  );
}
