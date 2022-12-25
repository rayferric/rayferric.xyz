import styles from './markdown.module.css';

import { ImageViewer } from './image-viewer';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeProps, SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import glsl from 'react-syntax-highlighter/dist/cjs/languages/prism/glsl';
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';

SyntaxHighlighter.registerLanguage('glsl', glsl);

type CopyButtonProps = {
  code: string;
};

class CopyButton extends React.Component<CopyButtonProps> {
  state = {
    activated: false,
    visible: true
  };

  render() {
    return (
      <div
        className={styles['code-copy'] + (this.state.visible ? '' : ' hidden')}
      >
        <FontAwesomeIcon
          className={
            styles['code-copy-icon'] +
            (this.state.activated ? ' activated' : '')
          }
          icon={faCopy}
          onClick={async (event) => {
            event.stopPropagation();
            try {
              await navigator.clipboard.writeText(this.props.code);
              this.setState({ activated: true });
              setTimeout(() => this.setState({ activated: false }), 1000);
            } catch {}
          }}
          onMouseDown={(event) => event.stopPropagation()}
        />
      </div>
    );
  }

  hideTemporarily() {
    if (this.timeout) clearTimeout(this.timeout);

    this.setState({ visible: false });
    this.timeout = setTimeout(() => this.setState({ visible: true }), 1000);
  }

  timeout: NodeJS.Timeout | null = null;
}

type Props = {
  children: string;
};

function MarkdownCodeComponent({ className, children, inline }: CodeProps) {
  const ref = useRef<CopyButton>(null);

  const match = /language-(\w+)/.exec(className || '');
  if (inline || !match || typeof children[0] !== 'string')
    return <code className={className}>{children}</code>;

  return (
    <div
      className={styles['code']}
      onClick={(event) => {
        event.stopPropagation();
        ref.current?.hideTemporarily();
      }}
    >
      <CopyButton ref={ref} code={(children as string[])[0]} />
      <SyntaxHighlighter style={materialDark} language={match[1]}>
        {children as string[]}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownPreComponent({ children }: any) {
  // Add a click handler that passes the click down to the code element
  // This is necessary to allow the user to click on the border of the code block
  const ref = useRef<HTMLPreElement>(null);
  const mouseDown = useRef(false);
  return (
    <pre
      ref={ref}
      onClick={() => {
        const child = ref.current?.children[0];
        if (child instanceof HTMLElement) child.click();
      }}
      onTouchMove={() => {
        const child = ref.current?.children[0];
        if (child instanceof HTMLElement) child.click();
      }}
      onMouseDown={() => {
        const child = ref.current?.children[0];
        if (child instanceof HTMLElement) child.click();
        mouseDown.current = true;
      }}
      onMouseUp={() => {
        mouseDown.current = false;
      }}
      onMouseMove={() => {
        if (mouseDown.current) {
          const child = ref.current?.children[0];
          if (child instanceof HTMLElement) child.click();
        }
      }}
    >
      {children}
    </pre>
  );
}

function MarkdownHeadingComponent({ heading }: { heading: JSX.Element }) {
  const children = heading.props.children;
  if (typeof children[0] !== 'string') return <h2>{children}</h2>;

  const id = children[0].toLowerCase().replaceAll(' ', '-');

  return (
    <div
      className={styles['anchor']}
      id={id}
      onClick={() => {
        document.getElementById(id)!.scrollIntoView({
          behavior: 'smooth'
        });
        history.pushState({}, '', '#' + id);
      }}
    >
      {heading}
      <FontAwesomeIcon className={styles['anchor-icon']} icon={faLink} />
    </div>
  );
}

const markdownComponents: Partial<
  Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
> = {
  // Code highlighting
  code: (props) => <MarkdownCodeComponent {...props} />,
  pre: (props) => <MarkdownPreComponent {...props} />,
  // Headings
  h1: ({ children }) => (
    <MarkdownHeadingComponent heading={<h1>{children}</h1>} />
  ),
  h2: ({ children }) => (
    <MarkdownHeadingComponent heading={<h2>{children}</h2>} />
  ),
  h3: ({ children }) => (
    <MarkdownHeadingComponent heading={<h3>{children}</h3>} />
  ),
  img: (props) => <ImageViewer {...props} />
};

export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown
      className={styles['markdown']}
      rehypePlugins={[rehypeRaw]}
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
