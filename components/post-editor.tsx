import styles from './post-editor.module.css';

import { Button } from './button';
import Dropdown from './dropdown';
import { InputField } from './input-field';
import { TextArea } from './text-area';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getPostIcon, getPostName, Post, postTypes } from '../src/post';

type Props = {
  shown: boolean;
  post: Post;
  onCancel?: () => void;
  onSave?: (post: Post) => void;
};

export default function PostEditor({ shown, post, onCancel, onSave }: Props) {
  const idRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<Dropdown>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [key, setKey] = useState(0); // Used to reset the panel

  const save = useCallback(() => {
    const newPost: Post = {
      id: idRef.current!.value,
      type: postTypes[typeRef.current!.getSelection()],
      unlisted: post.unlisted,
      created: post.created,
      updated: new Date().toISOString(),
      title: titleRef.current!.value,
      description: descriptionRef.current!.value,
      content: contentRef.current!.value
    };

    if (onSave) onSave(newPost);
  }, [post, onSave]);

  useEffect(() => {
    if (!shown) return;

    setKey((key) => key + 1);

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCancel) onCancel();
      if (event.key === 's' && event.ctrlKey) {
        event.preventDefault();
        save();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [shown, onCancel, save]);

  useEffect(() => {
    document.body.style.overflow = shown ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [shown]);

  return (
    <div className={styles['post-editor'] + (shown ? ' shown' : '')}>
      <div className={styles['panel']} key={key}>
        <div className={styles['panel-scrollable-area']}>
          <div className={styles['panel-row']}>
            <div className={styles['panel-row-item']}>
              <span className={styles['panel-row-item-label']}>ID</span>
              <InputField
                inputRef={idRef}
                placeholder='ID...'
                className={styles['panel-row-item-input']}
                defaultValue={post.id}
              />
            </div>
            <div className={styles['panel-row-item']}>
              <span className={styles['panel-row-item-label']}>Title</span>
              <InputField
                inputRef={titleRef}
                placeholder='Title...'
                className={styles['panel-row-item-input']}
                defaultValue={post.title}
              />
            </div>
          </div>
          <div className={styles['panel-row']}>
            <div className={styles['panel-row-item']}>
              <span className={styles['panel-row-item-label']}>
                Description
              </span>
              <InputField
                inputRef={descriptionRef}
                placeholder='Description...'
                className={styles['panel-row-item-input']}
                defaultValue={post.description}
              />
            </div>
            <div className={styles['panel-row-item']}>
              <span className={styles['panel-row-item-label']}>Type</span>
              <Dropdown
                ref={typeRef}
                placeholder='Type to filter...'
                className={styles['panel-row-item-dropdown']}
                items={postTypes.map((type) => ({
                  value: getPostName(type),
                  icon: getPostIcon(type)
                }))}
                defaultItemIndex={postTypes.indexOf(post.type)}
              />
            </div>
          </div>
          <div className={styles['panel-row'] + ' growing'}>
            <div className={styles['panel-row-item']}>
              <span className={styles['panel-row-item-label']}>Content</span>
              <TextArea
                textAreaRef={contentRef}
                className={styles['panel-row-item-text-area']}
                placeholder='Content...'
                defaultValue={post.content}
              />
            </div>
          </div>
          <div className={styles['panel-row']}>
            <Button className={styles['panel-row-button']} onClick={save}>
              <span className={styles['panel-row-button-content']}>Save</span>
              <FontAwesomeIcon
                className={styles['panel-row-button-icon']}
                icon={faFloppyDisk}
              />
            </Button>
            <Button
              className={styles['panel-row-button']}
              onClick={() => {
                if (onCancel) onCancel();
              }}
            >
              <span className={styles['panel-row-button-content']}>Cancel</span>
              <FontAwesomeIcon
                className={styles['panel-row-button-icon']}
                icon={faArrowRightFromBracket}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
