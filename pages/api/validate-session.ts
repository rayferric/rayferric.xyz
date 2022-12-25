import { sendInternalError, validateSession } from '../../src/common-api';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify that the request method is GET
    if (req.method !== 'GET') {
      res.status(405).json({
        error: 'method-not-allowed',
        message: 'Only GET requests are supported.'
      });
      return;
    }

    const session = req.cookies.session;

    // If the session is not provided, return 200 with valid = false
    if (!session) {
      res
        .status(200)
        .json({ valid: false, message: 'No session was provided.' });
      return;
    }

    // Validate the session without responding with 401
    const result = await validateSession(res, session, false);
    if (result.terminated) return;

    // If the session is invalid, return 200 with valid = false
    if (!result.valid) {
      res.status(200).json({ valid: false, message: 'Session is invalid.' });
      return;
    }

    // Respond with 200 and valid = true
    res.status(200).json({ valid: true, message: 'Session is valid.' });
  } catch (e) {
    sendInternalError(res, e);
  }
}
