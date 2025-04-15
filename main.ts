import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Define development environment
const dev = process.env.NODE_ENV !== 'production';

// Initialize Next.js application
const app = next({ dev });
const handle = app.getRequestHandler();

// Default port for server
const port = process.env.PORT || 3000; // Changed from 3000 to 3001

// Prepare and run Next.js server
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Server running at http://localhost:${port}`);
    console.log('> Press Ctrl+C to stop');
  });
}).catch(err => {
  console.error('Error starting server:', err);
});