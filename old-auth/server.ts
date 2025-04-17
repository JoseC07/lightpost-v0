// Import configurations and register path aliases as per our tsconfig settings.
// This helps us group code by domain and maintain clarity.
import './config/aliases';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Derive __dirname from import.meta.url for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import Express framework and other libraries.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

// Load environment variables ensuring sensitive data (like DB credentials) is managed securely.
dotenv.config();

// Initialize the Express application.
const app = express();
const port = process.env.PORT || 3000;

// ------------------ Middleware Setup ------------------

// Parse incoming JSON requests (essential for our API endpoints).
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS) as detailed in our Tech-Stack-Overview.md
// to support client applications from different origins.
app.use(cors());

// Serve static files such as images or attachments.
// The path is constructed using Node's path module.
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ------------------ API Routing ------------------

/*
 * The following routes are grouped by their respective functional domains,
 * as recommended by our modular architecture guidelines.
 * 
 * - Post Routes: Handles all CRUD operations for posts.
 * - Category Routes: Manages post categories, keeping validation cohesive.
 * - File Routes: Manages file upload endpoints and asset delivery.
 */
import postRoutes from '@/routes/postRoutes';
import categoryRoutes from '@/routes/categoryRoutes';
import fileRoutes from '@/routes/fileRoutes';
// import authRoutes from '@/routes/authRoutes';

// app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', fileRoutes);

// ------------------ Health Check Endpoint ------------------
/*
 * A simple endpoint to verify that the server is running.
 * This is useful for monitoring and basic load balancer checks.
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// ------------------ Global Error Handling ------------------

/*
 * Catch-all error handler to ensure consistent error responses.
 * This middleware should always be the last one registered.
 */
import { errorHandler } from '@/middleware/errorHandler';
app.use(errorHandler);

// ------------------ Server Startup ------------------

/*
 * Only start the server if not in a test environment.
 * This allows integration tests (using Jest) to import the app without starting the server.
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export the Express app to facilitate testing and modular usage.
export default app;