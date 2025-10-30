const db = require('../config/db'); 
const { sendReminderEmail } = require('../services/emailService'); 

const runAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this); 
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

const checkAndSendReminders = async () => {
    console.log('Hatırlatma kontrolü şimdilik devre dışı (SQLite uyarlaması gerekiyor).');
};

module.exports = {
    getAllTakip,
    createTakip,
    updateTakip,
    deleteTakip,
    checkAndSendReminders,
    deleteMultipleTakip,
};
