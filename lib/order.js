import { Markup } from 'telegraf'
import { DB } from './database.js'

// ===============================
// KONFIRMASI ORDER (AWAL)
// ===============================
export async function showConfirmOrder(ctx, userId, edit = false) {
  const order = DB.order[userId]
  if (!order) return

  const produk = DB.produk[order.productId]
  const varian = DB.variasi[order.varId]

  if (!produk || !varian) {
    if (ctx.update?.callback_query) {
      return ctx.answerCbQuery('Data produk tidak valid', { show_alert: true })
    }
    return
  }

  const stok = Array.isArray(varian.stok) ? varian.stok.length : 0
  const total = order.qty * order.price

  const text =
`<b>KONFIRMASI PESANAN 🛒</b>
╭ - - - - - - - - - - - - - - - - - - - - - ╮
┊ Produk: ${produk.nama}
┊ Variasi: ${varian.nama}
┊ Harga satuan: Rp ${order.price.toLocaleString('id-ID')}
┊ Stok tersedia: ${stok}
┊ - - - - - - - - - - - - - - - - - - - - -
┊ Jumlah Pesanan: x${order.qty}
┊ Total Pembayaran: Rp ${total.toLocaleString('id-ID')}
╰ - - - - - - - - - - - - - - - - - - - - - ╯
╰➤ Refresh at ${new Date().toLocaleTimeString('id-ID')}`

  const buttons = Markup.inlineKeyboard([
    [
      Markup.button.callback('+1', 'QTY_ADD_1'),
      Markup.button.callback('+5', 'QTY_ADD_5')
    ],
    [
      Markup.button.callback('-1', 'QTY_MIN_1'),
      Markup.button.callback('-5', 'QTY_MIN_5')
    ],
    [
      Markup.button.callback('💰 Bayar dengan Saldo', 'PAY_SALDO')
    ],
    [
      Markup.button.callback('🔄 Refresh', 'REFRESH_ORDER'),
      Markup.button.callback('⬅ Back', 'BACK_VARIASI')
    ]
  ])

  if (edit && ctx.update?.callback_query) {
    return ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: buttons.reply_markup
    })
  }

  return ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: buttons.reply_markup
  })
}

// ===============================
// KONFIRMASI BAYAR SALDO
// ===============================
export async function showConfirmSaldo(ctx, userId, edit = false) {
  const order = DB.order[userId]
  if (!order) return

  const produk = DB.produk[order.productId]
  const varian = DB.variasi[order.varId]

  if (!produk || !varian) {
    if (ctx.update?.callback_query) {
      return ctx.answerCbQuery('Data produk tidak valid', { show_alert: true })
    }
    return
  }

  const stok = Array.isArray(varian.stok) ? varian.stok.length : 0
  const total = order.qty * order.price

  const text =
`<b>KONFIRMASI PEMBAYARAN 💰</b>
╭ - - - - - - - - - - - - - - - - - - - - - ╮
┊ Produk: ${produk.nama}
┊ Variasi: ${varian.nama}
┊ Harga satuan: Rp ${order.price.toLocaleString('id-ID')}
┊ Stok tersedia: ${stok}
┊ - - - - - - - - - - - - - - - - - - - - -
┊ Jumlah Pesanan: x${order.qty}
┊ Total Pembayaran: Rp ${total.toLocaleString('id-ID')}
╰ - - - - - - - - - - - - - - - - - - - - - ╯

<b>Yakin ingin melanjutkan pembayaran dengan saldo?</b>`

  const buttons = Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ YA, BAYAR', 'PAY_SALDO_YES'),
      Markup.button.callback('❌ BATAL', 'PAY_SALDO_NO')
    ]
  ])

  if (edit && ctx.update?.callback_query) {
    return ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: buttons.reply_markup
    })
  }

  return ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: buttons.reply_markup
  })
}