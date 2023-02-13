import express, { Express, NextFunction, Request, Response } from 'express'

import { route as CoreRouter } from './routes/core.js'
import { route as OrdRouter }  from './routes/ord.js'

const PORT = 3000

const app: Express = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json({ limit: 1000 }))

app.use((err: Error, req : Request, res : Response, next: NextFunction) => {
  const { headers, url, method, query, body } = req
  console.log('Error caught by handler:')
  console.error(err)
  res.status(500).json({ headers, url, method, query, body })
})

app.use('/core', CoreRouter)
app.use('/ord', OrdRouter)

app.listen(PORT, () => {
  console.log('API server listening on port: ' + String(PORT))
})
