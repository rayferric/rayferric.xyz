import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import mediaFaviconIco from '../media/favicon.ico';
import mediaOgImagePng from '../media/og-image.png';

type Props = {
  title?: string;
  description?: string;
  ogImage?: string;
};

export default function Seo({
  title = 'Ray Ferric',
  description = "Ray Ferric's personal portfolio and blog.",
  ogImage = mediaOgImagePng.src
}: Props) {
  let { pathname, locale, defaultLocale } = useRouter();

  // Remove trailing slash
  if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);

  const url =
    process.env.NEXT_PUBLIC_ORIGIN +
    (locale === defaultLocale ? '' : '/' + locale) +
    pathname;

  return (
    <NextSeo
      title={title}
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
            url: process.env.NEXT_PUBLIC_ORIGIN + ogImage,
            width: 1280,
            height: 720,
            alt: title
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
