import styles from './index.module.css';

import { Button } from '../../components/button';
import { InputField } from '../../components/input-field';
import PostGrid from '../../components/post-grid';
import Context from '../../src/context';
import pool from '../../src/pg';
import { PostInfo } from '../../src/post';
import rand from '../../src/rand';
import {
  faFolderPlus,
  faPlus,
  faSearch,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useContext } from 'react';
import { CircleLoader } from 'react-spinners';
import Twemoji from 'react-twemoji';
import Seo from '../../components/seo';

const movieQuotes = [
  "I'm sorry, Dave. I'm afraid I can't find that.", // 2001: A Space Odyssey
  'Houston, we have a problem.', // Apollo 13
  'The Matrix has no such post.', // The Matrix
  'E.T. find the post.', // E.T. the Extra-Terrestrial
  'I am not your post.', // Star Wars
  "You're gonna need a broader query.", // Jaws
  'Post. James Post.', // James Bond series
  'Not here, my dear Watson.', // Sherlock Holmes
  "Here's nothing!", // The Shining
  "What's the matter, Colonel Sanders? No posts?", // Spaceballs
  'The search for something may lead to finding nothing.', // Doctor Who
  'Malfunctioning in every way.', // Interstellar
  'The post is a lie.', // Portal
  "These aren't the posts you're looking for.", // Star Wars
  "I'm sorry, but your post is in another castle.", // Super Mario Bros.
  "I'll be back, when you find the post.", // The Terminator
  'No posts to find, no posts to hide.', // The Matrix
  'In space, no one can find your posts.' // Alien
];

let quoteIndex = Math.floor(rand() * movieQuotes.length);

type Props = {
  defaultPosts: PostInfo[];
};

export async function getStaticProps() {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    // During build we do not have access to the database
    // So we export a dummy website that will be re-rended during runtime
    return {
      props: { defaultPosts: [] },
      revalidate: 1 // Re-render after 1 second
    };
  }

  // const posts = await getPosts(false);

  const posts = await (
    await fetch(`http://localhost:${process.env.PORT}/api/posts`)
  ).json();

  return {
    props: { defaultPosts: posts },
    revalidate: 60 // Re-render every minute
  };
}

export default function Posts(props: Props) {
  let defaultPosts = useRef(props.defaultPosts);
  const context = useContext(Context);
  const [posts, setPosts] = useState<PostInfo[] | null>(defaultPosts.current);
  const timeout = useRef<NodeJS.Timeout>();
  const router = useRouter();

  // Fetch unlisted posts if signed in
  useEffect(() => {
    if (context.signedIn) {
      (async () => {
        const response = await fetch('/api/posts');
        defaultPosts.current = await response.json();
        setPosts(defaultPosts.current);
      })();
    }
  }, [context.signedIn]);

  const search = async (query: string) => {
    if (!query) {
      setPosts(defaultPosts.current);
      return;
    }

    clearTimeout(timeout.current);
    setPosts(null);

    const response = await fetch(
      '/api/posts?' +
        new URLSearchParams({
          search: query
        })
    );
    const posts = await response.json();

    quoteIndex += Math.floor(rand() * 3 + 1);
    quoteIndex = quoteIndex % movieQuotes.length;

    setPosts(posts);
  };

  return (
    <Twemoji options={{ className: 'twemoji' }}>
      <Seo title='Ray Ferric | Blog' />
      <div className={styles['posts']}>
        <div className={styles['interface']}>
          <InputField
            className={styles['search']}
            placeholder='Type to search...'
            icon={faSearch}
            onReturn={(_, value) => {
              if (timeout.current) search(value);
            }}
            onIconClick={(_, value) => {
              if (timeout.current) search(value);
            }}
            onChange={(_, value) => {
              if (timeout.current) clearTimeout(timeout.current);

              setPosts(null);
              timeout.current = setTimeout(() => {
                timeout.current = undefined;
                search(value);
              }, 500);
            }}
          />
          {context.signedIn && (
            <Button
              className={styles['new-post']}
              onClick={async () => {
                try {
                  // Request to create a new post
                  const response = await fetch('/api/posts', {
                    method: 'POST'
                  });

                  // Check if the request was successful
                  const body = await response.json();
                  if (!response.ok) throw Error(body.message);

                  // Navigate to the new post
                  router.push(`/posts/${body.id}`);
                } catch (e) {
                  if (e instanceof Error) {
                    context.alertsRef?.current?.showAlert(e.message, 'error');
                  }
                }
              }}
            >
              <FontAwesomeIcon
                className={styles['new-post-icon']}
                icon={faFolderPlus}
              />
            </Button>
          )}
        </div>
        {!posts ? (
          <div className={styles['loader']}>
            <CircleLoader color='#bb4f4e' size='100px' />
          </div>
        ) : posts.length !== 0 ? (
          <PostGrid
            posts={posts}
            onAdminDelete={async (post) => {
              try {
                // Ask for confirmation
                await context.alertsRef?.current?.confirmBox(
                  `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
                );

                try {
                  // Request to delete the post
                  const response = await fetch(`/api/posts/${post.id}`, {
                    method: 'DELETE'
                  });

                  if (!response.ok)
                    throw Error((await response.json()).message);

                  // Remove the post from the list
                  setPosts(posts.filter((p) => p.id !== post.id));

                  // Show a success alert
                  context.alertsRef?.current?.showAlert(
                    'Post was successfully deleted.',
                    'success'
                  );
                } catch (e) {
                  if (e instanceof Error) {
                    context.alertsRef?.current?.showAlert(e.message, 'error');
                  }
                }
              } catch {}
            }}
          />
        ) : (
          <div className={styles['not-found']}>
            <FontAwesomeIcon
              className={styles['not-found-icon']}
              icon={faTriangleExclamation}
            />
            <p>
              {defaultPosts.current.length !== 0
                ? movieQuotes[quoteIndex]
                : 'All posts are unavailable.'}
            </p>
          </div>
        )}
      </div>
    </Twemoji>
  );
}
