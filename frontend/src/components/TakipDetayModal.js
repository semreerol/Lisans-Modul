import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function TakipDetayModal({ item, isOpen, onRequestClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
    setIsEditing(false);
  }, [item]);

  if (!item) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    onUpdate(formData);
  };

  const getStatusColor = (durum) => {
    switch (durum) {
      case 'Aktif': return '#28a745';
      case 'Satın Alma Bekleniyor': return '#ffc107';
      case 'Pasif': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal-content" overlayClassName="modal-overlay">
      <div className="modal-header">
        <h2>{isEditing ? 'Kaydı Düzenle' : 'Kayıt Detayları'}</h2>
        <button onClick={onRequestClose} className="close-btn">&times;</button>
      </div>
      
      {isEditing ? (
        <div className="modal-body modal-form">
          <label>İsim</label>
          <input type="text" name="isim" value={formData.isim} onChange={handleInputChange} />
          <label>Firma İsmi</label>
          <input type="text" name="firma_ismi" value={formData.firma_ismi || ''} onChange={handleInputChange} />
          <label>İletişim</label>
          <input type="text" name="iletisim" value={formData.iletisim || ''} onChange={handleInputChange} />
          <label>Başlangıç Tarihi</label>
          <input type="date" name="giris_tarihi" value={new Date(formData.giris_tarihi).toISOString().split('T')[0]} onChange={handleInputChange} />
          <label>Bitiş Tarihi</label>
          <input type="date" name="bitis_tarihi" value={new Date(formData.bitis_tarihi).toISOString().split('T')[0]} onChange={handleInputChange} min={new Date(formData.giris_tarihi).toISOString().split('T')[0]}/>
          <label>Durum</label>
          <select name="durum" value={formData.durum} onChange={handleInputChange}>
            <option value="Aktif">Aktif</option>
            <option value="Satın Alma Bekleniyor">Satın Alma Bekleniyor</option>
            <option value="Pasif">Pasif</option>
          </select>
        </div>
      ) : (
        <div className="modal-body">
          <p><strong>İsim:</strong> {item.isim}</p>
          <p><strong>Firma:</strong> {item.firma_ismi || '-'}</p>
          <p><strong>İletişim:</strong> {item.iletisim || '-'}</p>
          <p><strong>Başlangıç Tarihi:</strong> {new Date(item.giris_tarihi).toLocaleDateString('tr-TR')}</p>
          <p><strong>Bitiş Tarihi:</strong> {new Date(item.bitis_tarihi).toLocaleDateString('tr-TR')}</p>
          <p><strong>Durum:</strong> 
            <span className="status-badge" style={{ backgroundColor: getStatusColor(item.durum), marginLeft: '10px' }}>
              {item.durum}
            </span>
          </p>
        </div>
      )}

      <div className="modal-footer">
        {isEditing ? (
          <>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">İptal</button>
            <button onClick={handleUpdate} className="submit-btn">Kaydet</button>
          </>
        ) : (
          <>
            <button onClick={() => onDelete(item.id)} className="delete-btn">Sil</button>
            <button onClick={() => setIsEditing(true)} className="edit-btn">Düzenle</button>
          </>
        )}
      </div>
    </Modal>
  );
}

export default TakipDetayModal;