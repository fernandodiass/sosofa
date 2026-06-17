import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const PORT = process.env.PORT || 3000;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro crítico: SUPABASE_URL ou SUPABASE_KEY não configuradas no .env");
  process.exit(1);
}

// Inicializa o cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Cloudinary (Puxa do seu .env atual)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuração do Multer (Armazenamento temporário em memória para o upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Token estático simples para segurança do Admin (Simula o JWT que seu admin.js espera)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "sosofat_token_secreto_2026";

// ==========================================
// ROTAS DE AUTENTICAÇÃO E BACKEND
// ==========================================

// 1. Rota de Login (Usada pelo admin/index.html)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Alinhado com as suas credenciais de acesso
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    return res.status(401).json({ success: false, error: "Usuário ou senha incorretos!" });
  }
});

// 2. Rota de Upload de Imagem (Recebe o arquivo, joga no Cloudinary e salva a URL no Supabase)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo de imagem enviado." });
    }

    // Envia o arquivo da memória direto para o Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'sosofat' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Salva o resultado final (URL do Cloudinary) na tabela 'fotos' do Supabase
    const { data, error } = await supabase
      .from('fotos')
      .insert([{ 
        title: caption || "Sem título", 
        url: uploadResult.secure_url, 
        timestamp: new Date().toISOString() 
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, foto: data[0] });
  } catch (error) {
    console.error("Erro no processo de upload:", error.message);
    return res.status(500).json({ error: "Erro interno ao processar upload." });
  }
});

// ==========================================
// ROTAS DA TABELA FOTOS (Supabase)
// ==========================================

// 3. Listar fotos (Usada pela Galeria do Site e Admin)
app.get('/api/fotos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fotos') 
      .select('*')
      .order('id', { ascending: false }); // Exibe as mais novas primeiro

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar fotos:", error.message);
    return res.status(500).json({ error: "Erro interno ao buscar as fotos." });
  }
});

// 4. Editar Título da Foto (Usada pelo botão "Editar" do Admin)
app.put('/api/fotos/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const { data, error } = await supabase
      .from('fotos')
      .update({ title })
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao editar foto:", error.message);
    return res.status(500).json({ error: "Erro ao atualizar no banco." });
  }
});

// 5. Excluir Foto (Usada pelo botão "Excluir" do Admin)
app.delete('/api/fotos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('fotos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar foto:", error.message);
    return res.status(500).json({ error: "Erro ao excluir do banco." });
  }
});

// ... suas rotas normais (get, post, put, delete de /api/fotos e /api/login)

app.listen(PORT, () => {
  console.log(`🚀 Servidor da Sosofat ativo em http://localhost:${PORT}`);
});