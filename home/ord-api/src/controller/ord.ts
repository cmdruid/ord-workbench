import { spawn } from 'child_process'
import { scanAddress } from './core.js'

interface ReturnCall<T> {
  ok   : boolean
  code : number | null
  data : T
}

interface OrdinalData {
  output : string,
  start  : number,
  size   : number,
  rarity : string,
  name   : string
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
      resolve({ ok: code === 0, code, data: JSON.parse(blob) })
    })
  })
}

export function getOrdinalsFromUTXO(
  txid : string,
  vout : number
) : Promise<ReturnCall<OrdinalData[]>> {
  const ordinals = call<OrdinalData[]>('ord', ['list', `${txid}:${String(vout)}` ])
  return ordinals
}

export async function getOrdinalsFromAddr(
  addr : string
) : Promise<{ ok : boolean, data ?: OrdinalData[], pubkey ?: string }> {
  const { success, txid, vout, pubkey } = await scanAddress(addr)
  if (txid !== undefined && vout !== undefined) {
    const { ok, data } = await getOrdinalsFromUTXO(txid, vout)
    return { ok, data, pubkey }
  }
  return { ok: success }
}
