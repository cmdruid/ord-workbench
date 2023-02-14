import { Buff } from '@cmdcode/buff-utils'
import rpc from './rpc.js'

interface ScanResult {
  txid: string
  vout: number,
  scriptPubKey: string
  desc: string
  amount: number
  height: number
}

interface ScanResults {
  success      : boolean,
  unspents     : ScanResult[]
  total_amount : number
}

interface ScanReturn {
  ok      : boolean
  txid   ?: string
  vout   ?: number
  pubkey ?: string
}

export async function scanAddresses(
  addr : string[],
) : Promise<ScanResults> {
  const list = addr.map(a => `addr(${a})`)
  return rpc('scantxoutset', [ 'start', list ])
}

export async function scanAddress(
  addr : string
) : Promise<ScanReturn> {
  const res = await scanAddresses([ addr ])
  const { success, unspents } = res
  if (success) {
    if (unspents.length > 0) {
      const { txid, vout, scriptPubKey } = unspents[0]
      return { ok: success, txid, vout, pubkey: scriptPubKey.slice(4) }
    }
  }
  return { ok: success }
}
