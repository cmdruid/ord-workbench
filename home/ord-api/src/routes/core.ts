import { Request, Response, Router } from 'express'
import { scanAddress } from '../controller/core.js'

export const route = Router()

route.get('/scanAddress', async (req: Request, res: Response) => {
  const { address } = req.query

  if (typeof address === 'string') {
    const ret = scanAddress(address)
    return res.status(200).json(ret)
  }
  return res.status(400).send('Invalid address: ' + address)
})
