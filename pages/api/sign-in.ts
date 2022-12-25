import {
  sendInternalError,
  setSessionCookie,
  validatePassword
} from '../../src/common-api';
import pool from '../../src/pg';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify that the request method is POST
    if (req.method !== 'POST') {
      res.status(405).json({
        error: 'method-not-allowed',
        message: 'Only POST requests are supported.'
      });
      return;
    }

    // Validate the password
    const result = await validatePassword(res, req.body.password);
    if (result.terminated) return;

    // If the password is incorrect, return 200 with signedIn = false
    if (!result.valid) {
      res.status(200).json({
        signedIn: false,
        message: 'Incorrect password.'
      });
      return;
    }

    // Initialize a new session
    const dbRes = await pool.query(
      `
      INSERT INTO sessions DEFAULT VALUES RETURNING id
    `
    );
    const session = dbRes.rows[0].id;

    // Set the session cookie, then respond with 200 and signedIn = true
    setSessionCookie(res, session);
    res
      .status(200)
      .json({ signedIn: true, message: 'Successfully signed in.' });
  } catch (e) {
    sendInternalError(res, e);
  }
}
