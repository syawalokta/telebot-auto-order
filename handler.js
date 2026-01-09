import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

import { isRowner, isOwner, isPremium, isAdmin } from './lib/helper.js'
import { showProductPage, showProductDetail } from './lib/product.js'
import { productReplyKeyboard } from './lib/productKeyboard.js'
import { showConfirmOrder, showConfirmSaldo } from './lib/order.js'
import { DB } from './lib/database.js'
import { processPaySaldo } from './lib/saldo-processor.js'
import {
  showHistoryMenu,
  showLastTransactions,
  sendAllHistory
} from './lib/transaction-history.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TMP_DIR = path.join(process.cwd(), '.tmp')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

export default async function handler(bot) {
  const pluginDir = path.join(__dirname, 'plugins')
  const plugins = []

  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'))
  for (const file of files) {
    try {
      const mod = await import(path.join(pluginDir, file))
      if (mod.default) {
        plugins.push(mod.default)
        console.log(chalk.cyan('[PLUGIN] Loaded:'), file)
      }
    } catch (e) {
      console.error('[PLUGIN ERROR]', file, e)
    }
  }

  bot.on('message', async ctx => {
    try {
      if (!ctx.from) return

      const body = ctx.message.text || ctx.message.caption || ''
      if (!body) return

      const userId = ctx.from.id

      // LIST PRODUK
      if (body === '📦 List Produk') {
        await ctx.reply('📦 Silakan pilih ID produk:', {
          reply_markup: productReplyKeyboard(ctx).reply_markup
        })
        return showProductPage(ctx, 1)
      }

      // RIWAYAT TRANSAKSI
      if (body === '📄 Riwayat Transaksi') {
        return showHistoryMenu(ctx)
      }

      // PILIH PRODUK DARI ANGKA
      if (/^\d+$/.test(body)) {
        const productId = Number(body)
        if (DB.produk[productId]) {
          return showProductDetail(ctx, productId)
        }
      }

      // COMMAND PREFIX
      const prefix = global.prefix.find(p => body.startsWith(p))
      if (!prefix) return

      const args = body.slice(prefix.length).trim().split(/ +/)
      const command = args.shift().toLowerCase()

      for (const plugin of plugins) {
        if (!plugin.command?.includes(command)) continue

        if (plugin.rowner && !isRowner(userId)) return ctx.reply(global.message.rowner)
        if (plugin.owner && !isOwner(userId)) return ctx.reply(global.message.owner)
        if (plugin.premium && !isPremium(userId)) return ctx.reply(global.message.premium)
        if (plugin.group && ctx.chat.type === 'private') return ctx.reply(global.message.group)
        if (plugin.private && ctx.chat.type !== 'private') return ctx.reply(global.message.private)
        if (plugin.admin && !(await isAdmin(ctx))) return ctx.reply(global.message.admin)

        console.log(chalk.yellow('[CMD]'), command, 'from', ctx.from.username || userId)
        return plugin.run({ bot, ctx, args })
      }
    } catch (err) {
      console.error('[MESSAGE ERROR]', err)
      ctx.reply(global.message.error)
    }
  })

  // PRODUK PAGINATION
  bot.action(/PRODUK_PAGE_(\d+)/, async ctx => {
    await ctx.answerCbQuery()
    await showProductPage(ctx, Number(ctx.match[1]))
  })

  // DETAIL PRODUK
  bot.action(/REFRESH_PRODUK_(\d+)/, async ctx => {
    await ctx.answerCbQuery()
    await showProductDetail(ctx, Number(ctx.match[1]), true)
  })

  // ORDER
  bot.action(/ORDER_(\d+)_(\d+)/, async ctx => {
    await ctx.answerCbQuery()

    const userId = ctx.from.id
    const productId = Number(ctx.match[1])
    const varId = Number(ctx.match[2])

    const variasi = DB.variasi[varId]
    if (!variasi) return

    DB.order[userId] = {
      productId,
      varId,
      qty: 1,
      price: variasi.harga
    }

    DB.saveOrder()
    await showConfirmOrder(ctx, userId, true)
  })

  // QTY
  bot.action(/QTY_(ADD|MIN)_(\d+)/, async ctx => {
    await ctx.answerCbQuery()

    const order = DB.order[ctx.from.id]
    if (!order) return

    const variasi = DB.variasi[order.varId]
    if (!variasi) return

    const stok = Array.isArray(variasi.stok) ? variasi.stok.length : 0
    if (stok <= 0) return

    const val = Number(ctx.match[2])
    order.qty =
      ctx.match[1] === 'ADD'
        ? Math.min(order.qty + val, stok)
        : Math.max(order.qty - val, 1)

    DB.saveOrder()
    await showConfirmOrder(ctx, ctx.from.id, true)
  })

  bot.action('REFRESH_ORDER', async ctx => {
    await ctx.answerCbQuery()
    if (DB.order[ctx.from.id]) {
      await showConfirmOrder(ctx, ctx.from.id, true)
    }
  })

  bot.action('BACK_VARIASI', async ctx => {
    await ctx.answerCbQuery()
    const order = DB.order[ctx.from.id]
    if (!order) return

    delete DB.order[ctx.from.id]
    DB.saveOrder()
    await showProductDetail(ctx, order.productId, true)
  })

  // BAYAR SALDO
  bot.action('PAY_SALDO', async ctx => {
    await ctx.answerCbQuery()
    if (DB.order[ctx.from.id]) {
      await showConfirmSaldo(ctx, ctx.from.id, true)
    }
  })

  bot.action('PAY_SALDO_NO', async ctx => {
    await ctx.answerCbQuery()
    if (DB.order[ctx.from.id]) {
      await showConfirmOrder(ctx, ctx.from.id, true)
    }
  })

  bot.action('PAY_SALDO_YES', async ctx => {
    await ctx.answerCbQuery()
    await processPaySaldo(ctx)
  })

  // RIWAYAT TRANSAKSI
  bot.action('HISTORY_BUY', async ctx => {
    await ctx.answerCbQuery()
    await showLastTransactions(ctx)
  })

  bot.action('HISTORY_DEPOSIT', async ctx => {
    await ctx.answerCbQuery()
    await ctx.reply('Riwayat deposit belum tersedia.')
  })

  bot.action('HISTORY_ALL', async ctx => {
    await ctx.answerCbQuery()
    await sendAllHistory(ctx)
  })
}