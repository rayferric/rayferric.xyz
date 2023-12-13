import {
  sendInternalError,
  validateBoolean,
  validateSession,
  validateString
} from '../../../../src/common-api';
import MinIO from '../../../../src/minio';
import pool from '../../../../src/pg';
import { Post, postTypes } from '../../../../src/post';
import { request } from 'http';
import { BucketItem } from 'minio';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validate the post ID
    const id = req.query.id;
    if (validateString(res, id, 'post ID').terminated) return;

    // Handle GET, POST and DELETE
    // GET - Get post data or file list
    // POST - Modify the post
    // DELETE - Delete the post
    if (req.method === 'GET') {
      // If the "files" parameter is not provided, respond with post data
      if (typeof req.query.files === 'undefined') {
        // Respond with post data

        // Find the post
        const dbRes = await pool.query(
          'SELECT id, type, unlisted, created, updated, title, description, content FROM posts WHERE id = $1',
          [id]
        );

        // If the post does not exist, respond with an error
        if (dbRes.rows.length === 0) {
          res.status(404).json({
            error: 'does-not-exist',
            message: 'This post does not exist.'
          });
          return;
        }

        // TODO: Make it work with pre-rendering. This is a temporary fix.
        // if (post.unlisted) {
        //   let validSession = false;
        //   // If the user has a session, validate it
        //   if (req.cookies.session) {
        //     if ((await validateSession(res, req.cookies.session)).terminated)
        //       return;
        //     validSession = true;
        //   }

        //   // If the session is invalid, act as if the post did not exist
        //   if (!validSession) {
        //     res.status(404).json({
        //       error: 'does-not-exist',
        //       message: 'This post does not exist.'
        //     });
        //     return;
        //   }
        // }

        // Respond with the post data
        res.status(200).json(dbRes.rows[0]);
      } else {
        // Respond with file list

        // Validate the session
        if ((await validateSession(res, req.cookies.session)).terminated)
          return;

        // Find the list of files
        const objects = await MinIO.listObjects(`posts/${id}`);

        // Respond with the file list
        res.json(
          objects.map((obj: BucketItem) => ({
            name: obj.name.split('/').pop(),
            size: obj.size,
            modified: obj.lastModified
          }))
        );
      }
    } else if (req.method === 'POST') {
      // POST and not PUT because potential ID modification causes side effects

      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      // Extract post data from the body
      const newId = req.body.id;
      const type = req.body.type;
      const unlisted = req.body.unlisted;
      const title = req.body.title;
      const description = req.body.description;
      const content = req.body.content;

      // Validate the data
      if (validateString(res, newId, 'new post ID').terminated) return;
      if (validateString(res, type, 'post type').terminated) return;
      if (validateBoolean(res, unlisted, 'post unlisted').terminated) return;
      if (validateString(res, title, 'post title').terminated) return;
      if (validateString(res, description, 'post description').terminated)
        return;
      if (validateString(res, content, 'post content').terminated) return;

      // Validate the post type
      if (!postTypes.includes(type)) {
        res.status(400).json({
          error: 'invalid-type',
          message: `Post type "${type}" is invalid.`
        });
        return;
      }

      // Update the post
      const dbRes = await pool.query(
        `
          UPDATE posts SET id = $1, type = $2, unlisted = $3, updated = NOW(), title = $4, description = $5, content = $6
          WHERE id = $7
          RETURNING id
        `,
        [newId, type, unlisted, title, description, content, id]
      );

      // If the post does not exist, respond with an error
      if (dbRes.rows.length === 0) {
        res.status(404).json({
          error: 'does-not-exist',
          message: 'This post does not exist.'
        });
        return;
      }

      // If the ID was changed, update the featured table and rename files
      if (newId !== id) {
        // Update the featured table
        await pool.query(
          `
          UPDATE globals
          SET featured_posts = array_replace(featured_posts, $1, $2)
        `,
          [id, newId]
        );

        // Rename files in the MinIO bucket

        // List all objects in the bucket
        const objects = await MinIO.listObjects(`posts/${id}`);

        // Rename each object
        const promises = objects.map((obj) => {
          const name = obj.name;
          const newName = name.replace(`posts/${id}`, `posts/${newId}`);
          return MinIO.moveObject(name, newName);
        });
        await Promise.all(promises);
      }

      // Respond with success = true
      res.json({
        success: true,
        message: 'The post was successfully updated.'
      });
    } else if (req.method === 'DELETE') {
      // Validate the session
      if ((await validateSession(res, req.cookies.session)).terminated) return;

      // Delete the post
      const dbRes = await pool.query(
        `
          DELETE FROM posts
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      // If the post does not exist, respond with an error
      if (dbRes.rows.length === 0) {
        res.status(404).json({
          error: 'does-not-exist',
          message: 'This post does not exist.'
        });
        return;
      }

      // Delete the post from the featured table
      await pool.query(
        `
          UPDATE globals
          SET featured_posts = array_remove(featured_posts, $1)
        `,
        [id]
      );

      // Delete the post's files
      await MinIO.removeObjects(`posts/${id}`);

      // Respond with success = true
      res.json({
        success: true,
        message: 'The post was successfully deleted.'
      });
    } else {
      // No other method is allowed
      res.status(405).json({
        error: 'method-not-allowed',
        message: 'This method is not allowed.'
      });
    }
  } catch (e) {
    sendInternalError(res, e);
  }
}
