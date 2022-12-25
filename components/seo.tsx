import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import mediaFaviconIco from '../media/favicon.ico';
import mediaOgImagePng from '../media/og-image.png';

export default function Seo() {
  let { pathname, locale, defaultLocale } = useRouter();

  if (!pathname.endsWith('/')) pathname += '/';

  const description = "Ray Ferric's personal portfolio and blog.";
  const url =
    process.env.NEXT_PUBLIC_ORIGIN +
    (locale === defaultLocale ? '' : '/' + locale) +
    pathname;

  return (
    <NextSeo
      additionalLinkTags={[
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: mediaFaviconIco.src
        }
      ]}
      description={description}
      canonical={url}
      openGraph={{
        description: description,
        url: url,
        images: [
          {
            url: process.env.NEXT_PUBLIC_ORIGIN + mediaOgImagePng.src,
            width: 1280,
            height: 720,
            alt: 'Ray Ferric'
          }
        ],
        type: 'website'
      }}
      twitter={{
        cardType: 'summary_large_image'
      }}
    />
  );
}
