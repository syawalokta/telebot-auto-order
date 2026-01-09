import { DB } from '../lib/database.js'

export default {
  command: ['addstokbulk'],
  owner: true,
  run: async ({ ctx, args }) => {
    const idVar = args.shift()
    const password = args.shift()
    const emails = args

    if (!idVar || !password || emails.length === 0) {
      return ctx.reply(
        '❌ Format salah!\n\n' +
        'Contoh:\n/addstokbulk idvariasi,password email1@gmail.com email2@gmail.com'
      )
    }

    const varId = Number(idVar)
    if (isNaN(varId)) {
      return ctx.reply('❌ ID variasi harus berupa angka')
    }

    // ===============================
    // VALIDASI VARIASI
    // ===============================
    const foundVar = DB.variasi[varId]
    if (!foundVar) {
      return ctx.reply('❌ Variasi tidak ditemukan')
    }

    const foundProduk = DB.produk[foundVar.productId]
    if (!foundProduk) {
      return ctx.reply('❌ Produk dari variasi ini tidak ditemukan')
    }

    // ===============================
    // PASTIKAN STOK ARRAY
    // ===============================
    if (!Array.isArray(foundVar.stok)) {
      foundVar.stok = []
    }

    // ===============================
    // FILTER EMAIL VALID
    // ===============================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validEmails = emails.filter(e => emailRegex.test(e))

    if (validEmails.length === 0) {
      return ctx.reply('❌ Tidak ada email valid ditemukan')
    }

    let added = 0
    let skipped = 0

    // ===============================
    // TAMBAH BULK AKUN
    // ===============================
    for (const email of validEmails) {
      if (foundVar.stok.some(s => s.email === email)) {
        skipped++
        continue
      }

      foundVar.stok.push({
        email,
        password,
        desc: ''
      })
      added++
    }

    DB.saveVariasi()

    ctx.reply(
      `✅ Bulk stok selesai!\n\n` +
      `Produk   : ${foundProduk.nama}\n` +
      `Variasi  : ${foundVar.nama}\n` +
      `ID Var   : ${foundVar.id}\n` +
      `Password: ${password}\n\n` +
      `Berhasil: ${added}\n` +
      `Duplikat: ${skipped}\n` +
      `Total Stok: ${foundVar.stok.length}`
    )
  }
}