import styles from './hello-world.module.css';

import { ReactNode } from 'react';

import mediaAvatarPng from '../media/avatar.png';
import mediaXmasAvatarPng from '../media/xmas-avatar.png';

type Props = {
  children: ReactNode;
};

export default function HelloWorld({ children }: Props) {
  const isXmas = new Date().getMonth() === 11;

  return (
    <div className={styles['hello-world']}>
      <img
        className={styles['avatar']}
        src={isXmas ? mediaXmasAvatarPng.src : mediaAvatarPng.src}
        alt='Avatar'
      />
      <div className={styles['content']}>
        <div>
          <p className={styles['content-greeting']}>👋 Hello, world!</p>
          <p className={styles['content-introduction']}>
            I&apos;m{' '}
            <span className={styles['content-introduction-name']}>Rafał</span>
            <span className={styles['content-introduction-nick']}>
              {' '}
              &#8220;Ray Ferric&#8221;{' '}
            </span>
            <span className={styles['content-introduction-name']}>Żelazko</span>
          </p>
        </div>
        <div className={styles['content-description']}>{children}</div>
      </div>
    </div>
  );
}
