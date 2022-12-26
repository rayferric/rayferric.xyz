import {
  sendInternalError,
  validateSession,
  validateString
} from '../../../../src/common-api';
import MinIO from '../../../../src/minio';
import { NextApiRequest, NextApiResponse } from 'next';

// Increase the size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
};

// Parse and send/log a MinIO error
function sendStorageError(res: NextApiResponse, error: any) {
  if ((error as Error).message === 'The specified key does not exist.')
    res
      .status(404)
      .json({ error: 'file-not-found', message: 'That file does not exist.' });
  else {
    res
      .status(500)
      .json({ error: 'storage-error', message: 'Unknown storage error.' });
    console.error(error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const postId = req.query.id;
    const file = req.query.file;

    // Validate the post ID and the file name
    if (validateString(res, postId, 'post ID').terminated) return;
    if (validateString(res, file, 'file ID').terminated) return;

    // Handle GET, DELETE, PUT and POST
    // GET - Retrieve the file
    // DELETE - Delete the file
    // PUT - Upload a file
    // POST - Rename a file
    if (req.method === 'GET') {
      // Retrieve the file

      try {
        const path = `posts/${postId}/${file}`;

        // State the object
        const stat = await MinIO.statObject(path);

        // Handle If-None-Match to prevent re-downloading the file
        if (req.headers['if-none-match'] === stat.etag) {
          res.status(304).end();
          return;
        }

        // Get the object from the bucket
        const object = await MinIO.getObjectAsStream(path);

        // Set the ETag header for caching
        res.setHeader('ETag', stat.etag);

        // Set Cache-Control to 1 week
        res.setHeader('Cache-Control', 'public, max-age=604800');

        // Pipe the object data to the response
        res.status(200);
        object.pipe(res);
      } catch (error) {
        // If there was an error, send it or log to the console
        sendStorageError(res, error);
      }
    } else if (req.method === 'DELETE') {
      // Delete the file

      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      try {
        // Delete the object from the bucket
        await MinIO.removeObject(`posts/${postId}/${file}`);

        // Respond with a success message
        res.status(200).json({ message: 'File was deleted.' });
      } catch (error) {
        // If there was an error, send it or log to the console
        sendStorageError(res, error);
      }
    } else if (req.method === 'PUT') {
      // Upload a file

      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      try {
        // Decode base64
        req.body = Buffer.from(req.body.split(',')[1], 'base64');

        // Upload the file to the bucket
        await MinIO.uploadObject(`posts/${postId}/${file}`, req.body);

        // Respond with a success message
        res.status(200).json({ message: 'File was uploaded.' });
      } catch (error) {
        // If there was an error, send it or log to the console
        sendStorageError(res, error);
      }
    } else if (req.method === 'POST') {
      // Rename file

      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      // Validate the new file name
      const newName = req.body.name;
      if (validateString(res, newName, 'new file name').terminated) return;

      try {
        // Rename the file
        await MinIO.moveObject(
          `posts/${postId}/${file}`,
          `posts/${postId}/${newName}`
        );

        // Respond with a success message
        res.status(200).json({ message: 'File was renamed.' });
      } catch (error) {
        // If there was an error, send it or log to the console
        sendStorageError(res, error);
      }
    } else {
      res.status(405).json({
        error: 'method-not-allowed',
        message: 'This request method is unsupported.'
      });
    }
  } catch (e) {
    sendInternalError(res, e);
  }
}
