const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const baseDataDir = process.env.APP_DATA_DIR
    ? path.join(process.env.APP_DATA_DIR, 'data')
    : path.resolve(__dirname, '../../data');

const dbPath = path.join(baseDataDir, 'takip.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite veritabanına bağlanırken hata oluştu:', err.message);
    } else {
        console.log('SQLite veritabanına başarıyla bağlanıldı: ' + dbPath);
        
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
