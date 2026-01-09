import { mainReplyKeyboard } from '../lib/productKeyboard.js'
import { getTotalProdukTerjual } from '../lib/helper.js'

export default {
  command: ['start'],
  run: async ({ ctx }) => {
    const id = ctx.from.id
    const name = ctx.from.first_name || 'User'
    const username = ctx.from.username ? '@' + ctx.from.username : '-'

    global.db.users ??= {}
    global.db.stats ??= { totalUser: 0 }

    if (!global.db.users[id]) {
      global.db.users[id] = {
        id,
        name,
        username,
        saldo: 0,
        totalTransaksi: 0,
        command: 0,
        premium: false,
        registered: true,
        joinAt: Date.now()
      }
      global.db.stats.totalUser++
    }

    const user = global.db.users[id]

    const now = new Date()
    const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }).format(now)
    const tanggal = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now)
    const waktu = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' }).format(now)

    const text =
`Halo ${name} 👋🏼
<b>${hari}, ${tanggal} ${waktu}</b>

<b>User Info :</b>
└ <b>ID :</b> ${id}
└ <b>Username :</b> ${username}
└ <b>Transaksi :</b> ${user.totalTransaksi}
└ <b>Saldo Pengguna :</b> Rp ${user.saldo.toLocaleString('id-ID')}

<b>BOT Stats :</b>
└ <b>Terjual :</b> ${getTotalProdukTerjual()} pcs
└ <b>Total User :</b> ${Object.keys(global.db.users).length}

${global.wm}`

    await ctx.replyWithPhoto(
      { url: global.banner },
      {
        caption: text,
        parse_mode: 'HTML',
        reply_markup: mainReplyKeyboard(ctx).reply_markup
      }
    )
  }
}