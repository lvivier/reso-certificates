
const {getCertificates, getCSV, getJSON, getHTML} = require('./lib')
const express = require('express')
const app = express()

getCertificates((err, certs) => {
  if (err) {
    console.err(err.message, err.stack)
    process.exit(1)
  }

  const csvCerts = getCSV(certs)
  const jsonCerts = getJSON(certs)
  const htmlCerts = getHTML(certs)

  app
    .get('/', (req, res) => res.send(htmlCerts))
    .get('/json', (req, res) => res.type('json').send(jsonCerts))
    .get('/csv', (req, res) => res.type('csv').send(csvCerts))
    .listen(3000)

  console.log('listening on 3000')
})
