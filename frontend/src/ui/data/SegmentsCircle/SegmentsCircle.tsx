import { FC, useMemo } from "react";
import clsx from "clsx";
import styles from "./SegmentsCircle.module.scss";

type SegmentShape = 'dot' | 'bar' | 'arc';

export type SegmentsCircleProps = {
  total: number;
  value: number;
  size?: number;
  // dot mode
  dotSize?: number;
  // bar mode
  shape?: SegmentShape;
  barLength?: number;
  barThickness?: number;
  // arc mode
  ringThickness?: number;
  gapAngle?: number; // degrees between segments
  className?: string;
};

export const SegmentsCircle: FC<SegmentsCircleProps> = ({
  total,
  value,
  size = 72,
  dotSize = 10,
  shape = 'dot',
  barLength = 14,
  barThickness = 6,
  ringThickness = 8,
  gapAngle = 8,
  className,
}) => {
  const safeTotal = Math.max(0, Math.trunc(Number(total)) || 0);
  const safeValue = Math.max(0, Math.trunc(Number(value)) || 0);
  const filledCount = Math.min(safeValue, safeTotal);

  const radius = useMemo(() => {
    if (shape === 'bar') return Math.max(0, (size - barThickness) / 2);
    if (shape === 'arc') return Math.max(0, (size - ringThickness) / 2);
    return Math.max(0, (size - dotSize) / 2);
  }, [shape, size, dotSize, barThickness, ringThickness]);

  const segments = useMemo(() => {
    return Array.from({ length: safeTotal }).map((_, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, safeTotal);
      const cx = size / 2 + radius * Math.cos(angle);
      const cy = size / 2 + radius * Math.sin(angle);
      const filled = i < filledCount;
      return { key: i, cx, cy, angle, filled };
    });
  }, [safeTotal, filledCount, radius, size]);

  if (shape === 'arc') {
    const segAngle = safeTotal > 0 ? 360 / safeTotal : 0;
    const arcAngle = Math.max(0, segAngle - Math.max(0, gapAngle));
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const polar = (ang: number) => ({
      x: size / 2 + radius * Math.cos(toRad(ang)),
      y: size / 2 + radius * Math.sin(toRad(ang)),
    });
    const arcs = Array.from({ length: safeTotal }).map((_, i) => {
      const startDeg = -90 + i * segAngle + gapAngle / 2;
      const endDeg = startDeg + arcAngle;
      const start = polar(startDeg);
      const end = polar(endDeg);
      const largeArc = arcAngle > 180 ? 1 : 0;
      const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
      const filled = i < filledCount;
      return { key: i, d, filled };
    });
    return (
      <svg
        className={clsx(styles.root, className)}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {arcs.map((a) => (
          <path
            key={`arc-${a.key}`}
            d={a.d}
            className={clsx(styles.arc, a.filled && styles.arcFilled)}
            fill="none"
            strokeWidth={ringThickness}
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }

  return (
    <div className={clsx(styles.root, className)} style={{ width: size, height: size }}>
      {segments.map((s) => (
        shape === 'bar' ? (
          <div
            key={`seg-${s.key}`}
            className={clsx(styles.seg, s.filled && styles.segFilled)}
            style={{
              width: barLength,
              height: barThickness,
              left: s.cx,
              top: s.cy,
              transform: `translate(-50%, -50%) rotate(${(s.angle * 180) / Math.PI}deg)`,
              borderRadius: barThickness / 2,
            }}
          />
        ) : (
          <div
            key={`dot-${s.key}`}
            className={clsx(styles.dot, s.filled && styles.dotFilled)}
            style={{
              width: dotSize,
              height: dotSize,
              left: s.cx - dotSize / 2,
              top: s.cy - dotSize / 2,
            }}
          />
        )
      ))}
      {safeTotal === 0 && (
        <div className={styles.empty} />
      )}
    </div>
  );
}
