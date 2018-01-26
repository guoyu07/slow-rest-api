'use strict'
const bunyan = require('bunyan')

global.logger = bunyan.createLogger({
  name: 'category-subcategory-ad-migration'
});

var etag = require('./etag')
var pkg = JSON.stringify(require('./package.json'))

var http = require('http')
var count = 1
var server = http.createServer((req, res) => {
  switch (req.url) {
    case '/a':
      var tag = etag(pkg + ++count)

      if (!(tag instanceof Error)) {
        res.setHeader('ETag', tag)
      }

      res.end(pkg)
      break;
    case '/b':
      var tag = etag({ entity: pkg + ++count, algorithm: 'sha256' })

      if (!(tag instanceof Error)) {
        res.setHeader('ETag', tag)
      }

      res.end(pkg)
      break
    case '/c':
      var tag = etag(pkg + ++count, { algorithm: 'sha512WithRsaEncryption' })

      if (!(tag instanceof Error)) {
        res.setHeader('ETag', tag)
      }

      res.end(pkg)
      break
    default:
      res.end('Not a valid route')
      break;
  }
})

server.listen(3000)

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
