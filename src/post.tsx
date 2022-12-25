import { faBook, faMugHot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const postTypes = ['blog', 'library'] as const;
type PostType = typeof postTypes[number];

export type PostInfo = {
  id: string;
  type: PostType;
  unlisted: boolean;
  created: string;
  updated: string;
  title: string;
  description: string;
};

export type Post = PostInfo & {
  content: string;
};

const postTypeVisuals = {
  blog: {
    name: 'Blog',
    icon: faMugHot
  },
  library: {
    name: 'Library',
    icon: faBook
  }
};

export function getPostName(type: PostType) {
  return postTypeVisuals[type].name;
}

export function getPostIcon(type: PostType) {
  return postTypeVisuals[type].icon;
}
