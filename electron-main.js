const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

// startBackend fonksiyonunu, isDev parametresini alacak şekilde güncelleyelim
function startBackend(isDev) { // <-- isDev parametresi eklendi
    const backendPath = path.join(__dirname, 'backend', 'index.js');
    console.log(`Backend başlatılıyor: ${backendPath}`);

    if (isDev) {
        // Geliştirme ortamında ayrı bir süreçte çalıştırmak pratik olur
        backendProcess = fork(backendPath, [], {
            cwd: path.join(__dirname, 'backend'),
            env: { ...process.env, PORT: 5000, NODE_ENV: 'development' },
            silent: true
        });

        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend stdout: ${data}`);
        });
        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend stderr: ${data}`);
        });
        backendProcess.on('close', (code) => {
            console.log(`Backend süreci çıktı ${code} koduyla.`);
        });
    } else {
        // Üretimde child_process.fork bazı Windows kurulumlarında APP EXE'yi spawn ederken ENOENT üretebiliyor.
        // Bu nedenle backend'i aynı süreç içinde require ederek başlatıyoruz.
        process.env.PORT = process.env.PORT || '5000';
        process.env.NODE_ENV = 'production';
        // SQLite dosyası için yazılabilir dizini backend'e ilet
        process.env.APP_DATA_DIR = app.getPath('userData');
        try {
            require(backendPath);
            console.log('Backend aynı süreçte başlatıldı (production).');
        } catch (err) {
            console.error('Backend başlatılırken hata oluştu:', err);
        }
    }
}


async function initializeApp() {
    // isDev'i burada tanımlıyoruz
    const { default: isDev } = await import('electron-is-dev');

    function createWindow() {
        mainWindow = new BrowserWindow({
            width: 1200, height: 800, minWidth: 800, minHeight: 600,
            show: false,
            webPreferences: {
                nodeIntegration: false, contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            if (isDev) { mainWindow.webContents.openDevTools(); }
        });

        const startUrl = isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, './frontend/build/index.html')}`;

        mainWindow.loadURL(startUrl);
        mainWindow.on('closed', () => (mainWindow = null));
    }

    // startBackend'i çağırırken isDev değerini gönderiyoruz
    startBackend(isDev); // <-- Değişiklik burada
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}


app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { app.quit(); }
});

app.on('will-quit', () => {
    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill();
        console.log('Backend süreci sonlandırıldı.');
    }
});