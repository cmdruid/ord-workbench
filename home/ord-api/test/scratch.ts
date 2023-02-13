import { getOrdinalsFromAddr } from '../src/controller/ord.js'

const addr = 'bcrt1pcs39egusdr574fzx38vrtd9xp96smqh6x4wjc5kspslxc7yf23jqdt8m4h'
const { ok, data, pubkey } = await getOrdinalsFromAddr(addr)

console.log(data, pubkey)

// console.log(await rpc('getblockchaininfo'))