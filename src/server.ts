import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'

export interface Request extends IncomingMessage {
  query: NodeJS.Dict<string>
  params: NodeJS.Dict<string>
  pathname: string
}

export type HttpStatus = 200 | 400 | 404 | 500

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
export type NextFunction = (err?: Error) => void
export type RouteHandler = (req: Request, res: ServerResponse, next?: NextFunction) => Promise<void>

const middlewares: Middleware[] = []
export type MiddlewaresOrder = 'before' | 'after' | 'error'

export interface Middleware {
  order: MiddlewaresOrder
  handler: RouteHandler
}

export const addMiddleware = (handler: RouteHandler, order: MiddlewaresOrder = 'before') => {
  middlewares.push({
    handler,
    order,
  })
}

export interface Route {
  method: Method
  path: string
  handlers: RouteHandler[]
}

const routers: Route[] = []

export const addRoute =
  (method: Method) =>
  (path: string, ...handlers: RouteHandler[]) => {
    routers.push({ method, path, handlers })
  }

export const get = addRoute('GET')

export const post = addRoute('POST')

export const patch = addRoute('PATCH')

export const listen = (port: number): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!routers.length) {
      reject(new Error('No routes defined'))
    }

    const server = createServer()

    server.on('request', async (req, res) => {
      const { method, url } = req
      const { query, pathname } = parse(url, true)

      const request: Request = Object.create({
        ...req,
        pathname,
        query,
        params: {},
      })

      const route = routers.find((r) => {
        if (r.method !== method) {
          return false
        }

        const metaParams = r.path.split('/')
        const params = pathname.split('/')

        if (metaParams.length !== params.length) {
          return false
        }

        for (let i = 0; i < metaParams.length; i++) {
          const metaParam = metaParams[i]
          const param = params[i]

          if (metaParam === param) {
            continue
          }

          if (metaParam.startsWith(':')) {
            const key = metaParam.slice(1)
            request.params[key] = param
          } else {
            if (metaParam !== param) {
              return false
            }
          }
        }
        return true
      })
      const preHandlers = middlewares.filter(({ order }) => order === 'before')
      const postHandlers = middlewares.filter(({ order }) => order === 'after')
      const errorHandlers = middlewares.filter(({ order }) => order === 'error')

      const noRoute = !route || !route.path || !route.handlers || !route.handlers.length

      let error: Error | undefined = noRoute ? new Error(`No route found for ${method} ${pathname}`) : undefined
      const next = (err: Error) => {
        error = err
      }

      const handlers = [
        ...preHandlers.map(({ handler }) => handler),
        ...(noRoute ? [] : route.handlers),
        ...postHandlers.map(({ handler }) => handler),
      ]

      for (const handler of handlers) {
        if (error) {
          break
        }
        try {
          await handler(request, res, next)
        } catch (error) {
          next(error)
        }
      }

      if (error) {
        if (res.statusCode === 200) {
          res.statusCode = noRoute ? 404 : 500
        }

        process.stderr.write(`error: ${error.message}\n`)

        if (errorHandlers.length) {
          for (const { handler } of errorHandlers) {
            await handler(request, res, next)
          }
        }
        res.end()
      }
    })

    server.listen(port, () => {
      console.log(`Server listening on port ${port}`)
      resolve()
    })
  })
