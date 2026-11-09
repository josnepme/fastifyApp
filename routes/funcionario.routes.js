export default async function funcionarioRoutes(fastify, options) {

  // 1. OBTENER TODOS
  fastify.get('/funcionarios', async (request, reply) => {
    try {
      const { rows } = await fastify.pg.query('SELECT * FROM funcionario ORDER BY id ASC')
      return { success: true, data: rows }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al obtener los funcionarios' })
    }
  })

  // 2. OBTENER UNO POR ID
  fastify.get('/funcionarios/:id', async (request, reply) => {
    const { id } = request.params
    try {
      const { rows } = await fastify.pg.query('SELECT * FROM funcionario WHERE id = $1', [id])
      
      if (rows.length === 0) {
        return reply.status(404).send({ error: 'Funcionario no encontrado' })
      }
      
      return { success: true, data: rows[0] }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al obtener el funcionario' })
    }
  })

  // 3. CREAR
  fastify.post('/funcionarios', async (request, reply) => {
    const { cedula, nombres, apellidos, cargo } = request.body || {}
    console.log(request)
console
.log(cedula, nombres, apellidos, cargo)
    console.log(request.body)
    // if (!cedula || !nombres || !apellidos || cargo) {
    //   return reply.status(400).send({ error: 'Faltan campos obligatorios: cedula, nombres, apellidos' })
    // }
    

    try {
      const query = `
        INSERT INTO funcionario (cedula, nombres, apellidos, cargo) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `
      const values = [cedula, nombres, apellidos, cargo || null]
      const { rows } = await fastify.pg.query(query, values)

      reply.status(201).send({ success: true, data: rows[0] })
    } catch (err) {
      request.log.error(err)
      if (err.code === '23505') {
        return reply.status(409).send({ error: 'Ya existe un funcionario registrado con esa cédula' })
      }
      reply.status(500).send({ error: 'Error al crear el funcionario' })
    }
  })

  // 4. ACTUALIZAR
  fastify.put('/funcionarios/:id', async (request, reply) => {
    const { id } = request.params
    const { cedula, nombres, apellidos, cargo } = request.body || {}

    try {
      const query = `
        UPDATE funcionario 
        SET cedula = COALESCE($1, cedula), 
            nombres = COALESCE($2, nombres), 
            apellidos = COALESCE($3, apellidos), 
            cargo = COALESCE($4, cargo) 
        WHERE id = $5 
        RETURNING *
      `
      const values = [cedula, nombres, apellidos, cargo, id]
      const { rows } = await fastify.pg.query(query, values)

      if (rows.length === 0) {
        return reply.status(404).send({ error: 'Funcionario no encontrado para actualizar' })
      }

      return { success: true, data: rows[0] }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al actualizar el funcionario' })
    }
  })

  // 5. ELIMINAR
  fastify.delete('/funcionarios/:id', async (request, reply) => {
    const { id } = request.params
    try {
      const { rowCount } = await fastify.pg.query('DELETE FROM funcionario WHERE id = $1', [id])

      if (rowCount === 0) {
        return reply.status(404).send({ error: 'Funcionario no encontrado para eliminar' })
      }

      return { success: true, message: 'Funcionario eliminado correctamente' }
    } catch (err) {
      request.log.error(err)
      reply.status(500).send({ error: 'Error al eliminar el funcionario' })
    }
  })
}