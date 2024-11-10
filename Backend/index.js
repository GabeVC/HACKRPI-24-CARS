const Koa = require('koa');
const Router = require('@koa/router');
const { db } = require('./firebase'); // Import db from firebase.js
const uploadReviews = require('./uploadReviews');



// Initialize Koa and Router
const app = new Koa();
const router = new Router();

// Import and use the uploadReviews function
// Define the routes
router.post('/upload-reviews', uploadReviews);

// Register routes and allowed methods with the Koa app
app
  .use(router.routes())
  .use(router.allowedMethods());

// Start the Koa server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Export db to be used in other files (like uploadReviews.js)
module.exports = { db };
