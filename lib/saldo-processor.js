import fs from 'fs'
import path from 'path'
import { DB } from './database.js'

const TMP_DIR = path.join(process.cwd(), '.tmp')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

export async function processPaySaldo(ctx) {
  const userId = ctx.from.id
  const order = DB.order[userId]
  if (!order) return

  const user = global.db.users[userId]
  const produk = DB.produk[order.productId]
  const varian = DB.variasi[order.varId]
  const total = order.qty * order.price

  // ❌ SALDO KURANG
  if (user.saldo < total) {
    return ctx.answerCbQuery(
`Saldo tidak mencukupi.
Saldo Anda: Rp ${user.saldo.toLocaleString('id-ID')}`,
      { show_alert: true }
    )
  }

  // ✅ AMBIL AKUN
  const akun = varian.stok.splice(0, order.qty)

  // POTONG SALDO & UPDATE DATA
  user.saldo -= total
  user.totalTransaksi++
  produk.terjual += order.qty

  const trxId = `VOLTRA-${Date.now()}`

  DB.transaksi[trxId] = {
    id: trxId,
    userId,
    productId: produk.id,
    varId: varian.id,
    qty: order.qty,
    total,
    metode: 'saldo',
    akun,
    waktu: Date.now()
  }

  DB.saveProduk()
  DB.saveVariasi()
  DB.saveTransaksi()
  delete DB.order[userId]
  DB.saveOrder()

  // 📄 KIRIM FILE AKUN
  for (let i = 0; i < akun.length; i++) {
    const filePath = path.join(TMP_DIR, `${trxId}-${i + 1}.txt`)

    fs.writeFileSync(
      filePath,
      `Email: ${akun[i].email}\nPassword: ${akun[i].password}`
    )

    await ctx.replyWithDocument(
      { source: filePath },
      { caption: `ORDER #${trxId}` }
    )

    fs.unlinkSync(filePath)
  }

  // ✅ PESAN SUKSES
  await ctx.reply(
`<b>PEMBAYARAN BERHASIL ✅</b>

Produk : ${produk.nama}
Variasi: ${varian.nama}
Jumlah : ${order.qty}
Total  : Rp ${total.toLocaleString('id-ID')}

ID Transaksi:
${trxId}`,
    { parse_mode: 'HTML' }
  )
}