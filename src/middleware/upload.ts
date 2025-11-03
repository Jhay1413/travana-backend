import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (since we're uploading to S3)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',

    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',

    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',

    // JSON/Text
    'application/json',
    'text/json',

    // Audio
    'audio/mpeg',  // for .mp3
    'audio/wav',   // ✅ for .wav
    'audio/x-wav', // some browsers use this alternate type
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed!`));
  }
};

// File filter for tickets - allows various file types
const ticketFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types for tickets
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',

    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',

    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',

    // JSON/Text
    'application/json',
    'text/json',

    // Audio
    'audio/mpeg',  // for .mp3
    'audio/wav',   // ✅ for .wav
    'audio/x-wav', // some browsers use this alternate type
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed!`));
  }
};

// Configure multer for images
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configure multer for tickets with more flexible file types
const ticketUpload = multer({
  storage: storage,
  fileFilter: ticketFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for tickets
  }
});

export const uploadSingle = upload.single('avatar');
export const uploadClientFile = upload.single('file');
export const uploadMultiple = upload.array('files', 5); // For multiple files if needed
export const uploadTicketFiles = ticketUpload.array('files', 10); // For ticket files
