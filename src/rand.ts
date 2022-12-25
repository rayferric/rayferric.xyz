import MersenneTwister from 'mersenne-twister';

// Because Math.random() is shit

const gen = new MersenneTwister(Date.now());

export default function rand() {
  return gen.random();
}
