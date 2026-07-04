import { defineConfig } from '@adonisjs/transmit'

// In-memory SSE (single node). Swap `transport` for a distributed driver
// (e.g. Redis) when scaling out to multiple instances.
export default defineConfig({
  pingInterval: false,
  transport: null,
})
