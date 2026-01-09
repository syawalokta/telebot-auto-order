import fs from 'fs'
import path from 'path'
import { Markup } from 'telegraf'
import { DB } from './database.js'

const TMP_DIR = path.join(process.cwd(), '.tmp')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

/* ===============================
   TAMPILKAN MENU RIWAYAT
================================ */
export async function showHistoryMenu(ctx) {
  await ctx.reply(
`<b>Riwayat Transaksi</b>

Riwayat transaksi apa yang ingin kamu lihat?`,
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback('PEMBELIAN', 'HISTORY_BUY'),
          Markup.button.callback('DEPOSIT', 'HISTORY_DEPOSIT')
        ]
      ]).reply_markup
    }
  )
}

/* ===============================
   10 TRANSAKSI TERAKHIR (PEMBELIAN)
================================ */
export async function showLastTransactions(ctx) {
  const userId = ctx.from.id

  const all = Object.values(DB.transaksi)
    .filter(t => t.userId === userId && t.metode === 'saldo')
    .sort((a, b) => b.waktu - a.waktu)

  const last10 = all.slice(0, 10)

  if (last10.length === 0) {
    return ctx.reply('Belum ada transaksi.')
  }

  let text = `<b>10 TRANSAKSI TERAKHIR</b>\n\n`

  last10.forEach((trx, i) => {
    const waktu = new Date(trx.waktu).toLocaleString('id-ID')
    const produk = DB.produk[trx.productId]?.nama || '-'

    text +=
`(${i + 1}) - - - - - - - - - - - - - -
• Produk: ${produk}
• ID transaksi: ${trx.id}
• Jumlah unit: ${trx.qty}
• Total bayar: Rp ${trx.total.toLocaleString('id-ID')}
• Waktu: ${waktu}

`
  })

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback('LIHAT SEMUA RIWAYAT', 'HISTORY_ALL')]
    ]).reply_markup
  })
}

/* ===============================
   KIRIM FILE SEMUA RIWAYAT
================================ */
export async function sendAllHistory(ctx) {
  const userId = ctx.from.id
  const username = ctx.from.username || userId

  const list = Object.values(DB.transaksi)
    .filter(t => t.userId === userId && t.metode === 'saldo')
    .sort((a, b) => b.waktu - a.waktu)

  if (list.length === 0) {
    return ctx.reply('Belum ada transaksi.')
  }

  let content = `RIWAYAT TRANSAKSI PEMBELIAN\n\n`

  list.forEach((trx, i) => {
    const waktu = new Date(trx.waktu).toLocaleString('id-ID')
    const produk = DB.produk[trx.productId]?.nama || '-'

    content +=
`(${i + 1})
Produk        : ${produk}
ID Transaksi  : ${trx.id}
Jumlah Unit   : ${trx.qty}
Total Bayar   : Rp ${trx.total.toLocaleString('id-ID')}
Waktu         : ${waktu}

-------------------------
`
  })

  const filePath = path.join(TMP_DIR, `transaction-${username}.txt`)
  fs.writeFileSync(filePath, content)

  await ctx.replyWithDocument(
    { source: filePath },
    { caption: 'Semua riwayat transaksi kamu' }
  )

  fs.unlinkSync(filePath)
}