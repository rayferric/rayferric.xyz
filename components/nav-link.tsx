import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  href: string;
  exact?: boolean;
  [props: string]: unknown;
}

export default function NavLink({
  children,
  href,
  exact = true,
  ...props
}: Props) {
  let { pathname } = useRouter();

  if (!pathname.endsWith('/')) pathname += '/';

  if (exact ? pathname === href : pathname.startsWith(href))
    props.className += ' active';

  return (
    <Link legacyBehavior href={href}>
      <a {...props}>{children}</a>
    </Link>
  );
}
