import fs from 'fs-extra'
import chalk from 'chalk'
import { Telegraf } from 'telegraf'
import handler from './handler.js'
import './config.js'

const DB_FILE = './database.json'

// ===== DEFAULT DATABASE SCHEMA =====
const defaultDB = {
  users: {},
  stats: {
    totalCommand: 0,
    totalUser: 0,
    totalTransaksi: 0,
    produkTerjual: 0
  },
  produk: {},
  transaksi: {}
}

// ===== LOAD / CREATE DATABASE =====
if (!fs.existsSync(DB_FILE)) {
  global.db = structuredClone(defaultDB)
  fs.writeJsonSync(DB_FILE, global.db, { spaces: 2 })
  console.log(chalk.green('[DATABASE] database.json berhasil dibuat'))
} else {
  const data = fs.readJsonSync(DB_FILE)

  // ===== AUTO REPAIR DATABASE =====
  global.db = {
    users: data.users ?? {},
    stats: {
      totalCommand: data.stats?.totalCommand ?? 0,
      totalUser: data.stats?.totalUser ?? Object.keys(data.users ?? {}).length,
      totalTransaksi: data.stats?.totalTransaksi ?? 0,
      produkTerjual: data.stats?.produkTerjual ?? 0
    },
    produk: data.produk ?? {},
    transaksi: data.transaksi ?? {}
  }

  console.log(chalk.blue('[DATABASE] database.json berhasil dimuat'))
}

// ===== AUTOSAVE DATABASE =====
setInterval(() => {
  fs.writeJsonSync(DB_FILE, global.db, { spaces: 2 })
}, 10_000)

// ===== BOT INIT =====
const bot = new Telegraf(global.token)

// ===== USER MIDDLEWARE =====
bot.use(async (ctx, next) => {
  if (!ctx.from) return next()

  const id = ctx.from.id

  if (!global.db.users[id]) {
    global.db.users[id] = {
      id,
      name: ctx.from.first_name,
      username: ctx.from.username ? '@' + ctx.from.username : '-',
      saldo: 0,
      totalTransaksi: 0,
      command: 0,
      premium: false,
      registered: false,
      joinAt: Date.now()
    }

    global.db.stats.totalUser++
  }

  return next()
})

// ===== LOAD HANDLER =====
handler(bot)

// ===== START BOT =====
bot.launch()
console.log(chalk.green(`[BOT] ${global.botname} berhasil dijalankan`))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))