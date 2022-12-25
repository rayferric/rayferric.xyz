import {
  sendInternalError,
  validatePassword,
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

    // Validate the old password
    const result = await validatePassword(res, req.body.oldPassword);
    if (result.terminated) return;

    // If the old password is incorrect, return 200 with passwordChanged = false
    if (!result.valid) {
      res.status(200).json({
        passwordChanged: false,
        message: 'Incorrect password.'
      });
      return;
    }

    // Validate the new password
    if (validateString(res, req.body.newPassword, 'new password').terminated)
      return;

    // Change the password
    await pool.query(
      `
      UPDATE globals
      SET password_hash = encode(sha256(decode($1, 'escape')), 'hex')
    `,
      [req.body.newPassword]
    );

    // Delete all sessions
    await pool.query(
      `
      DELETE FROM sessions
    `
    );

    // Respond with 200 and passwordChanged = true
    res.status(200).json({
      passwordChanged: true,
      message: 'Successfully changed the password.'
    });
  } catch (e) {
    sendInternalError(res, e);
  }
}
