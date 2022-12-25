import { sendInternalError, validateSession } from '../../src/common-api';
import pool from '../../src/pg';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handle GET and POST requests
    // GET - Return featured posts
    // POST - Set featured posts
    if (req.method === 'GET') {
      // Return featured posts

      let validSession = false;
      // If the user has a session, validate it
      if (req.cookies.session) {
        if ((await validateSession(res, req.cookies.session)).terminated)
          return;
        validSession = true;
      }

      // Find featured posts
      const dbRes = await pool.query(
        `
          WITH featured AS (
            SELECT unnest(featured_posts) AS featured_id
            FROM globals
          ) SELECT id, type, unlisted, created, updated, title, description
          FROM posts
          INNER JOIN featured ON id = featured_id
          ${validSession ? '' : 'WHERE unlisted = false'}
        `
      );

      const featured = dbRes.rows;

      // Respond with featured posts
      res.status(200).json(featured);
    } else if (req.method === 'POST') {
      // Set featured posts

      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      // Validate the new array of featured posts
      const { posts } = req.body;
      if (
        !posts ||
        !Array.isArray(posts) ||
        !posts.every((x) => typeof x === 'string')
      ) {
        res.status(400).json({
          error: 'bad-request',
          message:
            'Featured posts were either not provided or their format was invalid.'
        });
        return;
      }

      // Update featured posts
      await pool.query(
        `
          UPDATE globals
          SET featured_posts = $1
        `,
        [posts]
      );

      // Respond with success
      res.status(200).json({
        message: 'Successfully updated featured posts.'
      });
    } else {
      // Other request methods are unsupported
      res.status(405).json({
        error: 'method-not-allowed',
        message: 'This request method is unsupported.'
      });
    }
  } catch (e) {
    sendInternalError(res, e);
  }
}
