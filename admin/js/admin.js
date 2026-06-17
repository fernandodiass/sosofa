document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000' 
        : window.location.origin; 

    const loginForm = document.getElementById('loginForm');
    const uploadForm = document.getElementById('uploadForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminGalleryList = document.getElementById('adminGalleryList');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('adminUser').value,
                    password: document.getElementById('adminPassword').value
                })
            });
            const result = await res.json();
            if (result.success) {
                localStorage.setItem('sosofat_admin_auth', result.token);
                window.location.href = 'dashboard.html';
            } else {
                alert(result.error);
            }
        });
    }

    if (uploadForm || logoutBtn) {
        const token = localStorage.getItem('sosofat_admin_auth');
        if (!token) window.location.href = 'index.html';

        if (logoutBtn) {
            logoutBtn.onclick = () => {
                localStorage.removeItem('sosofat_admin_auth');
                window.location.href = 'index.html';
            };
        }

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('image', document.getElementById('imageInput').files[0]);
            formData.append('caption', document.getElementById('imageCaption').value);

            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                alert("Upload Cloudinary Sucesso!");
                uploadForm.reset();
                loadAdminGallery();
            }
        });

        async function loadAdminGallery() {
            if (!adminGalleryList) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/gallery`);
                const data = await res.json();
                const images = Array.isArray(data) ? data : (data.gallery || []);
                
                adminGalleryList.innerHTML = images.map(img => `
                    <div class="admin-gallery-item">
                        <img src="${img.url}" width="100" alt="${img.title}">
                        <div class="item-info">
                            <p id="title-${img.id}">${img.title}</p>
                        </div>
                        <div class="admin-actions">
                            <button class="edit-btn" onclick="editTitle('${img.id}', '${img.title}')">Editar</button>
                            <button class="delete-btn" onclick="deletePhoto('${img.id}')">Excluir</button>
                        </div>
                    </div>
                `).join('');
            } catch (err) {
                console.error("Erro ao carregar:", err);
            }
        }

        window.editTitle = async (id, oldTitle) => {
            const newTitle = prompt("Novo título:", oldTitle);
            if (!newTitle || newTitle === oldTitle) return;

            const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ title: newTitle })
            });

            if (res.ok) loadAdminGallery();
        };

        window.deletePhoto = async (id) => {
            if (!confirm('Excluir permanentemente?')) return;
            const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) loadAdminGallery();
        };

        loadAdminGallery();
    }
});