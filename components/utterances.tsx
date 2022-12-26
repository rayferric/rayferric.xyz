// <script src="https://utteranc.es/client.js"
//         repo="rayferric/rayferric.github.io"
//         issue-term="pathname"
//         theme="dark-blue"
//         crossorigin="anonymous"
//         async>
// </script>
import { useEffect, useRef } from 'react';

export default function Utterances() {
  const ref = useRef<HTMLDivElement>(null);
  const added = useRef(false);

  useEffect(() => {
    if (added.current) return;

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'dark-blue');
    script.setAttribute('repo', 'rayferric/rayferric.xyz');
    script.crossOrigin = 'anonymous';
    script.async = true;
    ref.current?.appendChild(script);

    added.current = true;
  }, []);

  return <div ref={ref} />;
}
