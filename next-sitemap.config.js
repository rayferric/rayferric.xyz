/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_ORIGIN,
  generateRobotsTxt: true,
  exclude: ['/admin', '/posts/sitemap.xml'],
  robotsTxtOptions: {
    additionalSitemaps: [`${process.env.NEXT_PUBLIC_ORIGIN}/posts/sitemap.xml`]
  }
};

module.exports = config;
