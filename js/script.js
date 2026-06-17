document.addEventListener('DOMContentLoaded', () => {

    // --- Configuração da API Dinâmica ---
    // Na Oracle Cloud com Nginx, o 'window.location.origin' já resolve para o domínio correto.
    // Se estiver em localhost, ele aponta para a porta 3000 do Node.
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000' 
        : '';

    // --- Mobile Navigation Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // --- Service Details Toggles ---
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const btn = card.querySelector('.btn-details');
        if (btn) {
            btn.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                serviceCards.forEach(c => {
                    c.classList.remove('expanded');
                    const cBtn = c.querySelector('.btn-details');
                    if (cBtn) cBtn.textContent = 'Ver Detalhes';
                });
                if (!isExpanded) {
                    card.classList.add('expanded');
                    btn.textContent = 'Ocultar Detalhes';
                }
            });
        }
    });

    // --- Hero Slider Animation ---
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // --- Dynamic Gallery ---
    const galleryGrid = document.getElementById('galleryGrid');

    if (galleryGrid) {
        const style = document.createElement('style');
        style.innerHTML = `body.no-scroll { overflow: hidden; }`;
        document.head.appendChild(style);

        fetchGallery();
    }

    async function fetchGallery() {
        try {
            // Usa a URL dinâmica em vez de localhost fixo
            const response = await fetch(`${API_BASE_URL}/api/gallery`);
            if (response.ok) {
                const data = await response.json();
                // Verifica se os dados vêm como array direto ou dentro de um objeto
                const images = Array.isArray(data) ? data : (data.gallery || []);
                renderGallery(images);
            } else {
                console.error('Falha ao obter galeria da API');
                renderPlaceholderError();
            }
        } catch (error) {
            console.error('API offline ou erro de rede', error);
            renderPlaceholderError();
        }
    }

    function renderGallery(images) {
        if (!images || images.length === 0) {
            galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">A galeria está vazia.</p>';
            return;
        }

        galleryGrid.innerHTML = ''; 

        images.forEach((img) => {
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');

            // Agora usamos img.url diretamente, pois ela já contém o link https:// do Cloudinary
            const imgSrc = img.url;

            galleryItem.innerHTML = `
                <img src="${imgSrc}" alt="${img.title}" loading="lazy">
                <div class="gallery-overlay"><span>${img.title}</span></div>
            `;

            galleryItem.addEventListener('click', () => {
                openLightbox(imgSrc, img.title);
            });

            galleryGrid.appendChild(galleryItem);
        });

        const carouselPrev = document.getElementById('carouselPrev');
        const carouselNext = document.getElementById('carouselNext');
        if (carouselPrev && carouselNext) {
            carouselPrev.onclick = () => galleryGrid.scrollBy({ left: -340, behavior: 'smooth' });
            carouselNext.onclick = () => galleryGrid.scrollBy({ left: 340, behavior: 'smooth' });
        }
    }

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(src, title) {
        if (!lightbox) return;
        lightboxImg.src = src;
        lightboxCaption.textContent = title;
        lightbox.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    if (lightbox) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    function renderPlaceholderError() {
        galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #d4af37;">Conectando à galeria...</p>';
    }
});