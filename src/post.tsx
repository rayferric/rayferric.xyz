import {
  faMugHot,
  faTrophy,
  faTerminal,
  faPalette,
  faSquareRootVariable,
  faExplosion,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

export const postTypes = [
  'blog',
  'milestone',
  'computer-graphics',
  'computer-science',
  'digital-art',
  'mathematics'
] as const;
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
  'blog': {
    name: 'Blog',
    icon: faMugHot
  },
  'milestone': {
    name: 'Milestone',
    icon: faTrophy
  },
  'computer-graphics': {
    name: 'Computer Graphics',
    icon: faExplosion
  },
  'computer-science': {
    name: 'Computer Science',
    icon: faTerminal
  },
  'digital-art': {
    name: 'Digital Art',
    icon: faPalette
  },
  'mathematics': {
    name: 'Mathematics',
    icon: faSquareRootVariable
  }
};

export function getPostName(type: PostType) {
  return postTypeVisuals[type].name;
}

export function getPostIcon(type: PostType) {
  return postTypeVisuals[type].icon;
}
