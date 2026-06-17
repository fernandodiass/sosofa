require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000; // Porta dinâmica para o Render
const SECRET_KEY = process.env.JWT_SECRET || 'sosofat_permanent_key_2026';

// --- CONFIGURAÇÕES DE CAMINHOS ---
const DATA_FILE = path.join(__dirname, 'data', 'gallery.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// --- CONFIGURAÇÃO CLOUDINARY ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sosofa_gallery',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Garantir que a pasta data exista
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));

// --- AUTENTICAÇÃO ---
const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acesso negado' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Sessão inválida' });
        req.user = user;
        next();
    });
};

// Login via users.json
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!fs.existsSync(USERS_FILE)) return res.status(500).json({ error: 'users.json não encontrado' });

    const userData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = userData.users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '365d' });
        return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, error: 'Usuário ou senha incorretos' });
});

// --- ROTAS DA GALERIA ---

app.get('/api/gallery', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data.gallery || data);
});

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
    const data = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : { gallery: [] };
    const list = data.gallery || data;
    
    const newItem = {
        id: Date.now().toString(),
        title: req.body.caption || 'Nova Imagem',
        url: req.file.path, // URL direta do Cloudinary
        timestamp: new Date().toISOString()
    };

    list.push(newItem);
    fs.writeFileSync(DATA_FILE, JSON.stringify({ gallery: list }, null, 2));
    res.json({ success: true, item: newItem });
});

// ROTA PARA EDITAR (PUT)
app.put('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let gallery = data.gallery || data;

    const index = gallery.findIndex(item => item.id == id);
    if (index !== -1) {
        gallery[index].title = title;
        fs.writeFileSync(DATA_FILE, JSON.stringify({ gallery }, null, 2));
        return res.json({ success: true });
    }
    res.status(404).json({ error: "Não encontrado" });
});

// ROTA PARA EXCLUIR (DELETE)
app.delete('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let gallery = data.gallery || data;

    const newGallery = gallery.filter(item => item.id != id);
    fs.writeFileSync(DATA_FILE, JSON.stringify({ gallery: newGallery }, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));