import styles from './input-field.module.css';

import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useRef
} from 'react';

type Props = {
  type?: 'text' | 'password';
  placeholder?: string;
  icon?: IconDefinition;
  onReturn?: (event: KeyboardEvent<HTMLInputElement>, value: string) => void;
  onIconClick?: (event: MouseEvent<SVGSVGElement>, value: string) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
  inputRef?: RefObject<HTMLInputElement>;
  className?: string;
  onInputClick?: (event: MouseEvent<HTMLInputElement>) => void;
  onEscape?: (event: KeyboardEvent<HTMLInputElement>, value: string) => void;
  defaultValue?: string;
};

export function InputField({
  type,
  placeholder,
  icon,
  onReturn,
  onIconClick,
  onChange,
  inputRef,
  className,
  onInputClick,
  onEscape,
  defaultValue
}: Props) {
  const fallbackRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || fallbackRef;

  return (
    <div className={styles['input'] + (className ? ' ' + className : '')}>
      <input
        ref={ref}
        className={styles['input-input'] + (icon ? ' has-icon' : '')}
        type={type}
        placeholder={placeholder}
        onKeyUp={(event) => {
          if (event.key === 'Enter' || event.key === 'Escape') {
            ref.current?.blur();
            if (event.key === 'Enter') {
              if (onReturn) onReturn(event, ref.current?.value || '');
            } else {
              if (onEscape) onEscape(event, ref.current?.value || '');
            }
          }
        }}
        onChange={(event) => {
          if (onChange) onChange(event, ref.current?.value || '');
        }}
        onClick={onInputClick}
        defaultValue={defaultValue}
      />
      {icon && (
        <FontAwesomeIcon
          className={styles['input-icon']}
          icon={icon}
          onClick={(event) => {
            if (onIconClick)
              onIconClick(
                event as MouseEvent<SVGSVGElement>,
                ref.current?.value || ''
              );
          }}
        />
      )}
    </div>
  );
}
