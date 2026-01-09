import { DB } from '../lib/database.js'

export default {
  command: ['addproduk'],
  owner: true,
  run: async ({ ctx, args }) => {
    const text = args.join(' ')
    if (!text.includes(',')) {
      return ctx.reply(
        '❌ Format salah!\n\n' +
        'Contoh:\n/addproduk Nama Produk, Deskripsi produk'
      )
    }

    const [nama, deskripsi] = text.split(',').map(v => v.trim())

    if (!nama || !deskripsi) {
      return ctx.reply('❌ Nama produk dan deskripsi wajib diisi')
    }

    // ===============================
    // GENERATE ID PRODUK (URUT)
    // ===============================
    const ids = Object.keys(DB.produk).map(Number)
    const newId = ids.length ? Math.max(...ids) + 1 : 1

    DB.produk[newId] = {
      id: newId,
      nama,
      deskripsi,
      terjual: 0
    }

    DB.saveProduk()

    ctx.reply(
      `✅ Produk berhasil ditambahkan!\n\n` +
      `ID      : ${newId}\n` +
      `Nama    : ${nama}\n` +
      `Desk    : ${deskripsi}`
    )
  }
}