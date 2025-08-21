import { FC } from "react";
import clsx from "clsx";
import { Home, BookOpen, BarChart2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
   * Название иконки (поддерживаются: 'home', 'library', 'progress')
   */
  icon: 'home' | 'library' | 'progress';
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
};

export const Tabbar: FC<TabbarProps> = ({ className }) => {
  const location = useLocation();
  
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Домой',
      icon: 'home',
      path: '/'
    },
    {
      id: 'progress',
      label: 'Прогресс',
      icon: 'progress',
      path: '/progress'
    },
    {
      id: 'library',
      label: 'Библиотека',
      icon: 'library',
      path: '/library'
    }
  ];
  // Функция для получения компонента иконки по названию
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Home size={24} />;
      case 'library':
        return <BookOpen size={24} />;
      case 'progress':
        return <BarChart2 size={24} />;
      default:
        return <Home size={24} />;
    }
  };

  return (
    <nav className={clsx(styles.tabbar, className)}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) => clsx(
            styles.tab,
            isActive && styles.active
          )}
          aria-selected={location.pathname === tab.path}
          role="tab"
        >
          <div className={styles.icon}>
            {getIconComponent(tab.icon)}
          </div>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
