import AWS from 'aws-sdk';
import multer from 'multer';

import { updateUserProfile, User } from "./graphql/users.js";
import { getUser } from "./graphql/users.js";
import { dbClient } from './db/db.js';

// Setup S3 client access.
const s3 = new AWS.S3({
  accessKeyId: process.env.NODE_AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.NODE_AWS_S3_SECRET_KEY,
  region: process.env.NODE_AWS_S3_REGION
});

// Configure multer for file uploads with memory storage.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb(null, true);
      return;
    }
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. If uploading a file, please upload an image.'));
    }
  }
});


export const profile = async (req: any, res: any) => {
  try {
    const profile_name = req.body.profile_name;
    const username = req.userAuth.username;
    const icon = req.file;

    // Query the user using the same function as the GraphQL resolver
    const user = await getUser(username, { db: dbClient }) as User;

    if (profile_name) {
      user.profile_name = profile_name;
    }

    if (icon) {
      try {
        const fileName = `${username}-${Math.floor(Date.now() / 1000)}`;

        // Upload image to s3 and save the url to the user.
        user.icon = await uploadImageToS3(icon.buffer, fileName, icon.mimetype);
      } catch (error) {
        console.error('Error uploading to S3:', error);
        res.status(500).json({ error: 'Upload failed' });
        return;
      }
    }

    // Update the user in the database.
    const updatedUser = await updateUserProfile(user.id, user.profile_name, user.icon, { db: dbClient });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error handling profile update:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

async function uploadImageToS3(buffer: Buffer, fileName: string, mimeType: string) {
  const params = {
    Bucket: 'wishlist-user-icons',
    Key: fileName, // Name of the file in S3
    Body: buffer, // The image buffer
    ContentType: mimeType, // MIME type of the file
    ACL: 'public-read', // Optional: Makes the file publicly accessible
  };

  return (await s3.upload(params).promise()).Location;
}
