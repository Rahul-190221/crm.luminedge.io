import http from 'http';
import app from './app';
import connectDB from './config/db';
import { socketService } from './services/socket.service';
import { initScheduler } from './services/scheduler.service';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start server
connectDB().then(() => {
  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io
  socketService.init(server);

  // Start daily follow-up reminder cron job
  initScheduler();

  // Start server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB, server not started:', err);
  process.exit(1);
});
