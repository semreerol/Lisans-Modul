const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Production'da asar içi yazılamaz. Electron ana süreçten APP_DATA_DIR iletilecek.
// Development'ta mevcut ../../data klasörü kullanılmaya devam eder.
const baseDataDir = process.env.APP_DATA_DIR
    ? path.join(process.env.APP_DATA_DIR, 'data')
    : path.resolve(__dirname, '../../data');

const dbPath = path.join(baseDataDir, 'takip.db');
const dbDir = path.dirname(dbPath);

// Eğer 'data' klasörü yoksa oluştur
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Veritabanı bağlantısını oluştur
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite veritabanına bağlanırken hata oluştu:', err.message);
    } else {
        console.log('SQLite veritabanına başarıyla bağlanıldı: ' + dbPath);
        // Tabloları oluştur
        db.run(`
            CREATE TABLE IF NOT EXISTS takip_listesi (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                isim TEXT NOT NULL,
                giris_tarihi TEXT NOT NULL,
                bitis_tarihi TEXT NOT NULL,
                firma_ismi TEXT,
                iletisim TEXT,
                durum TEXT DEFAULT 'Aktif'
            )
        `, (err) => {
            if (err) {
                console.error('Tablo oluşturulurken hata:', err.message);
            } else {
                console.log('Takip listesi tablosu başarıyla kontrol edildi/oluşturuldu.');
            }
        });
    }
});

module.exports = db;