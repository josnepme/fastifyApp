// server.js
import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import dotenv from 'dotenv'

// Importar rutas independientes
import funcionarioRoutes from './routes/funcionario.routes.js'
import cargoRoutes from './routes/cargo.routes.js'

dotenv.config()

const fastify = Fastify({ logger: true })

fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL
})

fastify.get('/', async (request, reply) => {
  return { status: 'API modular activa 🚀' }
})

// Registrar módulos aplicando un prefijo global (ej. /api/v1)
fastify.register(funcionarioRoutes, { prefix: '/api/v1' })
fastify.register(cargoRoutes, { prefix: '/api/v1' })

// Si quisieras separar versiones o módulos en el futuro, podrías hacer:
// fastify.register(adminRoutes, { prefix: '/api/v1/admin' })

// Iniciar servidor
const start = async () => {
  const port = process.env.PORT || 3000;
  try {
    await fastify.listen({ port: Number(port), host: "0.0.0.0" });
    console.log(
      "API Modular con ES Modules corriendo en http://localhost:3000",
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start()
