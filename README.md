# SÓ SOFÁ T-63 — Site & Backend

Este projeto compreende a plataforma da **SÓ SOFÁ T-63**, focada em um catálogo de estofados de luxo. A aplicação utiliza um frontend moderno com estética editorial e um backend robusto para gerenciamento de mídia.

## 🎨 Design System (Frontend)

O frontend foi desenvolvido com foco em alta sofisticação visual:
- **Tipografia**: Utiliza *Playfair Display* para títulos e *DM Sans* para corpo de texto.
- **Paleta de Cores**: Combinação de *Ivory*, *Charcoal* e o azul identidade da marca (`#2C4393`), com acentos em *Gold*.
- **Funcionalidades**:
  - **Hero Slider**: Transições suaves de imagens de destaque.
  - **Galeria Dinâmica**: Consumo de API para exibição de fotos com suporte a Lightbox.
  - **Responsividade**: Totalmente adaptado para dispositivos móveis com menu toggle.
  - **Scroll Reveal**: Animações de entrada para elementos da página.

## 🚀 Tecnologias (Backend)

- **Node.js & Express**: Servidor e roteamento da API.
- **Cloudinary**: Infraestrutura de armazenamento e entrega otimizada de imagens.
- **Multer & Multer Storage Cloudinary**: Processamento de uploads de arquivos.
- **JWT (JSON Web Token)**: Preparado para autenticação de rotas administrativas.
- **CORS**: Configurado para integração segura entre o frontend e a API.

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/sosofa-2026.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd sosofa-2026
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

## ⚙️ Configuração (.env)

Crie um arquivo `.env` na raiz do projeto e configure suas credenciais:
```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
JWT_SECRET=sua_chave_secreta
```

## 🛠️ Scripts Utilitários

### Migração para Cloudinary
O projeto inclui um script `migrate.js` para automatizar o upload de imagens locais para a nuvem:
```bash
node migrate.js
```
Este script lê o `gallery.json`, faz o upload para a pasta `sosofa_gallery` no Cloudinary e atualiza o arquivo com as novas URLs seguras.

## 🛠️ Scripts Disponíveis

- `npm start`: Inicia o servidor em modo de produção.
- `npm run dev`: Inicia o servidor em modo de desenvolvimento (caso o nodemon esteja configurado).

## 📂 Estrutura Principal

- `/css/style.css`: Design System v2 e estilos globais.
- `/js/script.js`: Lógica de interface e consumo da API.
- `migrate.js`: Utilitário de migração de assets.
- `/data/gallery.json`: Base de dados do catálogo de fotos.

---
Desenvolvido por Fernando Dias.
```

```json