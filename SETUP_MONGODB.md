# 🔧 CONFIGURAR MONGODB PARA VERCEL

## Problema Identificado
O Vercel usa filesystem efêmero (temporário). Os arquivos salvos em `data/gallery.json` são perdidos. **Solução: Usar MongoDB persistente**.

---

## Passo 1: Criar Conta MongoDB Atlas (GRATUITO)

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Após login, clique em **"Create a Project"**
4. Crie um **novo cluster** (escolha a opção gratuita)
5. Aguarde ~5-10 minutos para o cluster ser criado

---

## Passo 2: Obter Credenciais

1. No painel do MongoDB Atlas, vá para **"Database Access"**
2. Clique em **"Add New Database User"**
3. Configure um usuário com:
   - Username: `sosofat_admin` (ou escolha outro)
   - Password: `sua_senha_forte_aqui`
   - Clique em **"Add User"**

4. Vá para **"Network Access"**
5. Clique em **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Recomendado apenas para desenvolvimento

6. Clique no botão **"Connect"** do seu cluster
7. Escolha **"Connect your application"**
8. Copie a string de conexão (URI), exemplo:
   ```
   mongodb+srv://sosofat_admin:sua_senha_forte_aqui@cluster.mongodb.net/sosofa_db?retryWrites=true&w=majority
   ```

---

## Passo 3: Configurar Variáveis de Ambiente Local

1. Na raiz do projeto, crie um arquivo `.env`:
   ```
   MONGODB_URI=mongodb+srv://sosofat_admin:sua_senha_forte_aqui@seu-cluster.mongodb.net/sosofa_db?retryWrites=true&w=majority
   CLOUDINARY_CLOUD_NAME=dj1hsuwyg
   CLOUDINARY_API_KEY=628623779278147
   CLOUDINARY_API_SECRET=seu_api_secret_aqui
   JWT_SECRET=sosofat_permanent_key_2026
   PORT=3000
   ```

2. **NÃO commite este arquivo no Git** (adicione em `.gitignore`)

---

## Passo 4: Instalar Dependências

```bash
npm install
```

Isso vai instalar:
- `mongoose` (driver MongoDB)
- `dotenv` (para variáveis de ambiente)

---

## Passo 5: Testar Localmente

```bash
npm start
```

Teste a galeria em: `http://localhost:3000/admin/index.html`

---

## Passo 6: Configurar no Vercel

1. Acesse seu projeto no **Vercel Dashboard**
2. Vá para **Settings > Environment Variables**
3. Adicione as variáveis:
   - `MONGODB_URI`: Cole sua URI do MongoDB
   - `CLOUDINARY_CLOUD_NAME`: `dj1hsuwyg`
   - `CLOUDINARY_API_KEY`: `628623779278147`
   - `CLOUDINARY_API_SECRET`: Seu secret do Cloudinary
   - `JWT_SECRET`: `sosofat_permanent_key_2026`

4. Faça push do código:
   ```bash
   git add .
   git commit -m "Migração para MongoDB persistente"
   git push
   ```

5. O Vercel vai fazer deploy automaticamente

---

## ✅ Verificar se Está Funcionando

1. Acesse sua galeria no Vercel: `https://seu-dominio/admin/index.html`
2. Faça login e upload de uma foto
3. Recarregue a página - a foto deve continuar lá ✓
4. Acesse a galeria pública e veja se a foto aparece

---

## 🚨 Troubleshooting

### "Erro ao carregar galeria"
- Verifique se `MONGODB_URI` está correta
- Confirme que o IP está liberado no MongoDB (Network Access)

### As fotos desaparecem após 24h
- Você pode estar usando o arquivo JSON ainda (modo fallback)
- Confirme que `MONGODB_URI` está configurada no Vercel

### Upload funciona mas não aparece na galeria
- Verifique o console do Vercel para erros
- Confirme que o Cloudinary está configurado corretamente

---

## 📝 Notas

- **Mongoose**: Conecta automaticamente ao MongoDB
- **Fallback**: Se MongoDB não estiver disponível, o código usa `gallery.json` (para desenvolvimento local)
- **Segurança**: Não compartilhe as credenciais do MongoDB publicamente

