import React, { useState } from 'react';

function TakipFormu({ onKayitEkle, onCancel }) {
  const [isim, setIsim] = useState('');
  const [girisTarihi, setGirisTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [firmaIsmi, setFirmaIsmi] = useState('');
  const [iletisim, setIletisim] = useState('');
  const [durum, setDurum] = useState('Aktif');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isim || !girisTarihi || !bitisTarihi) {
      alert('Lütfen isim ve tarih alanlarını doldurun!');
      return;
    }
    const success = await onKayitEkle({ isim, giris_tarihi: girisTarihi, bitis_tarihi: bitisTarihi, firma_ismi: firmaIsmi, iletisim: iletisim, durum: durum });

    if (success) {
      setIsim('');
      setGirisTarihi('');
      setBitisTarihi('');
      setFirmaIsmi('');
      setIletisim('');
      setDurum('Aktif');
    }
  };

  const handleGirisTarihiChange = (e) => {
    const yeniGirisTarihi = e.target.value;
    setGirisTarihi(yeniGirisTarihi);
    if (bitisTarihi && new Date(bitisTarihi) < new Date(yeniGirisTarihi)) {
      setBitisTarihi(yeniGirisTarihi);
    }
  };

  return (
    <div className="form-container">
      <h2>Yeni Kayıt Ekle</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px' }}>
        
        
        <input type="text" placeholder="Lisans İsmi" value={isim} onChange={(e) => setIsim(e.target.value)} />
        <input type="text" placeholder="Firma İsmi " value={firmaIsmi} onChange={(e) => setFirmaIsmi(e.target.value)} />
        <input type="text" placeholder="İletişim Bilgisi " value={iletisim} onChange={(e) => setIletisim(e.target.value)} />
        
        <label>Durum</label>
        <select value={durum} onChange={(e) => setDurum(e.target.value)}>
          <option value="Aktif">Aktif</option>
          <option value="Satın Alma Bekleniyor">Satın Alma Bekleniyor</option>
          <option value="Pasif">Pasif</option>
        </select>
        
        <label>Başlangıç Tarihi</label>
        <input type="date" value={girisTarihi} onChange={handleGirisTarihiChange} />
        
        <label>Bitiş Tarihi</label>
        <input type="date" value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} min={girisTarihi} />
        
        <div className="form-buttons">
          <button type="button" onClick={onCancel} className="cancel-btn-form">İptal</button>
          <button type="submit" className="submit-btn">Kaydet</button>
        </div>
      </form>
    </div>
  );
}

export default TakipFormu;