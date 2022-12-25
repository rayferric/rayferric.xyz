import styles from './image-viewer.module.css';

import { useState } from 'react';

type Props = {
  src?: string;
  alt?: string;
  [x: string]: unknown;
};

export function ImageViewer(props: Props) {
  const [shown, setShown] = useState(false);

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
