import styles from './footer.module.css';

import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Footer() {
  return (
    <div className={styles['footer']}>
      <p className={styles['text']}>Made with&nbsp;&nbsp;</p>
      <a
        href='https://github.com/rayferric/rayferric.github.io/'
        target='_blank'
        rel='noreferrer'
      >
        <FontAwesomeIcon className={styles['heart']} icon={faHeart} />
      </a>
    </div>
  );
}
