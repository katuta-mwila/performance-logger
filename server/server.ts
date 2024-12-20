import * as Path from 'node:path'
import { formatDate } from 'date-fns'
import express from 'express'

import logRouter from './routes/logRouter.ts'
import errorHandler from './middleware/errorHandler.ts'
import { seed } from './db/seeds/logGroups.js'
import connection from './db/connection.ts'
import snapshotRouter from './routes/snapshotRouter.ts'

const server = express()

server.use(express.json())

server.use('/api/v1/', logRouter)
server.use('/api/v1/snapshots', snapshotRouter)

server.get('/test', async (req, res) =>{
  console.log(process.env)
  console.log(process.env.NODE_ENV)
  formatDate(new Date(), 'yyyy')
  res.status(200)

  res.send(process.env.NODE_ENV ?? "NODE_ENV NOT FOUND")
})

server.post('/api/v1/reset', async (req, res) =>{
  if (req.body.password !== 'perf-log-123') res.status(403).send("No")
  await seed(connection)
  res.send("DB Reset")
})

server.use(errorHandler)

if (process.env.NODE_ENV === 'production') {
  server.use(express.static(Path.resolve('public')))
  server.use('/assets', express.static(Path.resolve('./dist/assets')))
  server.get('*wildcard', (req, res) => {
    res.sendFile(Path.resolve('./dist/index.html'))
  })
}

export default server
