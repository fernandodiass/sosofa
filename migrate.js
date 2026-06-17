import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: SUPABASE_URL ou SUPABASE_KEY não foram encontradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrarDados() {
  try {
    console.log("📦 Lendo o arquivo gallery.json...");
    const dataJson = fs.readFileSync('./data/gallery.json', 'utf8');
    const dadosBrutos = JSON.parse(dataJson);

    // Converte os dados para Array, caso venham como um objeto { key: { ... } }
    const listaProdutos = Array.isArray(dadosBrutos) 
      ? dadosBrutos 
      : Object.values(dadosBrutos);

    // Formata removendo o ID antigo para evitar conflito com o autoincremento do Supabase
    const produtosFormatados = listaProdutos.map(item => ({
      title: item.title || "Sem título",
      url: item.url || "",
      timestamp: item.timestamp || new Date().toISOString()
    }));

    console.log(`🔌 Conectando ao Supabase e enviando ${produtosFormatados.length} itens para a tabela 'fotos'...`);

    const { data, error } = await supabase
      .from('fotos') 
      .insert(produtosFormatados);

    if (error) {
      throw error;
    }

    console.log("✅ Sucesso absoluto! Todos os dados estão salvos na tabela 'fotos'.");
  } catch (error) {
    console.error("❌ Erro durante a migração para o Supabase:", error.message);
  } finally {
    process.exit();
  }
}

migrarDados();