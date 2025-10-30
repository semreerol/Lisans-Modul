require('dotenv').config(); // .env dosyasını Electron içinde farklı ele alacağız, şimdilik dursun.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const takipRoutes = require('./src/routes/takipRoutes');
const cron = require('node-cron');
const { checkAndSendReminders } = require('./src/controllers/takipController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// CORS kaldırıldı, Electron içinde aynı kaynaktan erişim olacağı için gerekmez
// const cors = require('cors');
// app.use(cors()); 

// Rota tanımları
app.use('/api/takip', takipRoutes);

// Her gün sabah 9'da hatırlatma kontrolü (Email servisi aktifse kullanılabilir)
// cron.schedule('0 9 * * *', () => {
//   console.log('Günlük hatırlatma kontrolü tetiklendi.');
//   checkAndSendReminders();
// });

app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor (SQLite ile).`);
});