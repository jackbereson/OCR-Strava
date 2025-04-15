import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve images
  if (req.method === 'GET') {
    try {
      /
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