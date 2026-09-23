import serverless from 'serverless-http';
import app from '../../server/app.js';

const serverlessHandler = serverless(app);

/**
 * Netlify Serverless Function Entrypoint
 * Wraps Express application with serverless-http and handles edge-case errors
 * to guarantee that Lambda unhandled exceptions NEVER trigger a raw 502 Bad Gateway.
 */
export const handler = async (event, context) => {
  try {
    // Prevent function from waiting for idle event loops before returning HTTP response
    if (context) {
      context.callbackWaitsForEmptyEventLoop = false;
    }

    const response = await serverlessHandler(event, context);
    return response;
  } catch (err) {
    console.error('[Netlify Function Serverless Error]:', err);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-admin-key,X-Requested-With,Accept'
      },
      body: JSON.stringify({
        success: false,
        message: "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring.",
        error: "Server bilan bogʻlanishda muammo yuz berdi. Iltimos, birozdan soʻng qayta urinib koʻring."
      })
    };
  }
};
