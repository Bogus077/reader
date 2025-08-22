import { FC } from "react";
import clsx from "clsx";
import {
  Home,
  BookOpen,
  BarChart2,
  Users,
  Calendar,
  Settings,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useUnit } from "effector-react";
import { $user } from "../../../store/auth";
import styles from "./Tabbar.module.scss";

export type TabItem = {
  /**
   * Идентификатор вкладки
   */
  id: string;
  /**
   * Название вкладки
   */
  label: string;
  /**
   * Название иконки
   */
  icon: "home" | "library" | "progress" | "students" | "calendar" | "settings";
  /**
   * Путь для навигации
   */
  path: string;
};

export type TabbarProps = {
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  /**
   * Тип панели навигации (по умолчанию определяется автоматически по роли пользователя)
   */
  type?: "student" | "mentor";
};

export const Tabbar: FC<TabbarProps> = ({ className, type }) => {
  const location = useLocation();
  const user = useUnit($user);
  console.log(user);

  // Определяем тип панели навигации на основе роли пользователя, если не указан явно
  const tabbarType = type || (user?.role === "mentor" ? "mentor" : "student");

  // Вкладки для студента
  const studentTabs: TabItem[] = [
    {
      id: "progress",
      label: "Прогресс",
      icon: "progress",
      path: "/progress",
    },
    {
      id: "home",
      label: "Сегодня",
      icon: "home",
      path: "/",
    },
    {
      id: "library",
      label: "Библиотека",
      icon: "library",
      path: "/library",
    },
  ];

  // Вкладки для ментора
  const mentorTabs: TabItem[] = [
    {
      id: "home",
      label: "Домой",
      icon: "home",
      path: "/mentor",
    },
    {
      id: "library",
      label: "Библиотека",
      icon: "library",
      path: "/mentor/library",
    },
    {
      id: "students",
      label: "Ученики",
      icon: "students",
      path: "/mentor/student/123",
    },
  ];

  // Выбираем набор вкладок в зависимости от типа
  const tabs = tabbarType === "mentor" ? mentorTabs : studentTabs;
  // Функция для получения компонента иконки по названию
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "home":
        return <Home size={20} />;
      case "library":
        return <BookOpen size={20} />;
      case "progress":
        return <BarChart2 size={20} />;
      case "students":
        return <Users size={20} />;
      case "calendar":
        return <Calendar size={20} />;
      case "settings":
        return <Settings size={20} />;
      default:
        return <Home size={20} />;
    }
  };

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      <nav
        className={clsx(
          styles.tabbar,
          tabbarType === "mentor" && styles.mentor,
          className
        )}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            end
            className={({ isActive }) =>
              clsx(styles.tab, isActive && styles.active)
            }
            aria-selected={location.pathname === tab.path}
            role="tab"
          >
            <div className={styles.icon}>{getIconComponent(tab.icon)}</div>
            <span className={styles.label}>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
