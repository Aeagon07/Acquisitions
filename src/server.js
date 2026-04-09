import app from './app.js';

const DEFAULT_PORT = 3009;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default server;
