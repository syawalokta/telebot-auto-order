import { DB } from '../lib/database.js'

export default {
  command: ['deleteproduk', 'delproduk'],
  owner: true,
  run: async ({ ctx, args }) => {
    const productId = Number(args[0])

    if (!productId) {
      return ctx.reply(
        '❌ Masukkan ID produk\n\n' +
        'Contoh:\n/deleteproduk 1'
      )
    }

    // ===============================
    // VALIDASI PRODUK
    // ===============================
    const produk = DB.produk[productId]
    if (!produk) {
      return ctx.reply('❌ Produk tidak ditemukan')
    }

    const namaProduk = produk.nama

    // ===============================
    // HAPUS VARIASI TERKAIT
    // ===============================
    let deletedVar = 0
    for (const [varId, varData] of Object.entries(DB.variasi)) {
      if (varData.productId === productId) {
        delete DB.variasi[varId]
        deletedVar++
      }
    }

    // ===============================
    // HAPUS PRODUK
    // ===============================
    delete DB.produk[productId]

    DB.saveProduk()
    DB.saveVariasi()

    ctx.reply(
      `✅ Produk berhasil dihapus!\n\n` +
      `Produk : ${namaProduk}\n` +
      `ID     : ${productId}\n` +
      `Variasi terhapus: ${deletedVar}`
    )
  }
}