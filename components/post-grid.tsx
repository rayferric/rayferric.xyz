import styles from './post-grid.module.css';

import Post from './post';

import { PostInfo } from '../src/post';

type Props = {
  posts: PostInfo[];
  onAdminReorder?: (post: PostInfo, direction: 'prev' | 'next') => void;
  onAdminDelete?: (post: PostInfo) => void;
};

export default function PostGrid({
  posts,
  onAdminReorder,
  onAdminDelete
}: Props) {
  return (
    <div className={styles['post-grid']}>
      <div className={styles['posts']}>
        {posts.map((post, i) => (
          <Post
            key={i}
            post={post}
            onAdminReorder={
              onAdminReorder &&
              ((dir) => {
                if (onAdminReorder) onAdminReorder(post, dir);
              })
            }
            onAdminDelete={
              onAdminDelete &&
              (() => {
                if (onAdminDelete) onAdminDelete(post);
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
