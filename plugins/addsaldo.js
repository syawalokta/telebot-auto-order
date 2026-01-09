export default {
  command: ['addsaldo'],
  owner: true,
  run: async ({ ctx, args }) => {
    let targetId
    let amount

    // ===============================
    // MODE REPLY
    // ===============================
    if (ctx.message.reply_to_message) {
      targetId = ctx.message.reply_to_message.from.id
      amount = Number(args[0])
    } 
    // ===============================
    // MODE MANUAL (id,amount)
    // ===============================
    else {
      const text = args.join(' ')
      if (!text.includes(',')) {
        return ctx.reply(
          '❌ Format salah!\n\n' +
          'Contoh:\n' +
          '/addsaldo 6807264289,50000\n\n' +
          'Atau reply pesan user:\n' +
          '/addsaldo 50000'
        )
      }

      const [id, saldo] = text.split(',').map(v => v.trim())
      targetId = Number(id)
      amount = Number(saldo)
    }

    if (!targetId || isNaN(amount)) {
      return ctx.reply('❌ ID user atau jumlah saldo tidak valid')
    }

    if (amount <= 0) {
      return ctx.reply('❌ Jumlah saldo harus lebih dari 0')
    }

    // ===============================
    // CEK USER
    // ===============================
    const user = global.db.users[targetId]
    if (!user) {
      return ctx.reply('❌ User tidak ditemukan di database')
    }

    // ===============================
    // TAMBAH SALDO
    // ===============================
    user.saldo ??= 0
    user.saldo += amount

    ctx.reply(
      `✅ Saldo berhasil ditambahkan!\n\n` +
      `User ID : ${targetId}\n` +
      `Nama    : ${user.name || '-'}\n` +
      `Tambah  : Rp ${amount.toLocaleString('id-ID')}\n` +
      `Saldo   : Rp ${user.saldo.toLocaleString('id-ID')}`
    )
  }
}