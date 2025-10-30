const nodemailer = require('nodemailer');

// Gmail için "Uygulama Şifresi" kullanacağız.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendReminderEmail = async (isim, bitis_tarihi, alici_email) => {
  const mailOptions = {
    from: `"Takip Uygulaması" <${process.env.EMAIL_USER}>`,
    to: alici_email, 
    subject: 'Sözleşme Bitiş Tarihi Hatırlatması',
    html: `
      <h3>Merhaba ${isim},</h3>
      <p>Bu bir hatırlatma e-postasıdır.</p>
      <p>Sözleşmenizin bitiş tarihi olan <b>${new Date(bitis_tarihi).toLocaleDateString('tr-TR')}</b> tarihine 30 günden az kalmıştır.</p>
      <p>İyi günler dileriz.</p>
    `,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`E-posta başarıyla gönderildi: ${alici_email}, Mesaj ID: ${info.messageId}`);
    return true; 
  } catch (error) {
    console.error(`E-posta gönderilirken hata oluştu: ${alici_email}`, error);
    return false; 
  }
};

module.exports = { sendReminderEmail };
