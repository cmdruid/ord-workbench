import { spawn } from 'child_process'
import { scanAddress } from './core.js'

interface ReturnCall<T> {
  ok      : boolean
  data   ?: T
  pubkey ?: string
  err    ?: unknown
}

interface OrdinalData {
  output : string,
  start  : number,
  size   : number,
  rarity : string,
  name   : string
}

interface SatPoint {
  satpoint: string
}

function call<T>(
  method : string,
  args   : string[]
) : Promise<ReturnCall<T>> {
  if (process.env.NODE_ENV !== 'production') {
    args.unshift('-r')
  }
  return new Promise((resolve, reject) => {
    const cmd  = spawn(method, args)
    let blob = ''
    cmd.stdout.on('data', data => {
      blob += data.toString()
      // console.log(str)
    })

    cmd.stderr.on('data', data => {
      reject(new Error(data.toString()))
    })

    cmd.on('error', err => {
      reject(err)
    })

    cmd.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Method '${method}' returned code: ${code}`))
      }
      resolve({ ok: true, data: JSON.parse(blob) })
    })
  })
}

export async function getOrdinals(
  txid : string,
  vout : number
) : Promise<ReturnCall<OrdinalData[]>> {
  let { ok, data } = await call<OrdinalData[]>('ord', ['list', `${txid}:${String(vout)}` ])
  return { ok, data }
}

export async function getOrdinalsFromRange(
  start : number,
  stop  : number
) : Promise<ReturnCall<OrdinalData[]>> {
  const { ok, data: { satpoint } = {} } = await call<SatPoint>('ord', ['find', String(start) ])
  if (ok && typeof satpoint === 'string') {
    const [ txid, vout ] = satpoint.split(':')
    const { ok, data } = await getOrdinals(txid, Number(vout))
    if (ok && data !== undefined) {
      const ret = data.filter((e : OrdinalData) => {
        return (start >= e.start && stop <= e.start + e.size)
      })
      return { ok, data: ret }
    }
  }
  return { ok: false }
}

export async function getOrdinalsFromUTXO(
  txid : string,
  vout : number
) : Promise<ReturnCall<OrdinalData[]>> {
  let { ok, data } = await getOrdinals(txid, vout)
  return { ok, data }
}

export async function getOrdinalsFromAddr(
  addr : string
) : Promise<{ ok : boolean, data ?: OrdinalData[], pubkey ?: string }> {
  const { ok, txid, vout, pubkey } = await scanAddress(addr)
  if (txid !== undefined && vout !== undefined) {
    const { ok, data } = await getOrdinals(txid, vout)
    return { ok, data, pubkey }
  }
  return { ok }
}
