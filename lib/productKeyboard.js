import { Markup } from 'telegraf'
import { DB } from './database.js'

/* ===============================
   KEYBOARD MENU UTAMA (START)
   TANPA GRID PRODUK
================================ */
export function mainReplyKeyboard(ctx) {
  const userId = ctx.from.id
  const user = global.db.users?.[userId] || { saldo: 0 }

  return Markup.keyboard([
    ['📦 List Produk', `💰 Saldo: Rp. ${user.saldo.toLocaleString('id-ID')}`],
    ['📄 Riwayat Transaksi'],
    ['✨ Produk Populer', '❓ Cara Order']
  ])
    .resize()
    .persistent()
}

/* ===============================
   KEYBOARD LIST PRODUK
   DENGAN GRID PRODUK
================================ */
export function productReplyKeyboard(ctx) {
  const userId = ctx.from.id
  const user = global.db.users?.[userId] || { saldo: 0 }

  const ids = Object.values(DB.produk)
    .map(p => p.id)
    .sort((a, b) => a - b)

  const rows = []

  // MENU ATAS
  rows.push([
    '📦 List Produk',
    `💰 Saldo: Rp. ${user.saldo.toLocaleString('id-ID')}`
  ])

  const COLS = 6
  for (let i = 0; i < ids.length; i += COLS) {
    rows.push(ids.slice(i, i + COLS).map(id => id.toString()))
  }

  rows.push(['📄 Riwayat Transaksi'])
  rows.push(['✨ Produk Populer', '❓ Cara Order'])

  return Markup.keyboard(rows)
    .resize()
    .persistent()
}