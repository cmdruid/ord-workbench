import { Request, Response, Router } from 'express'

import { 
  getOrdinalsFromAddr,
  getOrdinalsFromRange,
  getOrdinalsFromUTXO 
} from '../controller/ord.js'

export const route = Router()

route.get('/fromUTXO', async (req: Request, res: Response) => {
  const { txid, vout } = req.query

  if (
    typeof txid === 'string' &&
    (typeof vout === 'string' || typeof vout === 'number')   
  ) {
    const { ok, data } = await getOrdinalsFromUTXO(txid, Number(vout))
    return res.status(200).json({ ok, data })
  }
  return res.status(400).send('Invalid data: ' + JSON.stringify(req.query))
})

route.get('/fromRange', async (req: Request, res: Response) => {
  let { start, stop } = req.query

  if (stop === undefined) stop = start

  if (
    (typeof start === 'string' || typeof start === 'number') &&
    (typeof stop  === 'string' || typeof start === 'number')
  ) {
    const { ok, data } = await getOrdinalsFromRange(Number(start), Number(stop))
    return res.status(200).json({ ok, data })
  }
  return res.status(400).send('Invalid data: ' + JSON.stringify(req.query))
})

route.get('/fromAddress', async (req: Request, res: Response) => {
  const { address } = req.query

  if (typeof address === 'string') {
    const ret = await getOrdinalsFromAddr(address)
    return res.status(200).json(ret)
  }
  return res.status(400).send('Invalid address: ' + address)
})
