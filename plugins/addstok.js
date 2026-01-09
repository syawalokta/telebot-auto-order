import { DB } from '../lib/database.js'

export default {
  command: ['addstok'],
  owner: true,
  run: async ({ ctx, args }) => {
    const text = args.join(' ')
    const [idVar, email, password, desc = ''] = text
      .split(',')
      .map(v => v?.trim())

    if (!idVar || !email || !password) {
      return ctx.reply(
        '❌ Format salah!\n\n' +
        'Contoh:\n/addstok idvariasi,email@gmail.com,password,deskripsi (opsional)'
      )
    }

    const varId = Number(idVar)
    if (isNaN(varId)) {
      return ctx.reply('❌ ID variasi harus berupa angka')
    }

    // ===============================
    // VALIDASI EMAIL
    // ===============================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return ctx.reply('❌ Email tidak valid')
    }

    // ===============================
    // AMBIL VARIASI & PRODUK (DB BARU)
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
    // CEK DUPLIKAT EMAIL
    // ===============================
    if (foundVar.stok.some(s => s.email === email)) {
      return ctx.reply('❌ Email sudah ada di stok')
    }

    // ===============================
    // TAMBAH AKUN KE STOK
    // ===============================
    foundVar.stok.push({
      email,
      password,
      desc
    })

    DB.saveVariasi()

    ctx.reply(
      `✅ Akun berhasil ditambahkan!\n\n` +
      `Produk   : ${foundProduk.nama}\n` +
      `Variasi  : ${foundVar.nama}\n` +
      `ID Var   : ${foundVar.id}\n` +
      `Email    : ${email}\n` +
      `Password : ${password}\n` +
      `Total Stok: ${foundVar.stok.length}`
    )
  }
}