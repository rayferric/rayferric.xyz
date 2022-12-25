import styles from './404.module.css';

export default function NotFound() {
  return (
    <div className={styles['not-found']}>
      <div>
        <p className={styles['code']}>404</p>
        <p className={styles['text']}>Not Found</p>
      </div>
    </div>
  );
}
