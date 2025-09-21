document.addEventListener('DOMContentLoaded', () => {
    const albums = document.querySelectorAll('.album');
    const totalAlbums = albums.length;
    const mobileNav = document.getElementById('mobileNav');
    
    // Inicializar siempre en el primer álbum (índice 0)
    let currentIndex = 0;
    
    // Variables para touch events
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isScrolling = false;

    // Crear indicadores para móvil
    function createMobileNav() {
        if (window.innerWidth <= 768) {
            mobileNav.innerHTML = '';
            for (let i = 0; i < totalAlbums; i++) {
                const dot = document.createElement('div');
                dot.className = 'nav-dot';
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCoverflow();
                    updateMobileNav();
                });
                mobileNav.appendChild(dot);
            }
        }
    }

    function updateMobileNav() {
        const dots = mobileNav.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function updateCoverflow() {
        albums.forEach((album, index) => {
            album.classList.remove('active');

            const distance = index - currentIndex;
            const absDistance = Math.abs(distance);
            
            // Configuración mejorada para diferentes pantallas
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            
            let translateX, rotation, translateZ, scale, opacity;
            
            if (isSmallMobile) {
                translateX = distance * 35;
                rotation = distance * 20;
                translateZ = -absDistance * 40;
                scale = Math.max(0.7, 1 - absDistance * 0.15);
                opacity = Math.max(0.6, 1 - absDistance * 0.2);
            } else if (isMobile) {
                translateX = distance * 40;
                rotation = distance * 25;
                translateZ = -absDistance * 50;
                scale = Math.max(0.75, 1 - absDistance * 0.12);
                opacity = Math.max(0.7, 1 - absDistance * 0.15);
            } else {
                translateX = distance * 50;
                rotation = distance * 30;
                translateZ = -absDistance * 80;
                scale = Math.max(0.7, 1 - absDistance * 0.15);
                opacity = Math.max(0.8, 1 - absDistance * 0.1);
            }
            
            // Aplicar transformaciones
            album.style.transform = `
                translateX(${translateX}%) 
                translateZ(${translateZ}px) 
                rotateY(${rotation}deg) 
                scale(${scale})
            `;
            
            album.style.opacity = opacity;
            album.style.zIndex = totalAlbums - absDistance;
            
            // Marcar álbum activo
            if (index === currentIndex) {
                album.classList.add('active');
            }
        });

        updateMobileNav();
    }

    // Touch events para el carrusel
    const coverflow = document.querySelector('.coverflow-container');
    
    coverflow.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = false;
        isScrolling = false;
    }, { passive: true });

    coverflow.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);

        if (!isDragging && !isScrolling) {
            if (diffY > diffX) {
                isScrolling = true;
            } else if (diffX > diffY && diffX > 10) {
                isDragging = true;
                e.preventDefault();
            }
        }

        if (isDragging) {
            e.preventDefault();
        }
    }, { passive: false });

    coverflow.addEventListener('touchend', (e) => {
        if (!isDragging || !startX) return;

        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        const threshold = 50;

        if (Math.abs(diffX) > threshold) {
            if (diffX > 0 && currentIndex < totalAlbums - 1) {
                currentIndex++;
            } else if (diffX < 0 && currentIndex > 0) {
                currentIndex--;
            }
            updateCoverflow();
        }

        startX = 0;
        startY = 0;
        isDragging = false;
        isScrolling = false;
    }, { passive: true });

    // Click en álbumes
    albums.forEach((album, index) => {
        album.addEventListener('click', (e) => {
            if (index !== currentIndex) {
                e.preventDefault();
                currentIndex = index;
                updateCoverflow();
            }
        });
    });

    // Rueda del mouse solo en escritorio
    coverflow.addEventListener('wheel', (e) => {
        if (window.innerWidth > 768) {
            e.preventDefault();
            if (e.deltaY > 0) {
                if (currentIndex < totalAlbums - 1) {
                    currentIndex++;
                    updateCoverflow();
                }
            } else {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCoverflow();
                }
            }
        }
    }, { passive: false });

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            if (currentIndex < totalAlbums - 1) {
                currentIndex++;
                updateCoverflow();
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentIndex > 0) {
                currentIndex--;
                updateCoverflow();
            }
        }
    });

    // Animación de entrada para sección de video
    const extraSection = document.querySelector('.extra-section');
    if (extraSection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    extraSection.classList.add('visible');
                    sectionObserver.unobserve(extraSection); 
                }
            });
        }, {
            threshold: 0.1
        });
        
        sectionObserver.observe(extraSection);
    }

    // Inicializar
    createMobileNav();
    updateCoverflow();

    // Actualizar en cambio de tamaño de ventana
    window.addEventListener('resize', () => {
        createMobileNav();
        updateCoverflow();
    });
});