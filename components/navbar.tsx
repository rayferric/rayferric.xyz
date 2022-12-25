import styles from './navbar.module.css';

import NavLink from './nav-link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { pathname } = useRouter();

  return (
    <div className={styles['navbar']}>
      <div className={styles['links']}>
        <NavLink
          className={styles['links-item'] + ' ' + styles['links-item-first']}
          href='/'
        >
          HELLO
        </NavLink>
        <NavLink
          className={styles['links-item'] + ' ' + styles['links-item-second']}
          href='/posts/'
        >
          POSTS
        </NavLink>
        <NavLink
          className={styles['links-item'] + ' ' + styles['links-item-third']}
          href='/about/'
        >
          ABOUT
        </NavLink>
      </div>
    </div>
  );
}
