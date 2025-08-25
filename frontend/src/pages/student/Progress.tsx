import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import {
  Topbar,
  Tabbar,
  Card,
  ProgressCircle,
  RatingStars,
  Skeleton,
  BackButton,
} from "../../ui";
import styles from "./Progress.module.scss";
import {
  $strips,
  $progress,
  loadStripsFx,
  loadProgressFx,
} from "../../store/student";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { postLog } from "../../api/client";

export const StudentProgress: FC = () => {
  const [strips, progress] = useUnit([$strips, $progress]);
  const loadStrips = useUnit(loadStripsFx);
  const loadProgress = useUnit(loadProgressFx);
  const isStripsLoading = useUnit(loadStripsFx.pending);
  const isProgressLoading = useUnit(loadProgressFx.pending);
  const navigate = useNavigate();

  // Горизонтальная прокрутка метрик + пагинация точками
  const metricsRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [showPager, setShowPager] = useState(false);
  const updatePagination = () => {
    const el = metricsRef.current;
    if (!el) return;
    setShowPager(el.scrollWidth - el.clientWidth > 2);
    const cards = el.querySelectorAll(
      `.${styles.metricCard}`
    ) as NodeListOf<HTMLElement>;
    if (!cards.length) return;
    // Обработка краёв, чтобы корректно активировалась крайняя точка
    const EPS = 24;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - EPS) {
      setActiveIndex(cards.length - 1);
      return;
    }
    if (el.scrollLeft <= EPS) {
      setActiveIndex(0);
      return;
    }
    // Находим карточку, чей левый край ближе к текущему scrollLeft
    let idx = 0;
    let min = Infinity;
    cards.forEach((card, i) => {
      const offset = Math.abs(card.offsetLeft - el.scrollLeft);
      if (offset < min) {
        min = offset;
        idx = i;
      }
    });
    setActiveIndex(idx);
  };

  useEffect(() => {
    loadStrips();
    loadProgress();
    void postLog("progress_open");
  }, []);

  useEffect(() => {
    const el = metricsRef.current;
    const computeCount = () => {
      if (!el) return;
      const len = el.querySelectorAll(`.${styles.metricCard}`).length;
      setPageCount(len);
      setShowPager(el.scrollWidth - el.clientWidth > 2);
    };
    computeCount();
    updatePagination();
    if (!el) return;
    const onScroll = () => updatePagination();
    const onWheel = (e: WheelEvent) => {
      // Переводим вертикальную прокрутку колёсиком в горизонтальную
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const onResize = () => {
      computeCount();
      updatePagination();
    };
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll as EventListener);
      el.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("resize", onResize);
    };
  }, [strips, isProgressLoading, isStripsLoading]);

  // Расчет процента выполнения
  const progressPercent = (() => {
    const done = Number(progress?.daysDone ?? 0);
    const total = Number(progress?.daysTotal ?? 0);
    if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0)
      return 0;
    const pct = Math.round((done / total) * 100);
    return Math.max(0, Math.min(100, pct));
  })();

  // Название активной книги теперь приходит с backend в progress.bookTitle
  const bookTitle = progress?.bookTitle ?? null;

  // Обработчик клика по дню
  const handleDayClick = (date: string) => {
    navigate(`/history?date=${date}`);
  };

  // Иконка статуса с цветовыми классами
  const getStatusIcon = (status: string) => {
    const base = styles.dayStatus;
    const success = styles.statusSuccess;
    const danger = styles.statusDanger;
    const muted = styles.statusMuted;
    switch (status) {
      case "done":
      case "submitted":
      case "graded":
        return <CheckCircle size={18} className={[base, success].join(" ")} />;
      case "missed":
        return <XCircle size={18} className={[base, danger].join(" ")} />;
      default:
        return <Clock size={18} className={[base, muted].join(" ")} />;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <Topbar title="Прогресс" leftSlot={<BackButton />} />
      <div className="container" style={{ padding: "16px" }}>
        {/* Верхняя секция с карточкой прогресса и метриками */}
        <div className={styles.topSection}>
          {isProgressLoading ? (
            <>
              <Card className={styles.progressCard}>
                <div className={styles.progressCircleWrap}>
                  <Skeleton variant="rect" height={120} width={120} />
                </div>
                <div className={styles.progressInfo}>
                  <Skeleton variant="text" height={16} width="60%" />
                  <Skeleton variant="text" height={14} width="40%" />
                  <Skeleton variant="text" height={14} width="50%" />
                </div>
              </Card>

              <div ref={metricsRef} className={styles.metricsGrid}>
                <Card className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <Skeleton variant="rect" height={20} width={20} />
                  </div>
                  <Skeleton variant="text" height={20} width="30%" />
                  <div className={styles.metricLabel}>
                    <Skeleton variant="text" height={14} width="60%" />
                  </div>
                </Card>
                <Card className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <Skeleton variant="rect" height={20} width={20} />
                  </div>
                  <Skeleton variant="text" height={20} width="20%" />
                  <div className={styles.metricLabel}>
                    <Skeleton variant="text" height={14} width="60%" />
                  </div>
                </Card>
                <Card className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <Skeleton variant="rect" height={20} width={20} />
                  </div>
                  <Skeleton variant="text" height={20} width="20%" />
                  <div className={styles.metricLabel}>
                    <Skeleton variant="text" height={14} width="60%" />
                  </div>
                </Card>
              </div>
              {showPager && (
                <div className={styles.pager}>
                  {Array.from({ length: pageCount || 3 }).map((_, i) => (
                    <button
                      key={`sk-dot-${i}`}
                      className={[
                        styles.dot,
                        i === activeIndex ? styles.dotActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={`Перейти к карточке ${i + 1}`}
                      onClick={() => {
                        const el = metricsRef.current;
                        if (!el) return;
                        const cards = el.querySelectorAll(
                          `.${styles.metricCard}`
                        ) as NodeListOf<HTMLElement>;
                        cards[i]?.scrollIntoView({
                          behavior: "smooth",
                          inline: "start",
                          block: "nearest",
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <Card className={styles.progressCard}>
                <div className={styles.progressCircleWrap}>
                  <ProgressCircle
                    value={progressPercent}
                    size={120}
                    strokeWidth={10}
                    tone="primary"
                  />
                </div>
                <div className={styles.progressInfo}>
                  <div className={styles.bookTitle}>
                    {bookTitle || "Активная книга"}
                  </div>
                  <div className={styles.pagesText}>
                    Прочитано {progressPercent}%
                  </div>
                  <div className={styles.daysText}>
                    Дней: {progress?.daysDone || 0} / {progress?.daysTotal || 0}
                  </div>
                </div>
              </Card>

              <div ref={metricsRef} className={styles.metricsGrid}>
                <Card className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden>
                    ⭐
                  </div>
                  <div className={styles.metricValue}>
                    {Number.isFinite(progress?.avgRating as number)
                      ? (progress!.avgRating as number).toFixed(2)
                      : "—"}
                  </div>
                  <div className={styles.metricLabel}>Средняя оценка</div>
                </Card>
                <Card className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden>
                    🔥
                  </div>
                  <div className={styles.metricValue}>
                    {progress?.currentStreak || 0}
                  </div>
                  <div className={styles.metricLabel}>Текущая серия</div>
                </Card>
                <Card className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden>
                    👑
                  </div>
                  <div className={styles.metricValue}>
                    {progress?.bestStreak || 0}
                  </div>
                  <div className={styles.metricLabel}>Лучшая серия</div>
                </Card>
              </div>
              {showPager && (
                <div className={styles.pager}>
                  {Array.from({ length: pageCount || 3 }).map((_, i) => (
                    <button
                      key={`dot-${i}`}
                      className={[
                        styles.dot,
                        i === activeIndex ? styles.dotActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={`Перейти к карточке ${i + 1}`}
                      onClick={() => {
                        const el = metricsRef.current;
                        if (!el) return;
                        const cards = el.querySelectorAll(
                          `.${styles.metricCard}`
                        ) as NodeListOf<HTMLElement>;
                        cards[i]?.scrollIntoView({
                          behavior: "smooth",
                          inline: "start",
                          block: "nearest",
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Список дней */}
        <Card>
          <div className={styles.historyHeader}>История чтения</div>
          {isStripsLoading ? (
            <div className={styles.skeletonGrid}>
              <Skeleton variant="rect" height={16} />
              <Skeleton variant="rect" height={16} />
              <Skeleton variant="rect" height={16} width="80%" />
            </div>
          ) : (
            <div className={styles.historyList}>
              {strips.map((strip, index) => (
                <div
                  key={`${strip.date}-${index}`}
                  className={styles.dayItem}
                  onClick={() => handleDayClick(strip.date)}
                >
                  <div className={styles.dayDate}>{formatDate(strip.date)}</div>
                  <div>{getStatusIcon(strip.status)}</div>
                  {strip.rating !== undefined && (
                    <div className={styles.dayRating}>
                      <RatingStars value={strip.rating} readOnly size="sm" />
                    </div>
                  )}
                  {strip.assignment?.target && (
                    <div className={styles.dayTarget}>
                      {strip.assignment.target.percent
                        ? `${strip.assignment.target.percent}%`
                        : strip.assignment.target.page
                        ? `стр. ${strip.assignment.target.page}`
                        : strip.assignment.target.chapter || "—"}
                    </div>
                  )}
                </div>
              ))}
              {strips.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "var(--gray-600)",
                  }}
                >
                  История пока пуста
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
      <Tabbar />
    </div>
  );
};

export default StudentProgress;
