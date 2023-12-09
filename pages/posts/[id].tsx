import styles from './[id].module.css';

import Markdown from '../../components/markdown';
import MarkdownTOC from '../../components/markdown-toc';
import PostEditor from '../../components/post-editor';
import Seo from '../../components/seo';
import StorageEditor from '../../components/storage-editor';
import Utterances from '../../components/utterances';
import Context from '../../src/context';
import { PostInfo, Post, getPostName, getPostIcon } from '../../src/post';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCalendar, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'highlight.js/styles/rainbow.css';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { CircleLoader } from 'react-spinners';
import Twemoji from 'react-twemoji';

type Params = {
  id: string;
};

type Props = {
  defaultPost: Post;
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps(context: GetStaticPropsContext<Params>) {
  // const post = await getPost(context.params!.id);
  const post = await (
    await fetch(
      `http://localhost:${process.env.PORT}/api/posts/${context.params?.id}`
    )
  ).json();

  return {
    props: { defaultPost: post },
    revalidate: 60 // Regenerate the page every minute
  };
}

export default function PostView({ defaultPost }: Props) {
  const router = useRouter();
  const context = useContext(Context);
  const [post, setPost] = useState(defaultPost);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [showStorageEditor, setShowStorageEditor] = useState(false);

  if (router.isFallback) {
    return (
      <div className={styles['view-loader']}>
        <CircleLoader color='#bb4f4e' size={100} />
      </div>
    );
  }

  const coverUrl = `/api/posts/${post.id}/cover`;
  const created = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long'
  }).format(new Date(post.created));
  const updated = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long'
  }).format(new Date(post.updated));
  const coverStyle = { backgroundImage: `url('${coverUrl}')` };

  // Replace all post:// tokens with the actual URL
  const content = post.content.replaceAll('post://', `/api/posts/${post.id}/`);

  return (
    <div>
      <Seo
        title={'Ray Ferric | ' + post.title}
        description={post.description}
        ogImage={coverUrl}
      />
      <Twemoji options={{ className: 'twemoji' }}>
        <div className={styles['view-cover']} style={coverStyle} />
        <div className={styles['view-info']}>
          <div className={styles['view-info-content']}>
            {context.signedIn && (
              <div className={styles['admin-edit']}>
                <FontAwesomeIcon
                  className={styles['admin-edit-icon']}
                  icon={faPenToSquare}
                  onClick={() => setShowPostEditor(true)}
                />
                <FontAwesomeIcon
                  className={styles['admin-edit-icon']}
                  icon={faDatabase}
                  onClick={() => setShowStorageEditor(true)}
                />
                <FontAwesomeIcon
                  className={styles['admin-edit-icon']}
                  icon={post.unlisted ? faEyeSlash : faEye}
                  onClick={async () => {
                    try {
                      const newPost = {
                        ...post,
                        unlisted: !post.unlisted
                      };

                      const response = await fetch(`/api/posts/${post.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newPost)
                      });

                      if (!response.ok) throw Error(await response.json());

                      setPost(newPost);

                      context.alertsRef?.current?.showAlert(
                        `Post was successfully ${
                          post.unlisted ? '' : 'un'
                        }published.`,
                        'success'
                      );
                    } catch (e) {
                      if (e instanceof Error) {
                        context.alertsRef?.current?.showAlert(
                          e.message,
                          'error'
                        );
                      }
                    }
                  }}
                />
                <PostEditor
                  shown={showPostEditor}
                  post={post}
                  onSave={async (newPost) => {
                    try {
                      const response = await fetch(`/api/posts/${post.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newPost)
                      });

                      if (!response.ok) throw Error(await response.json());

                      setShowPostEditor(false);
                      setPost(newPost);
                      history.pushState({}, '', '/posts/' + newPost.id);

                      context.alertsRef?.current?.showAlert(
                        'Post was successfully updated.',
                        'success'
                      );
                    } catch (e) {
                      if (e instanceof Error) {
                        context.alertsRef?.current?.showAlert(
                          e.message,
                          'error'
                        );
                      }
                    }
                  }}
                  onCancel={() => setShowPostEditor(false)}
                />
                <StorageEditor
                  shown={showStorageEditor}
                  postId={post.id}
                  onFinish={() => setShowStorageEditor(false)}
                />
              </div>
            )}
            <p className={styles['view-info-content-title']}>{post.title}</p>
            <p className={styles['view-info-content-description']}>
              {post.description}
            </p>
            <div className={styles['view-info-content-meta']}>
              <div className={styles['view-info-content-meta-group']}>
                {
                  <FontAwesomeIcon
                    className={styles['view-info-content-meta-icon']}
                    icon={getPostIcon(post.type)}
                  />
                }
                &nbsp; {getPostName(post.type)} &nbsp;&nbsp;&nbsp;{' '}
              </div>
              <div className={styles['view-info-content-meta-group']}>
                <FontAwesomeIcon
                  className={styles['view-info-content-meta-icon']}
                  icon={faCalendar}
                />{' '}
                &nbsp; {created} &nbsp;&nbsp;&nbsp;{' '}
              </div>
              <div className={styles['view-info-content-meta-group']}>
                <FontAwesomeIcon
                  className={styles['view-info-content-meta-icon']}
                  icon={faPenToSquare}
                />{' '}
                &nbsp; {updated}
              </div>
            </div>
          </div>
        </div>
        <div className={styles['view-display']}>
          <div className={styles['view-display-content']}>
            <Markdown>{content}</Markdown>
          </div>
          <div className={styles['view-display-toc']}>
            <MarkdownTOC>{content}</MarkdownTOC>
          </div>
        </div>
        {typeof window === 'undefined' ? <div /> : <Utterances />}
      </Twemoji>
    </div>
  );
}
