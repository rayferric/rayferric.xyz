import {
  sendInternalError,
  validateSession,
  validateString
} from '../../../src/common-api';
import MinIO from '../../../src/minio';
import pool from '../../../src/pg';
import { PostInfo } from '../../../src/post';
import rand from '../../../src/rand';
import { NextApiRequest, NextApiResponse } from 'next';
import { QueryResult } from 'pg';

const sciFiAdjectives = [
  'futuristic',
  'artificial',
  'cybernetic',
  'mechanical',
  'robotic',
  'electronic',
  'virtual',
  'quantum',
  'atomic',
  'galactic',
  'interdimensional',
  'extraterrestrial',
  'hyperdimensional',
  'nanotechnological',
  'genetic',
  'biomechanical',
  'cryogenic',
  'cosmic',
  'astronomical',
  'hyperspatial'
];

const cozyNouns = [
  'cookie',
  'snowman',
  'blanket',
  'fireplace',
  'tea',
  'pillow',
  'socks',
  'sweater',
  'slippers',
  'cocoa',
  'candle',
  'mug',
  'quilt',
  'plaid'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handle GET and POST requests
    // GET - Get all posts
    // POST - Create a new post
    if (req.method === 'GET') {
      let dbRes: QueryResult<any>;

      let validSession = false;
      // If the user has a session, validate it
      if (req.cookies.session) {
        if ((await validateSession(res, req.cookies.session)).terminated)
          return;
        validSession = true;
      }

      // If a search query is provided, search for posts
      const query = req.query.search;
      if (typeof query !== 'undefined') {
        // Validate the search query
        if (validateString(res, query, 'search query').terminated) return;

        // Search for posts
        const dbRes = await pool.query(
          `
            WITH ranking AS (
              SELECT id, type, unlisted, created, updated, title, description,
              (ts_rank(ts, phraseto_tsquery('english', $1))) AS rank
              FROM posts
            ) SELECT id, type, unlisted, created, updated, title, description
            FROM ranking
            WHERE rank > 0.05
            ${validSession ? '' : 'AND unlisted = false'}
            ORDER BY rank DESC
          `,
          [query]
        );
        // Respond with the posts
        res.status(200).json(dbRes.rows);
      } else {
        // Otherwise, return all posts
        const dbRes = await pool.query(
          `
            SELECT id, type, unlisted, created, updated, title, description
            FROM posts
            ${validSession ? '' : 'WHERE unlisted = false'}
            ORDER BY created DESC
          `
        );

        const posts = dbRes.rows;

        // Respond with the posts
        res.status(200).json(posts);
      }
    } else if (req.method === 'POST') {
      // Create a new post from a template

      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      // Get a list of IDs of all the posts
      const dbRes = await pool.query(
        `
          SELECT id
          FROM posts
        `
      );
      const ids = dbRes.rows.map((x: any) => x.id);

      // Generate random data for the post
      let id;
      let tries = 0;
      do {
        // If 10 generations wasn't enough to find a unique ID
        tries++;
        if (tries > 10) {
          // Use the current Unix epoch
          id = 'post-' + Date.now();
          break;
        }

        // Generate a random ID
        id =
          sciFiAdjectives[Math.floor(rand() * sciFiAdjectives.length)] +
          '-' +
          cozyNouns[Math.floor(rand() * cozyNouns.length)];

        // Try again if the ID is already taken
      } while (ids.includes(id));

      const type = 'blog';
      const title = id
        .split('-')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');
      const description =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      const content = `# ${title}\n\n${description}`;

      // Insert new record into the database
      await pool.query(
        `
        INSERT INTO posts (id, type, title, description, content)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [id, type, title, description, content]
      );

      // Insert a cover image into the storage
      try {
        await MinIO.uploadObjectFromFile(
          `posts/${id}/cover`,
          'media/default-cover.png'
        );
      } catch (e) {
        // If the upload failed, delete the post
        await pool.query(
          `
          DELETE FROM posts
          WHERE id = $1
        `,
          [id]
        );

        // Respond with an error
        sendInternalError(res, e);
        return;
      }

      // Respond with success message and the ID of the new post
      res.status(200).json({
        id,
        message: 'Successfully created a new post.'
      });
    } else {
      // Respond with 405 Method Not Allowed
      res.status(405).json({
        error: 'method-not-allowed',
        message: 'This method is not allowed.'
      });
    }
  } catch (e) {
    sendInternalError(res, e);
  }
}
