import { RouteHandler } from './server'

export const logger: RouteHandler = async (req, res, next) => {
  process.stdout.write(`${req.method} ${req.url} ${res.statusCode}\n`)
  next()
}

export const sendAsJson: RouteHandler = async (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
}

export const autoEnd: RouteHandler = async (req, res) => {
  res.end()
}

export const normalizeEpoch: RouteHandler = async (req, res, next) => {
  const convertGetTimeToUTCDate = (getTime: number) => {
    const date = new Date(getTime)
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)
    return utcDate.getTime()
  }

  const { epoch = '', fromEpoch = '', toEpoch = '' } = req.query
  if (epoch) {
    req.query.epoch = convertGetTimeToUTCDate(Number.parseInt(epoch)).toString()
  }
  if (fromEpoch) {
    req.query.fromEpoch = convertGetTimeToUTCDate(Number.parseInt(fromEpoch)).toString()
  }
  if (toEpoch) {
    req.query.toEpoch = convertGetTimeToUTCDate(Number.parseInt(toEpoch)).toString()
  }
}
