import rpc from './rpc.js'

interface ScanResult {
  success: boolean,
  unspents: [
    {
      txid: string
      vout: number,
      scriptPubKey: string
      desc: string
      amount: number
      height: number
    }
  ],
  total_amount: number
}

export async function scanAddresses(
  addr : string[],
) : Promise<ScanResult> {
  const list = addr.map(a => `addr(${a})`)
  return rpc('scantxoutset', [ 'start', list ])
}

export async function scanAddress(addr : string) {
  const res = await scanAddresses([ addr ])
  const { success, unspents } = res
  if (success) {
    if (unspents.length > 0) {
      const { txid, vout, scriptPubKey } = unspents[0]
      return { success, txid, vout, pubkey: scriptPubKey.slice(4) }
    }
  }
  return { success }
  }
  
