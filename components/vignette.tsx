import styles from './vignette.module.css';

export default function Vignette() {
  return (
    <div>
      <div className={styles['overlay'] + ' ' + styles['top']}></div>
      <div className={styles['overlay'] + ' ' + styles['bottom']}></div>
    </div>
  );
}
