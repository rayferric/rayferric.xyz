import styles from './admin.module.css';

import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faDoorClosed, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useRef, useState } from 'react';
import Twemoji from 'react-twemoji';

import { Button } from '../components/button';
import { InputField } from '../components/input-field';

import Context from '../src/context';
import Seo from '../components/seo';

export default function Admin() {
  const context = useContext(Context);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signIn = async (password: string | undefined) => {
    if (!password) {
      context.alertsRef?.current?.showAlert(
        'Please type in a password.',
        'error'
      );
      return;
    }

    try {
      const res = await fetch('/api/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (res.status !== 200) throw Error(await res.json());

      const body = await res.json();
      if (body.signedIn) {
        context.setSignedIn!(true);
        passwordRef.current!.value = '';
        context.alertsRef?.current?.showAlert(
          'Signed in successfully.',
          'success'
        );
      } else throw Error(body.message);
    } catch (e) {
      if (e instanceof Error) {
        context.alertsRef?.current?.showAlert(e.message, 'error');
      }
    }
  };

  const newPasswordRef = useRef<HTMLInputElement>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);

  const changePassword = async (
    oldPassword: string | undefined,
    newPassword: string | undefined
  ) => {
    if (!oldPassword || !newPassword) {
      context.alertsRef?.current?.showAlert(
        'Please type in both passwords.',
        'error'
      );
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (res.status !== 200) throw Error(await res.json());

      const body = await res.json();
      if (body.passwordChanged) {
        context.alertsRef?.current?.showAlert(
          'Password changed successfully.',
          'success'
        );
        oldPasswordRef.current!.value = '';
        newPasswordRef.current!.value = '';
      } else throw Error(body.message);
    } catch (e) {
      if (e instanceof Error) {
        context.alertsRef?.current?.showAlert(e.message, 'error');
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  if (context.signedIn === null) return null;

  if (context.signedIn)
    return (
      <Twemoji options={{ className: 'twemoji' }}>
        <Seo title='Ray Ferric | Admin' />
        <div className={styles['admin']}>
          <div className={styles['status']}>
            <FontAwesomeIcon
              className={styles['status-icon'] + ' signed-in'}
              icon={faDoorOpen}
            />
            <span className={styles['status-text']}>You are signed in.</span>
          </div>
          <Button
            onClick={async () => {
              try {
                const response = await fetch('/api/sign-out', {
                  method: 'POST'
                });

                if (!response.ok) throw Error((await response.json()).message);

                context.setSignedIn!(false);
                context.alertsRef?.current?.showAlert(
                  'Signed out successfully.',
                  'success'
                );
              } catch (e) {
                if (e instanceof Error)
                  context.alertsRef?.current?.showAlert(e.message, 'error');
              }
            }}
          >
            Sign Out
          </Button>
          <span className={styles['password-change-header']}>
            Change the password:
          </span>
          <InputField
            className={styles['input']}
            placeholder='Old password...'
            icon={showPassword ? faEye : faEyeSlash}
            type={showPassword ? 'text' : 'password'}
            onIconClick={() => setShowPassword(!showPassword)}
            inputRef={oldPasswordRef}
          />
          <InputField
            className={styles['input']}
            placeholder='New password...'
            icon={showPassword ? faEye : faEyeSlash}
            type={showPassword ? 'text' : 'password'}
            onIconClick={() => setShowPassword(!showPassword)}
            inputRef={newPasswordRef}
          />
          <Button
            onClick={async () => {
              changePassword(
                oldPasswordRef.current?.value,
                newPasswordRef.current?.value
              );
            }}
          >
            Change
          </Button>
        </div>
      </Twemoji>
    );

  return (
    <Twemoji options={{ className: 'twemoji' }}>
      <div className={styles['admin']}>
        <div className={styles['status']}>
          <FontAwesomeIcon
            className={styles['status-icon']}
            icon={faDoorClosed}
          />
          <span className={styles['status-text']}>You are signed out.</span>
        </div>
        <InputField
          className={styles['input']}
          placeholder='Password...'
          icon={showPassword ? faEye : faEyeSlash}
          type={showPassword ? 'text' : 'password'}
          onReturn={(_, value) => signIn(value)}
          onIconClick={() => setShowPassword(!showPassword)}
          inputRef={passwordRef}
        />
        <Button
          onClick={() => {
            signIn(passwordRef.current?.value);
          }}
        >
          Sign In
        </Button>
      </div>
    </Twemoji>
  );
}
