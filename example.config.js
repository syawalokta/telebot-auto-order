import fs from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.token = ""  //token bot tele
global.botname = "VoltraBotz" //nama bot
global.ownername = "Oktodev"
global.ownerid = ["6807264289"]   // Owner bot
global.rowner  = ["6807264289"]   // Real owner (super owner)
global.premid  = "6807264289"     // Default premium user
global.prefix = ["/", ".", "#", "!"]
global.wib = 7
global.wait = "Tunggu Sebentar..."
global.wm = "© VoltraBotz"
global.MAX_CAPTION_LENGTH = 3900

global.limit = 10 // Limit harian user free

//image 
global.banner = 'https://files.catbox.moe/yj2evm.jpg'

// GLOBAL MESSAGE
global.message = {
  rowner:  "Perintah ini hanya dapat digunakan oleh OWNER!",
  owner:   "Perintah ini hanya dapat digunakan oleh Owner Bot!",
  premium: "Perintah ini hanya untuk user Premium!",
  group:   "Perintah ini hanya dapat digunakan di grup!",
  private: "Perintah ini hanya dapat digunakan di private chat!",
  admin:   "Perintah ini hanya dapat digunakan oleh admin grup!",
  error:   "Terjadi kesalahan, coba lagi nanti."
}


// apikey
global.btc      = ''
global.aksesKey = ''
global.lann     = '' //opsional
global.oktodev  = 'oktodev' //jangan di ubah

global.APIs = {
  btc:     'https://api.botcahx.eu.org',
  lann:    'https://api.betabotz.eu.org',
  oktodev: 'https://api.oktodev.me'
}

global.APIKeys = {
  'https://api.botcahx.eu.org': global.btc,
  'https://api.betabotz.eu.org': global.lann,
  'https://api.oktodev.me': global.oktodev
}

//========= PAYMENT GATEWAY =========\\
global.OrderKuota = {
  apikey: 'oktodev', //jangan di ubah
  username: '', //username orkut
  api_token: '' //token orkut
}


// AUTO RELOAD
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${__filename}?update=${Date.now()}`)
})