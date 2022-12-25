import styles from './post.module.css';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  faCalendar,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState, useEffect, useContext } from 'react';

import Context from '../src/context';
import { PostInfo, getPostName, getPostIcon } from '../src/post';

type Props = {
  post: PostInfo;
  onAdminReorder?: (direction: 'prev' | 'next') => void;
  onAdminDelete?: () => void;
};

export default function Post({ post, onAdminReorder, onAdminDelete }: Props) {
  const context = useContext(Context);
  const postUrl = `/posts/${post.id}/`;
  const coverUrl = `/api/posts/${post.id}/cover`;
  const created = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long'
  }).format(new Date(post.created));

  let description = post.description;
  if (description.length > 64)
    description = description.substring(0, 61).trim() + '...';

  return (
    <Link
      className={styles['post'] + (post.unlisted ? ' unlisted' : '')}
      href={postUrl}
    >
      <img className={styles['cover']} src={coverUrl} alt='Cover' />
      {context.signedIn && onAdminReorder && (
        <div className={styles['admin-reorder-controls']}>
          <div
            className={styles['admin-reorder-controls-button']}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              onAdminReorder('prev');
            }}
          >
            <FontAwesomeIcon
              className={styles['admin-reorder-controls-button-icon']}
              icon={faChevronLeft}
            />
          </div>
          <div
            className={styles['admin-reorder-controls-button']}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              onAdminReorder('next');
            }}
          >
            <FontAwesomeIcon
              className={styles['admin-reorder-controls-button-icon']}
              icon={faChevronRight}
            />
          </div>
        </div>
      )}
      {context.signedIn && onAdminDelete && (
        <div
          className={styles['admin-delete-button']}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onAdminDelete();
          }}
        >
          <FontAwesomeIcon
            className={styles['admin-delete-button-icon']}
            icon={faTrashCan}
          />
        </div>
      )}
      <div className={styles['info']}>
        <p className={styles['info-title']}>{post.title}</p>
        <p className={styles['info-meta']}>
          {
            <FontAwesomeIcon
              className={styles['info-meta-icon']}
              icon={getPostIcon(post.type)}
            />
          }{' '}
          &nbsp; {getPostName(post.type)} &nbsp;&nbsp;&nbsp;{' '}
          <FontAwesomeIcon
            className={styles['info-meta-icon']}
            icon={faCalendar}
          />{' '}
          &nbsp; {created}
        </p>
        <p className={styles['info-description']}>{description}</p>
      </div>
    </Link>
  );
}
