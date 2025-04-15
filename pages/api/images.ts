import { NextApiRequest, NextApiResponse } from 'next';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ActivityData {
  activityName?: string;
  date?: string;
  location?: string;
  distance?: string;
  pace?: string;
  time?: string;
  achievements?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST requests to process images
  if (req.method === 'POST') {
    try {
      // Check if userId is provided as a query parameter
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      
      // If userId is provided, look for images in the public/images/{userId} directory
      const userDir = path.join(process.cwd(), 'public', 'images', userId);
      
      if (!fs.existsSync(userDir)) {
        return res.status(404).json({ success: false, message: 'No images found for this user' });
      }
      
      // Get all image files in the user directory
      const files = fs.readdirSync(userDir).filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );
      
      if (files.length === 0) {
        return res.status(404).json({ success: false, message: 'No images found for this user' });
      }
      
      // Process each image with OCR
      const results = [];
      for (const file of files) {
        const filePath = path.join(userDir, file);
        
        // Process the image with Tesseract OCR
        const worker = await createWorker('eng');
        
        // Optimize image for OCR
        const optimizedImagePath = path.join(os.tmpdir(), `optimized-${file}`);
        await sharp(filePath)
          .greyscale()
          .normalize()
          .toFile(optimizedImagePath);
        
        // Recognize text in the image
        const { data } = await worker.recognize(optimizedImagePath);
        await worker.terminate();
        
        // Clean up temporary file
        fs.unlinkSync(optimizedImagePath);
        
        // Extract activity data from the OCR text
        const activityData = extractActivityData(data.text);
        
        results.push({
          file,
          ...activityData,
          rawText: data.text
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Images processed successfully',
        data: {
          [userId]: {
            analysis: results
          }
        }
      });
    } catch (error) {
      console.error('Error processing images:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing images'
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Return the results
      return res.status(200).json({
        success: true,
        message: 'Images merged and processed successfully',
      });
    } catch (error) {
      console.error('Error processing images:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing images'
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

function extractActivityData(text: string): ActivityData {
  const data: ActivityData = {};
  
  // Extract activity name (usually appears after a profile name)
  const activityNameMatch = text.match(/Evening Run|Morning Run|Afternoon Run|[\w\s]+ Run|[\w\s]+ Ride|[\w\s]+ Walk/i);
  if (activityNameMatch) {
    data.activityName = activityNameMatch[0].trim();
  }
  
  // Extract date and location
  const dateMatch = text.match(/[A-Z][a-z]+ \d{1,2},? \d{4} at \d{1,2}:\d{2} [AP]M/i) || 
                   text.match(/[A-Z][a-z]+ \d{1,2},? \d{4}/i);
  if (dateMatch) {
    data.date = dateMatch[0].trim();
  }
  
  // Extract location (usually after date)
  const locationMatch = text.match(/·\s*([\w\s,]+)/i) || 
                        text.match(/([\w\s]+Ward,[\w\s]+City)/i);
  if (locationMatch) {
    data.location = locationMatch[1].trim();
  }
  
  // Extract distance
  const distanceMatch = text.match(/(\d+\.\d+)\s*mi/i) || 
                       text.match(/(\d+\.\d+)\s*km/i);
  if (distanceMatch) {
    data.distance = distanceMatch[0].trim();
  }
  
  // Extract pace
  const paceMatch = text.match(/(\d+:\d+)\s*\/mi/i) || 
                   text.match(/(\d+:\d+)\s*\/km/i);
  if (paceMatch) {
    data.pace = paceMatch[0].trim();
  }
  
  // Extract time
  const timeMatch = text.match(/(\d+m\s*\d+s)/i) || 
                   text.match(/(\d+:\d+:\d+)/i);
  if (timeMatch) {
    data.time = timeMatch[0].trim();
  }
  
  // Extract achievements
  const achievementsMatch = text.match(/Achievements\s*(\d+)/i);
  if (achievementsMatch) {
    data.achievements = achievementsMatch[1].trim();
  }
  
  return data;
}