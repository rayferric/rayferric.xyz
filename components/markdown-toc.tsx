import styles from './markdown-toc.module.css';

import { faBook } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import glsl from 'react-syntax-highlighter/dist/cjs/languages/prism/glsl';

SyntaxHighlighter.registerLanguage('glsl', glsl);

type Props = {
  children: string;
};

export default function MarkdownTOC({ children }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const matches = useMemo(
    () => [...children.matchAll(/^(#{1,6})\s*(.*)$/gm)],
    [children]
  );

  useEffect(() => {
    const listener = () => {
      let activeId: string | null = null;
      let activeOffset = -100000;
      for (const match of matches) {
        const id = match[2].trim().toLowerCase().replaceAll(' ', '-');
        const element = document.getElementById(id);
        if (!element) continue;
        const offset = element.getBoundingClientRect().top;

        if (offset < 100 && offset > activeOffset) {
          activeId = id;
          activeOffset = offset;
        }
      }

      setActiveId(activeId);
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, [matches]);

  return (
    <div className={styles['markdown-toc']}>
      <div className={styles['table']}>
        <div className={styles['table-header']}>
          Contents
          <FontAwesomeIcon
            className={styles['table-header-icon']}
            icon={faBook}
          />
        </div>
        {matches.map((match, i) => {
          const depth = match[1].length;
          const title = match[2].trim();
          const id = title.toLowerCase().replaceAll(' ', '-');

          return (
            <div
              className={
                styles['table-item'] + (activeId === id ? ' active' : '')
              }
              key={i}
              style={{ marginLeft: `${depth * 20}px` }}
              onClick={() => {
                document.getElementById(id)!.scrollIntoView({
                  behavior: 'smooth'
                });
                history.pushState({}, '', '#' + id);
              }}
            >
              {title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
