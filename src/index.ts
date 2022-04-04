import { autoEnd, logger, normalizeEpoch, sendAsJson } from './middlewares'
import * as server from './server'
import database from './database'

const db = database('volatile')

server.addMiddleware(sendAsJson, 'before')
server.addMiddleware(logger, 'after')
server.addMiddleware(logger, 'error')
server.addMiddleware(autoEnd, 'after')

server.post('/cities', async (req, res) => {
  const { name = '', country = '', population = '', region = '' } = req.query
  await db.addCity(name, country, Number.parseInt(population), region)
})

server.patch('/cities/:name', normalizeEpoch, async (req, res) => {
  const { name } = req.params
  const cityExists = await db.getLocation(name, 'city')
  if (!cityExists) {
    res.statusCode = 404
    return
  }
  const { cases = '', epoch = '' } = req.query
  await db.updateCases(name, Number.parseInt(cases), Number.parseInt(epoch))
})

server.get('/reports/:segment/:name', normalizeEpoch, async (req, res) => {
  const { segment, name } = req.params
  if (segment !== 'city' && segment !== 'country' && segment !== 'region') {
    res.statusCode = 400
    return
  }
  const city = await db.getLocation(name, segment)
  if (!city) {
    console.log(`${segment} ${name} not found`)
    res.statusCode = 404
    return
  }
  try {
    const { fromEpoch = '', toEpoch = '', epoch = '' } = req.query
    if (fromEpoch && toEpoch) {
      const cases = await db.incidenceBetweenDates(name, segment, Number.parseInt(fromEpoch), Number.parseInt(toEpoch))
      res.write(JSON.stringify(cases))
    } else if (epoch) {
      const cases = await db.incidenceBetweenDates(name, segment, Number.parseInt(epoch), Number.parseInt(epoch))
      res.write(JSON.stringify(cases))
    } else {
      res.statusCode = 400
    }
  } catch (error) {
    console.log(error)
    res.statusCode = 500
  }
})

void (async () => {
  try {
    await server.listen(3000)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  }
})()
