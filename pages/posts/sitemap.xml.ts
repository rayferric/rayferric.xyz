import { PostInfo } from '../../src/post';
import { GetServerSidePropsContext } from 'next';
import { getServerSideSitemap } from 'next-sitemap';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const posts: PostInfo[] = await (
    await fetch(`http://localhost:${process.env.PORT}/api/posts`)
  ).json();

  const pages = posts.map((post) => ({
    // Remember to escape id to be usable as a XML string
    loc: `${process.env.NEXT_PUBLIC_ORIGIN}/posts/${post.id.replaceAll(
      '&',
      '&amp;'
    )}`,
    lastmod: post.updated
  }));

  return getServerSideSitemap(context, pages);
}

export default function SiteMap() {}
