import React from 'react';

// Son eklenen onDeleteSelected prop'u da dahil edildi
function TakipListesi({ items, onItemClick, onAddNewClick, selectedItems, onSelectItem, onSelectAll, onDeleteSelected }) {
  
  const getStatusColor = (durum) => {
    switch (durum) {
      case 'Aktif':
        return '#28a745'; 
      case 'Satın Alma Bekleniyor':
        return '#ffc107'; 
      case 'Pasif':
        return '#dc3545'; 
      default:
        return '#6c757d'; 
    }
  };

  const handleCheckboxClick = (e, id) => {
    e.stopPropagation();
    onSelectItem(id);
  };

  return (
    <div className="list-container">
      <div className="list-header-container">
        <h2>Lİsans Takip Listesi</h2>
        <div className="list-actions">
          {selectedItems.length > 0 && (
            <button onClick={onDeleteSelected} className="delete-btn">
              Seçilenleri Sil ({selectedItems.length})
            </button>
          )}
          <button onClick={onAddNewClick} className="add-new-btn">Yeni</button>
        </div>
      </div>

      {items.length === 0 ? (
        <p>Henüz gösterilecek bir kayıt yok.</p>
      ) : (
        <>
          <div className="list-header">
            <span className="checkbox-column">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedItems.length === items.length}
                onChange={onSelectAll}
              />
            </span>
            <span>Durum</span>
            <span style={{ textAlign: 'center' }}>İsim</span>
            <span>Bitiş Tarihi</span>
          </div>
          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className="list-item" onClick={() => onItemClick(item)}>
                <span className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => onSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </span>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(item.durum) }}>
                  {item.durum}
                </span>
                <span className="item-name" style={{ textAlign: 'center' }}>{item.isim}</span>
                <span className="item-date">{new Date(item.bitis_tarihi).toLocaleDateString('tr-TR')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TakipListesi;