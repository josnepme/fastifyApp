export default async function cargoRoutes(fastify, options) {

  // 1. OBTENER TODOS LOS CARGOS
  fastify.get('/cargos', async (request, reply) => {
    try {
      const { rows } = await fastify.pg.query('SELECT * FROM cargos ORDER BY id ASC')
      return { success: true, data: rows }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al obtener los cargos' })
    }
  })

  // 2. OBTENER UN CARGO POR ID
  fastify.get('/cargos/:id', async (request, reply) => {
    const { id } = request.params
    try {
      const { rows } = await fastify.pg.query('SELECT * FROM cargos WHERE id = $1', [id])
      
      if (rows.length === 0) {
        return reply.status(404).send({ error: 'Cargo no encontrado' })
      }
      
      return { success: true, data: rows[0] }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al obtener el cargo' })
    }
  })

  // 3. CREAR UN NUEVO CARGO
  fastify.post('/cargos', async (request, reply) => {
    const { nombre_cargo, descripcion } = request.body || {}

    // if (!nombre_cargo) {
    //   return reply.status(400).send({ error: 'El campo obligatorio "nombre_cargo" es requerido' })
    // }

    try {
      const query = `
        INSERT INTO cargos (nombre_cargo, descripcion) 
        VALUES ($1, $2) 
        RETURNING *
      `
      const values = [nombre_cargo, descripcion || null]
      const { rows } = await fastify.pg.query(query, values)

      reply.status(201).send({ success: true, data: rows[0] })
    } catch (err) {
      request.log.error(err)
      if (err.code === '23505') {
        return reply.status(409).send({ error: 'Ya existe un cargo registrado con ese nombre' })
      }
      reply.status(500).send({ error: 'Error al crear el cargo' })
    }
  })

  // 4. ACTUALIZAR UN CARGO
  fastify.put('/cargos/:id', async (request, reply) => {
    const { id } = request.params
    const { nombre_cargo, descripcion } = request.body || {}

    try {
      const query = `
        UPDATE cargos 
        SET nombre_cargo = COALESCE($1, nombre_cargo), 
            descripcion = COALESCE($2, descripcion) 
        WHERE id = $3 
        RETURNING *
      `
      const values = [nombre_cargo, descripcion, id]
      const { rows } = await fastify.pg.query(query, values)

      if (rows.length === 0) {
        return reply.status(404).send({ error: 'Cargo no encontrado para actualizar' })
      }

      return { success: true, data: rows[0] }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al actualizar el cargo' })
    }
  })

  // 5. ELIMINAR UN CARGO
  fastify.delete('/cargos/:id', async (request, reply) => {
    const { id } = request.params
    try {
      const { rowCount } = await fastify.pg.query('DELETE FROM cargos WHERE id = $1', [id])

      if (rowCount === 0) {
        return reply.status(404).send({ error: 'Cargo no encontrado para eliminar' })
      }

      return { success: true, message: 'Cargo eliminado correctamente' }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al eliminar el cargo' })
    }
  })
}