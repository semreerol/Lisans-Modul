import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TakipListesi from './components/TakipListesi';
import TakipFormu from './components/TakipFormu';
import TakipDetayModal from './components/TakipDetayModal';
import './App.css';

function App() {
  const [takipListesi, setTakipListesi] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const API_URL = 'http://localhost:5000/api/takip';

  const handleSelectItem = (id) => {
    setSelectedItems(prevSelected => {

      if (prevSelected.includes(id)) {
        return prevSelected.filter(itemId => itemId !== id);
      }
      else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === takipListesi.length) {
      setSelectedItems([]);
    } 
    else {
      setSelectedItems(takipListesi.map(item => item.id));
    }
  };

  const fetchTakipListesi = async () => {
    try {
      const response = await axios.get(API_URL);
      setTakipListesi(response.data);
    } catch (error) {
      console.error("Veri çekilirken bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchTakipListesi();
  }, []);

  const handleKayitEkle = async (yeniKayit) => {
    try {
      const response = await axios.post(API_URL, yeniKayit);
      alert(`'${response.data.isim}' isimli yeni kayıt başarıyla eklendi!`);
      fetchTakipListesi();
      setIsFormVisible(false);
      return true;
    } catch (error) {
      console.error("Kayıt eklenirken bir hata oluştu:", error);
      if (error.response?.data?.error) {
        alert(`Hata: ${error.response.data.error}`);
      } else {
        alert('Kayıt eklenirken bir sorun oluştu.');
      }
      return false;
    }
  };

  const handleGuncelle = async (guncelKayit) => {
    try {
      const response = await axios.put(`${API_URL}/${guncelKayit.id}`, guncelKayit);
      alert(`'${response.data.isim}' isimli kayıt başarıyla güncellendi!`);
      handleCloseModal();
      fetchTakipListesi();
    } catch (error) {
      console.error("Kayıt güncellenirken bir hata oluştu:", error);
      if (error.response?.data?.error) {
        alert(`Hata: ${error.response.data.error}`);
      } else {
        alert('Kayıt güncellenirken bir sorun oluştu.');
      }
    }
  };

  const handleSil = async (id) => {
    handleCloseModal();
    if (window.confirm(`${id} ID'li kaydı silmek istediğinizden emin misiniz?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTakipListesi();
      } catch (error) {
        console.error("Kayıt silinirken bir hata oluştu:", error);
        alert('Kayıt silinirken bir hata oluştu.');
      }
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert('Lütfen silmek için en az bir kayıt seçin.');
      return;
    }
    if (window.confirm(`${selectedItems.length} adet kaydı silmek istediğinizden emin misiniz?`)) {
      try {
        
        await axios.delete(API_URL, { data: { ids: selectedItems } });
        alert(`${selectedItems.length} adet kayıt başarıyla silindi.`);
        fetchTakipListesi(); 
        setSelectedItems([]); 
      } catch (error) {
        console.error("Toplu silme sırasında bir hata oluştu:", error);
        alert('Kayıtlar silinirken bir hata oluştu.');
      }
    }
  };
  
  const handleCloseModal = () => setModalItem(null);
  const handleItemClick = (item) => setModalItem(item);


  return (
    <div className="App">
      <header className="App-header">
        <h1>Lisans Takip Uygulaması</h1>
      </header>
      <main>
        {isFormVisible && (
          <TakipFormu 
            onKayitEkle={handleKayitEkle} 
            onCancel={() => setIsFormVisible(false)}
          />
        )}
        <TakipListesi 
          items={takipListesi} 
          onItemClick={handleItemClick}
          onAddNewClick={() => setIsFormVisible(true)}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
        />
      </main>
      <TakipDetayModal
        isOpen={!!modalItem}
        onRequestClose={handleCloseModal}
        item={modalItem}
        onUpdate={handleGuncelle}
        onDelete={handleSil}
      />
    </div>
  );
}


export default App;
