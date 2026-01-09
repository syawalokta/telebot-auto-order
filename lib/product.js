import { Markup } from 'telegraf'
import { DB } from './database.js'

// ===============================
// LIST PRODUK (PAGINATION - DELETE + SEND)
// ===============================
export async function showProductPage(ctx, page = 1) {
  const userId = ctx.from.id
  global.db.ui ??= {}

  // hapus pesan list produk lama
  const lastMsgId = global.db.ui[userId]?.productMessageId
  if (lastMsgId) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, lastMsgId)
    } catch {}
  }

  const products = Object.values(DB.produk)
    .sort((a, b) => a.id - b.id)

  const perPage = 15
  const totalPage = Math.max(1, Math.ceil(products.length / perPage))

  if (page < 1) page = 1
  if (page > totalPage) page = totalPage

  const start = (page - 1) * perPage
  const pageItems = products.slice(start, start + perPage)

  let text =
`╭ - - - - - - - - - - - - - - - - - - - ╮
┊  LIST PRODUK
┊  page ${page} / ${totalPage}
┊- - - - - - - - - - - - - - - - - - - - -
`

  if (pageItems.length === 0) {
    text += `┊ (Belum ada produk)\n`
  } else {
    for (const p of pageItems) {
      text += `┊ <b>[${p.id}] ${p.nama}</b>\n`
    }
  }

  text +=
`╰ - - - - - - - - - - - - - - - - - - - ╯
${global.wm}`

  const buttons = []
  if (page > 1) {
    buttons.push(Markup.button.callback('⬅ Sebelumnya', `PRODUK_PAGE_${page - 1}`))
  }
  if (page < totalPage) {
    buttons.push(Markup.button.callback('➡ Selanjutnya', `PRODUK_PAGE_${page + 1}`))
  }

  const sent = await ctx.replyWithPhoto(
    { url: global.banner },
    {
      caption: text,
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard(buttons).reply_markup
    }
  )

  // simpan message list produk
  global.db.ui[userId] = {
    productMessageId: sent.message_id
  }
}

// ===============================
// DETAIL PRODUK + VARIASI (SEND / EDIT)
// ===============================
export async function showProductDetail(ctx, productId, edit = false) {
  const produk = DB.produk[productId]

  if (!produk) {
    if (edit) {
      return ctx.answerCbQuery('Produk tidak ditemukan', { show_alert: true })
    }
    return ctx.reply('❌ Produk tidak ditemukan')
  }

  // ambil variasi berdasarkan productId
  const variasiList = Object.values(DB.variasi)
    .filter(v => v.productId === produk.id)

  let text =
`╭ - - - - - - - - - - - - - - - - - - - - - ╮
┊・ Produk: <b>${produk.nama}</b>
┊・ Stok Terjual: ${produk.terjual}
┊・ Desk: ${produk.deskripsi}
╰ - - - - - - - - - - - - - - - - - - - - - ╯

 Variasi, Harga & Stok:
`

  const buttons = []

  if (variasiList.length === 0) {
    text += `\n(Belum ada variasi)\n`
  } else {
    variasiList.forEach((v, i) => {
      const stok = Array.isArray(v.stok) ? v.stok.length : 0

      text +=
`${i + 1}. ${v.nama}
   harga: Rp. ${v.harga.toLocaleString('id-ID')}
   stok: ${stok}\n\n`

      buttons.push([
        Markup.button.callback(v.nama, `ORDER_${produk.id}_${v.id}`)
      ])
    })
  }

  const waktu = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(new Date())

  text += `➤ Refresh at ${waktu}`

  buttons.push([
    Markup.button.callback('🔄 Refresh', `REFRESH_PRODUK_${produk.id}`)
  ])

  const payload = {
    parse_mode: 'HTML',
    reply_markup: Markup.inlineKeyboard(buttons).reply_markup
  }

  // EDIT atau KIRIM BARU
  if (edit && ctx.update?.callback_query) {
    return ctx.editMessageText(text, payload)
  }

  return ctx.reply(text, payload)
}