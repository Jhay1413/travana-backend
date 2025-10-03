import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY ?? '',
        secretAccessKey: process.env.BUCKET_PRIVATE_KEY ?? '',
    },
});

const s3Client = new S3Client({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY ?? '',
        secretAccessKey: process.env.BUCKET_PRIVATE_KEY ?? '',
    },
});
export type S3Service = {

    getSignedUrl: (fileKey: string) => Promise<string>;
    uploadAvatar: (file: Express.Multer.File) => Promise<string>;
    uploadClientFile: (file: Express.Multer.File, clientName: string) => Promise<string>;
    uploadTicketFile: (files: Express.Multer.File[]) => Promise<{ file_name: string; file_path: string; file_size: number; file_type: string; }[]>;
    uploadTicketReplyFile: (files: Express.Multer.File[]) => Promise<{ file_name: string; file_path: string; file_size: number; file_type: string; }[]>;
}

export const s3Service: S3Service = {
    getSignedUrl: async (fileKey) => {
        const command = new GetObjectCommand({
            Bucket: 'temp-travana-bucket',
            Key: fileKey,
        });

        // Generate signed URL that expires in 1 hour (3600 seconds)
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    },
    uploadAvatar: async (file) => {
        const fileKey = `avatar/${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: 'temp-travana-bucket',
            Key: fileKey,
            ContentType: file.mimetype || 'image/jpeg',
            Body: file.buffer,
        };

        await s3.upload(params).promise();
        return fileKey;
    },
    uploadClientFile: async (file, clientName) => {
        const fileKey = `client-file/${clientName}/${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: 'temp-travana-bucket',
            Key: fileKey,
            ContentType: file.mimetype || 'application/octet-stream',
            Body: file.buffer,
        };

        await s3.upload(params).promise();
        return fileKey;
    },
    uploadTicketFile: async (files) => {
        const fileUrls = await Promise.all(
            files.map(async (file) => {
              const fileKey = `ticket-file/${file.originalname}`;
              const params = {
                Bucket: 'temp-travana-bucket',
                Key: fileKey,
                ContentType: file.mimetype || 'application/octet-stream',
                Body: file.buffer,
              };
              await s3.upload(params).promise();
              return {
                file_name: file.originalname,
                file_path: fileKey,
                file_size: file.size,
                file_type: file.mimetype,
              };
            })
          );
          return fileUrls;
    },
    uploadTicketReplyFile: async (files) => {
        const fileUrls = await Promise.all(
            files.map(async (file) => {
              const fileKey = `ticket-reply-file/${file.originalname}`;
              const params = {
                Bucket: 'temp-travana-bucket',
                Key: fileKey,
                ContentType: file.mimetype || 'application/octet-stream',
                Body: file.buffer,
              };
              await s3.upload(params).promise();
              return {
                file_name: file.originalname,
                file_path: fileKey,
                file_size: file.size,
                file_type: file.mimetype,
              };
            })
          );
          return fileUrls;
    }
}
