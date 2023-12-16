import './_app.css';

import type { AppProps } from 'next/app';
import { useEffect, useRef, useState } from 'react';

import Alerts from '../components/alerts';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import PageLoader from '../components/page-loader';
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
    <Context.Provider value={{ signedIn, setSignedIn, alertsRef }}>
      <Vignette />
      <PageLoader />
      <Alerts ref={alertsRef} />
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </Context.Provider>
  );
}
