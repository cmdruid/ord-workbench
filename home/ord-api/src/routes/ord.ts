import { Request, Response, Router } from 'express'

import { 
  getOrdinalsFromAddr, 
  getOrdinalsFromUTXO 
} from '../controller/ord.js'

export const route = Router()

route.get('/fromUTXO', async (req: Request, res: Response) => {
  const { txid, vout } = req.query

  if (
    typeof txid === 'string' &&
    typeof Number(vout) === 'number'
  ) {
    const ret = await getOrdinalsFromUTXO(txid, Number(vout))
    return res.status(200).json(ret)
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
