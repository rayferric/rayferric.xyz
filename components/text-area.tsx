import styles from './text-area.module.css';

type Props = {
  className?: string;
  textAreaRef?: React.Ref<HTMLTextAreaElement>;
  placeholder?: string;
  defaultValue?: string;
};

export function TextArea({
  className,
  textAreaRef,
  placeholder,
  defaultValue
}: Props) {
  return (
    <div className={styles['text-area'] + (className ? ' ' + className : '')}>
      <textarea
        className={styles['text-area-textarea']}
        ref={textAreaRef}
        placeholder={placeholder}
        defaultValue={defaultValue}
        spellCheck={false}
      />
    </div>
  );
}
