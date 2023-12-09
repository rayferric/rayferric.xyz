import styles from './image-viewer.module.css';

import { useEffect, useState } from 'react';

type Props = {
  src?: string;
  alt?: string;
  [x: string]: unknown;
};

export function ImageViewer(props: Props) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShown(false);
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [shown]);

  useEffect(() => {
    document.body.style.overflow = shown ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [shown]);

  return (
    <div>
      <img alt={props.alt} {...props} onClick={() => setShown(true)} />
      <div
        className={styles['image-viewer'] + (shown ? ' shown' : '')}
        onClick={() => setShown(false)}
      >
        <img className={styles['image']} alt={props.alt} src={props.src} />
      </div>
    </div>
  );
}
