import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

// Disable the default body parser to handle form-data with files
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = new IncomingForm({
      multiples: true, // Allow multiple files
      keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          res.status(500).json({ message: 'Error processing upload' });
          return resolve(undefined);
        }

        try {
          // Extract userId from fields
          const userId = Array.isArray(fields.userId) 
            ? fields.userId[0] 
            : fields.userId as unknown as string;

          if (!userId || userId.trim() === '') {
            res.status(400).json({ message: 'User ID is required' });
            return resolve(undefined);
          }

          // Create user directory if it doesn't exist
          const userDir = path.join(process.cwd(), 'public', 'images', userId);
          
          if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
          }

          const uploadedFiles = files.imageFiles;
          const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
          
          // Process each uploaded file
          const savedFiles = await Promise.all(
            fileArray.map(async (file) => {
              if (!file || !file.filepath) return null;
              
              // Create unique filename to avoid overwriting
              const originalFilename = file.originalFilename || 'unnamed-file';
              const timestamp = new Date().getTime();
              const filename = `${timestamp}-${originalFilename}`;
              const destination = path.join(userDir, filename);
              
              // Copy file to destination
              await fs.promises.copyFile(file.filepath, destination);
              
              // Clean up temporary file
              await fs.promises.unlink(file.filepath);
              
              // Return path for client
              return `/images/${userId}/${filename}`;
            })
          );

          // Filter out any null results and return paths
          const validFiles = savedFiles.filter(file => file !== null);
          
          res.status(200).json({
            message: 'Files uploaded successfully',
            files: validFiles,
          });
          
          return resolve(undefined);
        } catch (error) {
          console.error('Upload processing error:', error);
          res.status(500).json({ message: 'Error saving files' });
          return resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ message: 'Error processing upload' });
  }
}