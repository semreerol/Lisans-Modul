const pool = require('../config/db');
const { sendReminderEmail } = require('../services/emailService');

const getAllTakip = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM takip_listesi ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Kayıtları çekerken hata:', err);
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
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Kayıt eklerken hata:', err);
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
      SET isim = $1, giris_tarihi = $2, bitis_tarihi = $3, firma_ismi = $4, iletisim = $5, durum = $6
      WHERE id = $7 
      RETURNING *;
    `;
    const values = [isim, giris_tarihi, bitis_tarihi, firma_ismi, iletisim, durum, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Güncellenecek kayıt bulunamadı.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Kayıt güncellerken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const deleteTakip = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM takip_listesi WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Silinecek kayıt bulunamadı.' });
    }
    res.status(200).json({ message: 'Kayıt başarıyla silindi.' });
  } catch (err) {
    console.error('Kayıt silerken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const checkAndSendReminders = async () => {
  console.log('Günlük hatırlatma kontrolü başladı...');
  try {
    const query = `
      SELECT * FROM takip_listesi
      WHERE bitis_tarihi <= CURRENT_DATE + INTERVAL '30 days'
      AND bitis_tarihi >= CURRENT_DATE
      AND durum = 'Aktif'
    `;
    const { rows: kayitlar } = await pool.query(query);
    if (kayitlar.length === 0) {
      console.log("Durumu 'Aktif' olan ve son 30 gün içinde süresi dolacak kayıt bulunamadı.");
      return;
    }
    console.log(`${kayitlar.length} adet kayda hatırlatma gönderilecek...`);
    for (const kayit of kayitlar) {
      const alici_email = process.env.EMAIL_USER;
      await sendReminderEmail(kayit.isim, kayit.bitis_tarihi, alici_email);
    }
  } catch (error) {
    console.error('Hatırlatma kontrolü sırasında bir hata oluştu:', error);
  }
};

const deleteMultipleTakip = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Silinecek kayıt IDleri sağlanmadı.' });
    }
    const query = 'DELETE FROM takip_listesi WHERE id = ANY($1)';
    const result = await pool.query(query, [ids]);
    res.status(200).json({ message: `${result.rowCount} adet kayıt başarıyla silindi.` });
  } catch (err) {
    console.error('Toplu silme sırasında hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = {
  getAllTakip,
  createTakip,
  updateTakip,
  deleteTakip,
  checkAndSendReminders,
  deleteMultipleTakip,
};