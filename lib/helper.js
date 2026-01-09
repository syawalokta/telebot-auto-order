import { DB } from './database.js'

export function isRowner(id) {
  return global.rowner.includes(String(id))
}

export function isOwner(id) {
  return isRowner(id) || global.ownerid.includes(String(id))
}

export function isPremium(id) {
  return global.db.users[id]?.premium || false
}

export async function isAdmin(ctx) {
  if (!ctx.chat || ctx.chat.type === 'private') return false
  return ctx.getChatMember(ctx.from.id)
    .then(m => ['administrator', 'creator'].includes(m.status))
    .catch(() => false)
}

export function getTotalProdukTerjual() {
  let total = 0

  for (const trx of Object.values(DB.transaksi)) {
    if (!trx) continue
    total += Number(trx.qty || 0)
  }

  return total
}