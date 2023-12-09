import styles from './index.module.css';

import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NextSeo } from 'next-seo';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Twemoji from 'react-twemoji';

import { Button } from '../components/button';
import Dropdown from '../components/dropdown';
import HelloWorld from '../components/hello-world';
import PostGrid from '../components/post-grid';
import Seo from '../components/seo';

import Context from '../src/context';
import { getPostIcon, PostInfo } from '../src/post';

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

  // const posts = await getFeatured(false);

  const posts = await (
    await fetch(`http://localhost:${process.env.PORT}/api/featured`)
  ).json();

  return {
    props: { defaultPosts: posts },
    revalidate: 60
  };
}

export default function Hello({ defaultPosts }: Props) {
  const context = useContext(Context);
  const [posts, setPosts] = useState(defaultPosts);
  const [adminAllPosts, setAdminAllPosts] = useState<PostInfo[]>([]);

  // Fetch unlisted posts if signed in
  useEffect(() => {
    if (context.signedIn) {
      (async () => {
        let response = await fetch('/api/featured');
        const posts: PostInfo[] = await response.json();
        setPosts(posts);

        // Additionally fetch all posts for the admin dropdown
        response = await fetch('/api/posts');
        let allPosts: PostInfo[] = await response.json();
        allPosts = allPosts.filter(
          (post) => !posts.some((p) => p.id === post.id)
        );
        setAdminAllPosts(allPosts);
      })();
    }
  }, [context.signedIn]);

  const adminAddPostDropdownRef = useRef<Dropdown>(null);

  return (
    <Twemoji options={{ className: 'twemoji' }}>
      <Seo />
      <div className={styles['hello']}>
        <NextSeo title='Ray Ferric' />
        <HelloWorld>Take a look at some of my featured posts:</HelloWorld>
        {context.signedIn && (
          <div className={styles['admin-add-post']}>
            <Dropdown
              ref={adminAddPostDropdownRef}
              className={styles['admin-add-post-dropdown']}
              placeholder='Add a featured post...'
              items={adminAllPosts.map((post) => ({
                value: post.title,
                icon: getPostIcon(post.type)
              }))}
            />
            <Button
              className={styles['admin-add-post-button']}
              onClick={async () => {
                const selection =
                  adminAddPostDropdownRef.current?.getSelection();

                if (selection === undefined || selection === -1) {
                  context.alertsRef?.current?.showAlert(
                    'Please select a post to add.',
                    'error'
                  );
                  return;
                }

                try {
                  // Add the post to the front of the featured list and request to update the list
                  const newPosts = [adminAllPosts[selection], ...posts];
                  const response = await fetch(`/api/featured`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      posts: newPosts.map((post) => post.id)
                    })
                  });

                  // Check for errors
                  if (!response.ok)
                    throw new Error((await response.json()).message);

                  // Remove the post from the dropdown
                  setAdminAllPosts(
                    adminAllPosts.filter((_, i) => i !== selection)
                  );

                  // Set displayed posts
                  setPosts(newPosts);

                  // Clear the dropdown
                  adminAddPostDropdownRef.current?.resetSelection();

                  // Send a success message
                  context.alertsRef?.current?.showAlert(
                    `"${adminAllPosts[selection].title}" was added.`,
                    'success'
                  );
                } catch (e) {
                  if (e instanceof Error) {
                    context.alertsRef?.current?.showAlert(e.message, 'error');
                  }
                }
              }}
            >
              <FontAwesomeIcon
                className={styles['admin-add-post-button-icon']}
                icon={faFloppyDisk}
              />
            </Button>
          </div>
        )}
        <PostGrid
          posts={posts}
          onAdminReorder={async (post, dir) => {
            const index = posts.findIndex((p) => p.id === post.id);
            if (index === -1) return;

            // Reorder the posts
            const newPosts = [...posts];
            newPosts.splice(index, 1);
            let newIndex = index + (dir == 'next' ? 1 : -1);
            if (newIndex > newPosts.length) newIndex = 0;
            else if (newIndex < 0) newIndex = newPosts.length;
            newPosts.splice(newIndex, 0, post);

            // Send a request to update the list
            try {
              const response = await fetch(`/api/featured`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  posts: newPosts.map((post) => post.id)
                })
              });

              // Check for errors
              if (!response.ok)
                throw new Error((await response.json()).message);

              // Set displayed posts
              setPosts(newPosts);
            } catch (e) {
              if (e instanceof Error) {
                context.alertsRef?.current?.showAlert(e.message, 'error');
              }
            }
          }}
          onAdminDelete={async (post) => {
            try {
              // Ask for confirmation
              await context.alertsRef?.current?.confirmBox(
                `Are you sure you want to hide "${post.title}" from the featured list? It will remain available in the "Posts" tab.`
              );

              try {
                // Hide the post from the featured list and request to update the list
                const newPosts = posts.filter((p) => p.id !== post.id);
                const response = await fetch(`/api/featured`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    posts: newPosts.map((post) => post.id)
                  })
                });

                // Check for errors
                if (!response.ok)
                  throw new Error((await response.json()).message);

                // Add the post to the dropdown
                setAdminAllPosts([...adminAllPosts, post]);

                // Set displayed posts
                setPosts(newPosts);

                // Send a success message
                context.alertsRef?.current?.showAlert(
                  `"${post.title}" was hidden.`,
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
      </div>
    </Twemoji>
  );
}
