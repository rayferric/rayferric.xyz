import styles from './about.module.css';

import {
  faGithub,
  faLinkedin,
  faTwitter,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Twemoji from 'react-twemoji';

import HelloWorld from '../components/hello-world';
import Seo from '../components/seo';

export default function About() {
  return (
    <div className={styles['about']}>
      <Seo title='Ray Ferric | About' />
      <Twemoji options={{ className: 'twemoji' }}>
        <HelloWorld>
          <p>
            My passion is computer graphics programming. 💻 I&apos;m keen on
            designing libraries and programmer friendly KISS-conformant
            interfaces. 🌱 I love mathematics and analytic geometry,
            successfully applying them in computer science topics. 🧮 I&apos;m
            also a Linux enthusiast. 🐧 Minecraft is art. 🧱
          </p>
          <div className={styles['content-contact']}>
            <div className={styles['content-contact-group']}>
              <a
                className={
                  styles['content-contact-group-item'] +
                  ' ' +
                  styles['content-contact-group-item-github']
                }
                href='https://github.com/rayferric'
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon
                  className={styles['content-contact-group-item-icon']}
                  icon={faGithub}
                />
              </a>
              <a
                className={
                  styles['content-contact-group-item'] +
                  ' ' +
                  styles['content-contact-group-item-email']
                }
                href='mailto:&#x72;&#x61;&#x79;&#x66;&#x65;&#x72;&#x72;&#x69;&#x63;&#x40;&#x67;&#x6d;&#x61;&#x69;&#x6c;&#x2e;&#x63;&#x6f;&#x6d;'
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon
                  className={styles['content-contact-group-item-icon']}
                  icon={faAt}
                />
              </a>
              <a
                className={
                  styles['content-contact-group-item'] +
                  ' ' +
                  styles['content-contact-group-item-linkedin']
                }
                href='https://www.linkedin.com/in/rayferric'
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon
                  className={styles['content-contact-group-item-icon']}
                  icon={faLinkedin}
                />
              </a>
            </div>
            <div className={styles['content-contact-group']}>
              <a
                className={
                  styles['content-contact-group-item'] +
                  ' ' +
                  styles['content-contact-group-item-twitter']
                }
                href='https://twitter.com/rayferric'
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon
                  className={styles['content-contact-group-item-icon']}
                  icon={faTwitter}
                />
              </a>
              <a
                className={
                  styles['content-contact-group-item'] +
                  ' ' +
                  styles['content-contact-group-item-youtube']
                }
                href='https://www.youtube.com/channel/UCEXSCnKng23b0AukQ3JpI4w'
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon
                  className={styles['content-contact-group-item-icon']}
                  icon={faYoutube}
                />
              </a>
            </div>
          </div>
        </HelloWorld>
      </Twemoji>
    </div>
  );
}
