'use strict'
const bunyan = require('bunyan')

global.logger = bunyan.createLogger({
  name: 'category-subcategory-ad-migration'
});

var etag = require('./etag')
var pkg = JSON.stringify(require('./package.json'))

// Require the framework and instantiate it
const fastify = require('fastify')()
var count = 1
// Declare a route
fastify.get('/a', async (request, reply) => {
  var tag = etag(pkg + ++count)

  if (!(tag instanceof Error)) {
    res.setHeader('ETag', tag)
  }


  return pkg
})

fastify.get('/b', async (request, reply) => {
  var tag = etag({ entity: pkg + ++count, algorithm: 'sha256' })

  if (!(tag instanceof Error)) {
    res.setHeader('ETag', tag)
  }

  return pkg
})

fastify.get('/c', async (request, reply) => {
  var tag = etag(pkg + ++count, { algorithm: 'sha512WithRsaEncryption' })

  if (!(tag instanceof Error)) {
    res.setHeader('ETag', tag)
  }

  return pkg
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

var signal = 'SIGINT'

// Cleanly shut down process on SIGINT to ensure that perf-<pid>.map gets flushed
process.on(signal, onSignal)

function onSignal() {
  console.error('count', count)
  // IMPORTANT to log on stderr, to not clutter stdout which is purely for data, i.e. dtrace stacks
  console.error('Caught', signal, ', shutting down.')
  server.close()
  process.exit(0)
}
