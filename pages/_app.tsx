import './_app.css';

import { NextSeo } from 'next-seo';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import Alerts from '../components/alerts';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
// import PageLoader from '../components/page-loader';
import Seo from '../components/seo';
import Vignette from '../components/vignette';

import Context from '../src/context';

export default function App({ Component, pageProps }: AppProps) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Check if user is signed in
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/validate-session');

        if (!response.ok) throw Error();
        setSignedIn((await response.json()).valid);
      } catch (err) {
        setSignedIn(false);
      }
    })();
  }, []);

  const alertsRef = useRef<Alerts>(null);

  return (
    <ThemeProvider
      themes={['dark', 'light']}
      defaultTheme='dark'
      attribute='data-theme'
    >
      <Context.Provider value={{ signedIn, setSignedIn, alertsRef }}>
        <Vignette />
        <Navbar />
        {/* <PageLoader /> */}
        <Component {...pageProps} />
        <Footer />
        <Alerts ref={alertsRef} />
      </Context.Provider>
    </ThemeProvider>
  );
}
