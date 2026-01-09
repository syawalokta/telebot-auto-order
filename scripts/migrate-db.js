/**
 * MIGRASI DATABASE LAMA → BARU
 * Jalankan SEKALI saja
 *
 * node scripts/migrate-db.js
 */

import fs from 'fs'
import path from 'path'

// PATH
const OLD_DB = './database.json'
const NEW_DB_DIR = './database'

const PRODUK_FILE = path.join(NEW_DB_DIR, 'data-produk.json')
const VARIASI_FILE = path.join(NEW_DB_DIR, 'data-variasi.json')
const ORDER_FILE = path.join(NEW_DB_DIR, 'data-order.json')
const TRANSAKSI_FILE = path.join(NEW_DB_DIR, 'data-transaksi.json')

// VALIDASI FILE LAMA
if (!fs.existsSync(OLD_DB)) {
  console.error('❌ database.json tidak ditemukan')
  process.exit(1)
}

// LOAD DB LAMA
const oldDb = JSON.parse(fs.readFileSync(OLD_DB))
const oldProduk = oldDb.produk || {}

if (!fs.existsSync(NEW_DB_DIR)) {
  fs.mkdirSync(NEW_DB_DIR)
}

// CONTAINER BARU
const produkBaru = {}
const variasiBaru = {}

// MIGRASI
for (const [pid, produk] of Object.entries(oldProduk)) {
  // ---- PRODUK ----
  produkBaru[pid] = {
    id: produk.id,
    nama: produk.nama,
    deskripsi: produk.deskripsi,
    terjual: produk.terjual || 0
  }

  // ---- VARIASI ----
  for (const v of Object.values(produk.variasi || {})) {
    variasiBaru[v.id] = {
      id: v.id,
      productId: produk.id,
      nama: v.nama,
      harga: v.harga,
      stok: Array.isArray(v.stok) ? v.stok : []
    }
  }
}

// TULIS FILE BARU
fs.writeFileSync(PRODUK_FILE, JSON.stringify(produkBaru, null, 2))
fs.writeFileSync(VARIASI_FILE, JSON.stringify(variasiBaru, null, 2))

// order & transaksi (kosong dulu)
if (!fs.existsSync(ORDER_FILE)) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify({}, null, 2))
}
if (!fs.existsSync(TRANSAKSI_FILE)) {
  fs.writeFileSync(TRANSAKSI_FILE, JSON.stringify({}, null, 2))
}

console.log('✅ MIGRASI SELESAI')
console.log(`• Produk   : ${Object.keys(produkBaru).length}`)
console.log(`• Variasi  : ${Object.keys(variasiBaru).length}`)
console.log('• Order & Transaksi dibuat kosong')
console.log('\n⚠️ Jalankan script ini HANYA SEKALI!')