const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser'); // Import koa-bodyparser
const { db } = require('./firebase'); // Import db from firebase.js
const uploadReviews = require('./uploadReviews');
const getReviewsWithinArea = require('./getReviewsWithinArea'); // Import the new function

// Initialize Koa and Router
const app = new Koa();
const router = new Router();

app.use(cors()); // Enable CORS
app.use(bodyParser()); // Use bodyParser middleware
app.use(router.routes()).use(router.allowedMethods());

// Define routes
router.post('/upload-reviews', uploadReviews);
router.post('/api/reviews-within-area', async (ctx) => {
  const { center, radius } = ctx.request.body;
  try {
    const reviews = await getReviewsWithinArea(center, radius);
    ctx.body = { reviews };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch reviews within area' };
  }
});

// Start the Koa server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

module.exports = { db };
