import styles from './image-viewer.module.css';

import { useEffect, useRef, useState } from 'react';

type Props = {
  src?: string;
  alt?: string;
  [x: string]: unknown;
};

export function ImageViewer(props: Props) {
  const [shown, setShown] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!shown) return;

    // Handle escape key.
    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShown(false);
    };
    document.addEventListener('keydown', keyListener);

    // Adjust image-rendering depending on img size.
    // Use crisp-edges if image is zoomed in, otherwise use auto.
    const sizeListener = () => {
      if (!imgRef.current) return;

      const img = imgRef.current;
      if (img.clientWidth > img.naturalWidth) {
        img.style.imageRendering = 'crisp-edges';
      } else {
        img.style.imageRendering = 'auto';
      }
    };
    sizeListener(); // Call once to set initial image-rendering.
    const resizeObserver = new ResizeObserver(sizeListener);
    resizeObserver.observe(imgRef.current!);

    return () => {
      document.removeEventListener('keydown', keyListener);
      resizeObserver.disconnect();
    };
  }, [shown, imgRef, props.src]);

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
        <img
          className={styles['image']}
          alt={props.alt}
          src={props.src}
          ref={imgRef}
        />
      </div>
    </div>
  );
}
