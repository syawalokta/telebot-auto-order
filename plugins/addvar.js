import { DB } from '../lib/database.js'

export default {
  command: ['addvar', 'addvariasi'],
  owner: true,
  run: async ({ ctx, args }) => {
    const text = args.join(' ')
    const [idProduk, nama, harga] = text.split(',').map(v => v?.trim())

    if (!idProduk || !nama || !harga) {
      return ctx.reply(
        '❌ Format salah!\n\n' +
        'Contoh:\n/addvar 1, Basic, 10000'
      )
    }

    const productId = Number(idProduk)
    const price = Number(harga)

    if (isNaN(productId) || isNaN(price)) {
      return ctx.reply('❌ ID produk dan harga harus berupa angka')
    }

    // ===============================
    // VALIDASI PRODUK
    // ===============================
    const produk = DB.produk[productId]
    if (!produk) {
      return ctx.reply('❌ Produk tidak ditemukan')
    }

    // ===============================
    // GENERATE ID VARIASI (GLOBAL)
    // ===============================
    const ids = Object.keys(DB.variasi).map(Number)
    const newVarId = ids.length ? Math.max(...ids) + 1 : 1

    DB.variasi[newVarId] = {
      id: newVarId,
      productId,
      nama,
      harga: price,
      stok: [] // WAJIB array
    }

    DB.saveVariasi()

    ctx.reply(
      `✅ Variasi berhasil ditambahkan!\n\n` +
      `Produk   : ${produk.nama}\n` +
      `ID Var   : ${newVarId}\n` +
      `Nama     : ${nama}\n` +
      `Harga    : Rp. ${price.toLocaleString('id-ID')}\n` +
      `Stok     : 0`
    )
  }
}