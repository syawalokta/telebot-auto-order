import fs from 'fs'
import path from 'path'

const base = path.resolve('database')

// ===============================
// INTERNAL SAVE QUEUE (ANTI FREEZE)
// ===============================
const saveQueue = {}
const SAVE_DELAY = 300 // ms

function ensureDir() {
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true })
  }
}

ensureDir()

// ===============================
// LOAD FILE SAFELY
// ===============================
function load(file, fallback = {}) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
      return fallback
    }

    const raw = fs.readFileSync(file, 'utf-8').trim()

    if (!raw) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
      return fallback
    }

    return JSON.parse(raw)
  } catch (err) {
    console.error('[DB] Gagal load:', file)
    console.error(err.message)

    // backup file rusak
    try {
      fs.renameSync(file, file + '.broken')
    } catch {}

    fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
    return fallback
  }
}

// ===============================
// SAVE FILE (DEBOUNCED & NON-BLOCK)
// ===============================
function saveDebounced(file, data) {
  clearTimeout(saveQueue[file])

  saveQueue[file] = setTimeout(async () => {
    try {
      await fs.promises.writeFile(
        file,
        JSON.stringify(data, null, 2)
      )
    } catch (err) {
      console.error('[DB] Gagal save:', file)
      console.error(err)
    }
  }, SAVE_DELAY)
}

// ===============================
// DATABASE OBJECT
// ===============================
export const DB = {
  produk: load(path.join(base, 'data-produk.json'), {}),
  variasi: load(path.join(base, 'data-variasi.json'), {}),
  order: load(path.join(base, 'data-order.json'), {}),
  transaksi: load(path.join(base, 'data-transaksi.json'), {}),

  // ===== SAVE METHODS (SAFE) =====
  saveProduk() {
    saveDebounced(path.join(base, 'data-produk.json'), this.produk)
  },

  saveVariasi() {
    saveDebounced(path.join(base, 'data-variasi.json'), this.variasi)
  },

  saveOrder() {
    saveDebounced(path.join(base, 'data-order.json'), this.order)
  },

  saveTransaksi() {
    saveDebounced(path.join(base, 'data-transaksi.json'), this.transaksi)
  }
}