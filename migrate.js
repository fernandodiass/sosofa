require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// 1. Configure suas credenciais
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const DATA_FILE = path.join(__dirname, 'data', 'gallery.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function migrate() {
    console.log("Iniciando migração para Cloudinary...");
    
    // Lê o arquivo gallery.json original
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const items = data.gallery || data;
    const newGallery = [];

    for (const item of items) {
        // O caminho da imagem no seu PC
        const localPath = path.join(__dirname, item.url);

        if (fs.existsSync(localPath)) {
            try {
                console.log(`Enviando: ${item.title}...`);
                // Envia para o Cloudinary
                const result = await cloudinary.uploader.upload(localPath, {
                    folder: 'sosofa_gallery'
                });

                // Substitui a URL local pela URL do Cloudinary
                newGallery.push({
                    ...item,
                    url: result.secure_url // A nova URL https://...
                });
                console.log(`Sucesso: ${item.id}`);
            } catch (err) {
                console.error(`Erro ao enviar ${item.url}:`, err.message);
                newGallery.push(item); // Mantém o original em caso de erro
            }
        } else {
            console.warn(`Arquivo não encontrado localmente: ${item.url}`);
            newGallery.push(item);
        }
    }

    // Salva o novo gallery.json com as 59 URLs do Cloudinary
    fs.writeFileSync(DATA_FILE, JSON.stringify({ gallery: newGallery }, null, 2));
    console.log("\nMigração concluída! Todas as URLs foram atualizadas no gallery.json.");
}

migrate();