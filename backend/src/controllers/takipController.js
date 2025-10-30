const db = require('../config/db'); // SQLite bağlantısı
const { sendReminderEmail } = require('../services/emailService'); // Bu hala aynı, ama email servisini kullanmıyorsak kaldırabiliriz.

// SQLite için callback tabanlı çalışan bir yardımcı fonksiyon
// Promisify ederek async/await ile kullanabiliriz
const runAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this); // this objesi son eklenen ID'yi falan içerir
        });
    });
};

const allAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const getAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};


const getAllTakip = async (req, res) => {
    try {
        const query = 'SELECT * FROM takip_listesi ORDER BY id ASC';
        const rows = await allAsync(query);
        res.json(rows);
    } catch (err) {
        console.error('Kayıtları çekerken hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const createTakip = async (req, res) => {
    try {
        const { isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum } = req.body;
        if (!isim || !giris_tarihi || !bitis_tarihi) {
            return res.status(400).json({ error: 'İsim ve tarih alanları zorunludur.' });
        }
        if (new Date(bitis_tarihi) < new Date(giris_tarihi)) {
            return res.status(400).json({ error: 'Bitiş tarihi, başlangıç tarihinden önce olamaz.' });
        }

        const query = `
            INSERT INTO takip_listesi (isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const values = [isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum || 'Aktif'];
        const result = await runAsync(query, values);
        
        // SQLite'da son eklenen ID'yi almak için this.lastID kullanılır
        const newRecord = await getAsync('SELECT * FROM takip_listesi WHERE id = ?', [result.lastID]);
        res.status(201).json(newRecord);

    } catch (err) {
        console.error('Kayıt eklerken hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const updateTakip = async (req, res) => {
    try {
        const { id } = req.params;
        const { isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum } = req.body;
        if (new Date(bitis_tarihi) < new Date(giris_tarihi)) {
            return res.status(400).json({ error: 'Bitiş tarihi, başlangıç tarihinden önce olamaz.' });
        }

        const query = `
            UPDATE takip_listesi
            SET isim = ?, giris_tarihi = ?, bitis_tarihi = ?, firma_ismi = ?, iletisim = ?, durum = ?
            WHERE id = ?;
        `;
        const values = [isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum, id];
        const result = await runAsync(query, values);

        if (result.changes === 0) { // SQLite'da etkilenen satır sayısı result.changes ile alınır
            return res.status(404).json({ error: 'Güncellenecek kayıt bulunamadı.' });
        }
        const updatedRecord = await getAsync('SELECT * FROM takip_listesi WHERE id = ?', [id]);
        res.json(updatedRecord);

    } catch (err) {
        console.error('Kayıt güncellerken hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const deleteTakip = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM takip_listesi WHERE id = ?';
        const result = await runAsync(query, [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Silinecek kayıt bulunamadı.' });
        }
        res.status(200).json({ message: 'Kayıt başarıyla silindi.' });
    } catch (err) {
        console.error('Kayıt silerken hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const deleteMultipleTakip = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Silinecek kayıt IDleri sağlanmadı.' });
        }

        // SQLite'da IN operatörü
        const placeholders = ids.map(() => '?').join(', '); // ?, ?, ? şeklinde yer tutucular oluşturur
        const query = `DELETE FROM takip_listesi WHERE id IN (${placeholders});`;
        const result = await runAsync(query, ids);

        res.status(200).json({ message: `${result.changes} adet kayıt başarıyla silindi.` });
    } catch (err) {
        console.error('Toplu silme sırasında hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

// Reminder servisi PostgreSQL'e özgü tarih fonksiyonları kullanıyordu.
// SQLite için bu kısmı düzenlemeniz veya kaldırmanız gerekebilir.
// Bu rehberde, Electron uygulamasının internet bağlantısı olmadığı varsayımıyla,
// email reminder özelliğini şimdilik devre dışı bırakıyorum.
// Eğer istiyorsanız, SQLite'ın tarih fonksiyonlarına uygun hale getirmemiz gerekir.
const checkAndSendReminders = async () => {
    console.log('Hatırlatma kontrolü şimdilik devre dışı (SQLite uyarlaması gerekiyor).');
    // Eğer email hatırlatma özelliğini kullanmak istiyorsanız:
    /*
    console.log('Günlük hatırlatma kontrolü başladı...');
    try {
        const query = `
            SELECT * FROM takip_listesi
            WHERE bitis_tarihi <= DATE('now', '+30 days')
            AND bitis_tarihi >= DATE('now')
            AND durum = 'Aktif'
        `;
        const kayitlar = await allAsync(query);
        if (kayitlar.length === 0) { console.log("Uygun kayıt bulunamadı."); return; }
        for (const kayit of kayitlar) {
            const alici_email = process.env.EMAIL_USER; // Electron uygulamasında .env daha farklı ele alınmalı
            await sendReminderEmail(kayit.isim, kayit.bitis_tarihi, alici_email);
        }
    } catch (error) {
        console.error('Hatırlatma kontrolü sırasında bir hata oluştu:', error.message);
    }
    */
};

module.exports = {
    getAllTakip,
    createTakip,
    updateTakip,
    deleteTakip,
    checkAndSendReminders,
    deleteMultipleTakip,
};