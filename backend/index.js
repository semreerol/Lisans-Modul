require('dotenv').config(); 
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

app.use('/api/takip', takipRoutes);

app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor (SQLite ile).`);
});
