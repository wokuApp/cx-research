import { useEffect, useState, type ReactNode } from 'react';
import styles from './PixelGradientField.module.css';

/** The home CTA's pixel light animation over a parent's full-size gradient. */
export const PixelGradientField = (): ReactNode => {
  const [visible, setVisible] = useState(
    () =>
      typeof document === 'undefined' || document.visibilityState !== 'hidden'
  );

  useEffect(() => {
    const sync = (): void => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return (
    <div
      data-testid="pixel-gradient-field"
      aria-hidden="true"
      data-paused={visible ? undefined : 'true'}
      className={styles.field}
    >
      <div className={styles.glows}>
        <div data-pixel-glow className={`${styles.glow} ${styles.glowA}`} />
        <div data-pixel-glow className={`${styles.glow} ${styles.glowB}`} />
        <div data-pixel-glow className={`${styles.glow} ${styles.glowC}`} />
        <div data-pixel-glow className={`${styles.glow} ${styles.glowD}`} />
      </div>
    </div>
  );
};
