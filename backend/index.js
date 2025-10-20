const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
// .env dosyasındaki değişkenleri process.env'e yüklemek için require('dotenv').config() en başta olmalı
require('dotenv').config(); 

const takipRoutes = require('./src/routes/takipRoutes');
const { checkAndSendReminders } = require('./src/controllers/takipController');

const app = express();
const port = process.env.PORT || 5000;

// Ara Yazılımlar (Middleware)
app.use(cors());
app.use(express.json());

app.use('/api/takip', takipRoutes);

// Ana Endpoint
app.get('/', (req, res) => {
  res.send('Takip Uygulaması Backend Sunucusu Çalışıyor!');
});

// Zamanlanmış Görev (Cron Job)
// Her gün sabah saat 09:00'da çalışacak şekilde ayarlandı.
// ('0 9 * * *' -> dakika: 0, saat: 9, gün: her gün, ay: her ay, hafta: her gün)
cron.schedule('0 9 * * *', () => {
  console.log('Zamanlanmış görev çalışıyor: E-posta hatırlatmaları kontrol edilecek.');
  checkAndSendReminders();
}, {
  scheduled: true,
  timezone: "Europe/Istanbul"
});


// Sunucuyu Başlatma
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde başlatıldı.`);
  console.log('E-posta hatırlatma servisi her sabah 09:00 için zamanlandı.');
  // Sunucu başlar başlamaz bir kerelik test için aşağıdaki satırı aktif edebilirsiniz.
  checkAndSendReminders(); 
});

