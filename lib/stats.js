import { DB } from './database.js'

export function getTotalProdukTerjual() {
  let total = 0

  for (const trx of Object.values(DB.transaksi)) {
    if (trx?.qty) {
      total += Number(trx.qty)
    }
  }

  return total
}