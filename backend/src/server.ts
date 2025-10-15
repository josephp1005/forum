import app from './app.js';
import config from './config/config.js';

app.listen(config.port, () => {
  console.log(`Forum backend running on port ${config.port}`);
});