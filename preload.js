// Bu dosya güvenlik nedeniyle Electron ana süreci ile render süreci (React) arasında köprü görevi görür.
// Güvenli olduğundan emin değilseniz, Window objesine doğrudan API eklemeyin.
// Bu uygulama için özel bir köprüye ihtiyaç duymuyoruz, React doğrudan backend'e http çağrıları yapacak.
// Ancak electron-main.js dosyasında preload script tanımlı olduğu için boş bir dosya olarak bırakıyoruz.