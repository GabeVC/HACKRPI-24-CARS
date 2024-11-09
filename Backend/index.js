const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const { runPythonScript } = require('./pythonRunner');

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

// Sample route to test connection
router.get('/api', async (ctx) => {
  ctx.body = {
    message: 'Test Connect'
  };
});

// Route that processes data with Python
router.post('/api/process-data', async (ctx) => {
  const requestData = ctx.request.body;
  try {
    const result = await runPythonScript(requestData);
    ctx.body = {
      message: 'Data processed successfully',
      data: result
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Error processing data', details: error.message };
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Koa API server is running on port ${PORT}`);
});
