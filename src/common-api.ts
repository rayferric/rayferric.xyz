import pool from './pg';
import { NextApiRequest, NextApiResponse } from 'next';

// fieldName should be just as it would appear in the middle of a sentence
export function validateString(
  res: NextApiResponse,
  str: any,
  fieldName = 'field'
) {
  const fieldId = fieldName.toLowerCase().replaceAll(' ', '-');
  fieldName = fieldName[0].toUpperCase() + fieldName.slice(1);

  if (!(typeof str === 'string')) {
    res.status(400).json({
      error: fieldId + '-not-a-string',
      message: fieldName + ' is not a string.'
    });
    return { terminated: true };
  }

  if (str.length === 0) {
    res
      .status(400)
      .json({ error: 'empty-' + fieldId, message: fieldName + ' is empty.' });
    return { terminated: true };
  }

  if (str.length > 65536 * 10) {
    res.status(400).json({
      error: fieldId + '-too-long',
      message: fieldName + ' is too long.'
    });
    return { terminated: true };
  }

  return { terminated: false };
}

export function validateBoolean(
  res: NextApiResponse,
  value: any,
  fieldName = 'field'
) {
  const fieldId = fieldName.toLowerCase().replaceAll(' ', '-');
  fieldName = fieldName[0].toUpperCase() + fieldName.slice(1);

  if (!(typeof value === 'boolean')) {
    res.status(400).json({
      error: fieldId + '-not-a-boolean',
      message: fieldName + ' is not a boolean.'
    });
    return { terminated: true };
  }

  return { terminated: false };
}

// Validates password and responds with 200 if invalid
// payloadIfInvalid is the payload to respond with if the password is invalid
// Password being invalid is not considered an error
export async function validatePassword(res: NextApiResponse, password: any) {
  if (validateString(res, password, 'password').terminated)
    return { terminated: true };

  // Find matching users
  const dbRes = await pool.query(
    `
      SELECT password_hash
      FROM globals
      WHERE password_hash = encode(sha256(decode($1, 'escape')), 'hex')
    `,
    [password]
  );

  if (dbRes.rows.length === 0) return { terminated: false, valid: false };

  return { terminated: false, valid: true };
}

const sessionLifetime = 86400; // seconds

export function setSessionCookie(res: NextApiResponse, session: string) {
  res.setHeader(
    'Set-Cookie',
    `session=${session}; Path=/; SameSite=Lax; HttpOnly; Max-Age=${sessionLifetime}`
  );
}

export function removeSessionCookie(res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `session=; Path=/; SameSite=Lax; HttpOnly; Max-Age=0`
  );
}

// Deletes expired sessions and validates the session against the database
// By default responds with 401 if invalid
export async function validateSession(
  res: NextApiResponse,
  session: any,
  errorIfInvalid = true
) {
  if (validateString(res, session, 'session').terminated)
    return { terminated: true };

  // Delete old sessions
  await pool.query(
    `
      DELETE FROM sessions
      WHERE created < NOW() - INTERVAL '${sessionLifetime} seconds'
    `
  );

  // Attempt to find the session
  const dbRes = await pool.query(
    `
      SELECT id
      FROM sessions
      WHERE id = $1
    `,
    [session]
  );

  // If the session is invalid
  if (dbRes.rows.length === 0) {
    // Remove the session cookie
    removeSessionCookie(res);

    if (errorIfInvalid) {
      // If the function is supposed to respond with an error, do so
      res.status(401).json({
        error: 'invalid-session',
        message: 'The session is invalid.'
      });
      return { terminated: true };
    } else {
      // Otherwise, return valid = false
      return { terminated: false, valid: false };
    }
  }

  // Return valid = true
  return { terminated: false, valid: true };
}

export function sendInternalError(res: NextApiResponse, e: any) {
  // This was unexpected
  res.status(500).json({
    error: 'internal-server-error',
    message: 'An internal server error occurred.'
  });

  if (e instanceof Error) console.error(e.message);
}
