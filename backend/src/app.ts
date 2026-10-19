import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { initSocketServer } from './socket/io.js';
import { initMqttClient } from './mqtt/client.js';
import { HeartbeatService } from './services/heartbeat.service.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Initialize Socket.IO
initSocketServer(server);

// Initialize MQTT Subscriber
initMqttClient();

// Start Heartbeat Watchdog
HeartbeatService.startWatchdog();

// Auto-sync worker roster to canonical Indian names on startup
async function ensureWorkerRosterSync() {
  try {
    const { prisma } = await import('./config/db.js');
    await Promise.all([
      prisma.worker.updateMany({
        where: { workerId: 'W-101' },
        data: { name: 'Arjun Verma' },
      }),
      prisma.worker.updateMany({
        where: { workerId: 'W-102' },
        data: { name: 'Vikram Patel' },
      }),
      prisma.worker.updateMany({
        where: { workerId: 'W-103' },
        data: { name: 'Ananya Sharma' },
      }),
    ]);
    console.log('✓ Database personnel roster auto-synchronized with canonical Indian names');
  } catch (err: any) {
    console.warn('[Startup Sync] Could not auto-sync worker roster:', err?.message || err);
  }
}

// Start Server
server.listen(config.port, () => {
  ensureWorkerRosterSync();
  console.log(`
==========================================================
   SENTINELX: INDUSTRIAL SAFETY MONITORING SERVER
==========================================================
 🚀 REST API & Socket.IO: http://localhost:${config.port}
 📡 MQTT Broker:          ${config.mqtt.brokerUrl}
 🗄️ Database:             ${config.databaseUrl ? "configured (credentials hidden)" : "not configured"}
 ⏱️ Heartbeat Watchdog:   Timeout = ${config.heartbeatTimeoutMs}ms
 ⚠️ DEPLOYMENT:           Educational Prototype
 📋 DATA SOURCE:          Per message (hardware / simulated / unknown)
==========================================================
  `);
});

export { app, server };
