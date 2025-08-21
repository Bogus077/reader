import { FC } from "react";
import clsx from "clsx";
import { Home, BookOpen, BarChart2 } from "lucide-react";
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
};

export type TabbarProps = {
  /**
   * Список вкладок
   */
  tabs: TabItem[];
  /**
   * Идентификатор активной вкладки
   */
  activeTab: string;
  /**
   * Обработчик выбора вкладки
   */
  onTabChange: (tabId: string) => void;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const Tabbar: FC<TabbarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
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
        <button
          key={tab.id}
          className={clsx(
            styles.tab,
            activeTab === tab.id && styles.active
          )}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          <div className={styles.icon}>
            {getIconComponent(tab.icon)}
          </div>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
