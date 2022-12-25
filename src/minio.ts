import * as Minio from 'minio';
import { BucketItem } from 'minio';

export default class MinIO {
  static client: Minio.Client;

  static async listObjects(prefix: string): Promise<BucketItem[]> {
    MinIO.initialize();

    const objects = MinIO.client.listObjects(
      process.env.MINIO_BUCKET!,
      prefix,
      true
    );

    // This is not optimal
    const objs = [];
    for await (let obj of objects) {
      objs.push(obj);
    }

    return objs;
  }

  static async moveObject(src: string, dst: string) {
    MinIO.initialize();

    const conditions = new Minio.CopyConditions();
    await MinIO.client.copyObject(
      process.env.MINIO_BUCKET!,
      dst,
      `/${process.env.MINIO_BUCKET!}/${src}`,
      conditions
    );
    await MinIO.client.removeObject(process.env.MINIO_BUCKET!, src);
  }

  static async removeObjects(prefix: string) {
    MinIO.initialize();

    const objects = await MinIO.listObjects(prefix);

    await MinIO.client.removeObjects(
      process.env.MINIO_BUCKET!,
      objects.map((obj) => obj.name)
    );
  }

  static async removeObject(path: string) {
    MinIO.initialize();

    await MinIO.client.removeObject(process.env.MINIO_BUCKET!, path);
  }

  static async uploadObject(path: string, data: Buffer) {
    MinIO.initialize();

    await MinIO.client.putObject(process.env.MINIO_BUCKET!, path, data);
  }

  static async uploadObjectFromFile(path: string, file: string) {
    MinIO.initialize();

    await MinIO.client.fPutObject(process.env.MINIO_BUCKET!, path, file);
  }

  static async getObjectAsStream(path: string) {
    MinIO.initialize();

    return await MinIO.client.getObject(process.env.MINIO_BUCKET!, path);
  }

  private static async initialize() {
    if (this.initialized) return;

    if (!process.env.MINIO_ENDPOINT)
      throw new Error('MINIO_ENDPOINT is not defined.');

    if (!process.env.MINIO_PORT) throw new Error('MINIO_PORT is not defined.');

    if (!process.env.MINIO_ACCESS_KEY)
      throw new Error('MINIO_ACCESS_KEY is not defined.');

    if (!process.env.MINIO_SECRET_KEY)
      throw new Error('MINIO_SECRET_KEY is not defined.');

    if (!process.env.MINIO_BUCKET)
      throw new Error('MINIO_BUCKET is not defined.');

    MinIO.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    if (!(await MinIO.client.bucketExists(process.env.MINIO_BUCKET!))) {
      throw new Error(
        `Minio bucket "${process.env.MINIO_BUCKET}" does not exist.`
      );
    }

    MinIO.initialized = true;
  }

  private static initialized = false;
}
