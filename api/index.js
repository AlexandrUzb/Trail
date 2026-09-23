import app from '../server/app.js';

/**
 * Vercel Serverless Function Entrypoint
 * 
 * Exposes the Express app as a Vercel serverless function.
 * All /api/* requests are routed here via vercel.json rewrites.
 * 
 * The Express app already mounts routes both with /api prefix 
 * (e.g. /api/auth/login) and without (e.g. /auth/login), so
 * regardless of how Vercel passes the URL, routes will match.
 */
export default app;
