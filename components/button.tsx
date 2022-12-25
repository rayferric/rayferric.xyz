import styles from './button.module.css';

import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function Button({ children = 'Button', onClick, className }: Props) {
  return (
    <div
      className={styles['button'] + (className ? ' ' + className : '')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
