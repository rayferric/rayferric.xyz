import {
  removeSessionCookie,
  sendInternalError,
  validateSession,
  validateString
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

    const session = req.cookies.session;

    // Validate the session string
    if (validateString(res, session, 'session').terminated) return;

    // Delete the session
    const dbRes = await pool.query(
      `
            DELETE FROM sessions
            WHERE id = $1
            RETURNING id
        `,
      [session]
    );

    // Remove the session cookie
    removeSessionCookie(res);

    // If the session was not found, return 200 with signedOut = false
    if (dbRes.rows.length === 0) {
      res
        .status(200)
        .json({ signedOut: false, message: 'Session was not found.' });
      return;
    }

    // Respond with 200 and signedOut = true
    res
      .status(200)
      .json({ signedOut: true, message: 'Successfully signed out.' });
  } catch (e) {
    sendInternalError(res, e);
  }
}
