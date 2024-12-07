import server from './entry.ts'

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on port', PORT)
})
