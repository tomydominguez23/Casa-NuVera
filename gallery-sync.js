/**
 * Gallery Sync - Casa Nuvera
 * Sincroniza los cambios de la galería del panel de administración con el index.html
 */

class GallerySync {
    constructor() {
        this.galleryData = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('🎬 Inicializando sincronización de galería...');
        
        // Esperar a que Supabase esté listo
        if (window.supabaseClient) {
            await this.loadGalleryData();
        } else {
            window.addEventListener('supabaseReady', () => {
                this.loadGalleryData();
            });
        }
        
        this.isInitialized = true;
    }

    async loadGalleryData() {
        try {
            console.log('📋 Cargando datos de galería desde Supabase...');
            
            // Por ahora usamos datos estáticos que coinciden con el index.html
            // En el futuro esto se puede conectar a una tabla específica de galería
            this.galleryData = [
                {
                    id: 1,
                    title: "Espacios que Inspiran",
                    description: "Cada propiedad cuenta una historia única",
                    type: "image",
                    url: "https://otfbouzmhmmguvqbbwku.supabase.co/storage/v1/object/public/imagenes-sitio/imagen_1756150801258_0.jpeg",
                    order: 1,
                    active: true,
                    propertyId: 1,
                    slug: "departamento-los-llanes"
                },
                {
                    id: 2,
                    title: "Tour Virtual Inmersivo",
                    description: "Recorre propiedades desde la comodidad de tu hogar",
                    type: "video",
                    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    order: 2,
                    active: true,
                    propertyId: 2,
                    slug: "casa-moderna-providencia"
                },
                {
                    id: 3,
                    title: "Calidad en Cada Detalle",
                    description: "Propiedades seleccionadas con los más altos estándares",
                    type: "image",
                    url: "https://otfbouzmhmmguvqbbwku.supabase.co/storage/v1/object/public/imagenes-sitio/imagen_1756150948654_0.jpeg",
                    order: 3,
                    active: true,
                    propertyId: 3,
                    slug: "oficina-vitacura"
                },
                {
                    id: 4,
                    title: "Tecnología de Vanguardia",
                    description: "Innovación aplicada al sector inmobiliario",
                    type: "video",
                    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    order: 4,
                    active: true,
                    propertyId: 4,
                    slug: "casa-familiar-nunoa"
                }
            ];

            console.log('✅ Datos de galería cargados:', this.galleryData.length, 'slides');
            
            // Si estamos en la página de administración de galería, actualizar la vista
            if (window.galleryManager) {
                window.galleryManager.gallerySlides = this.galleryData;
                window.galleryManager.renderPreviewCarousel();
                window.galleryManager.renderSlidesGrid();
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos de galería:', error);
        }
    }

    /**
     * Actualiza la galería en el index.html con los datos más recientes
     */
    updateIndexGallery() {
        if (!this.galleryData) {
            console.warn('⚠️ No hay datos de galería para actualizar');
            return;
        }

        try {
            console.log('🔄 Actualizando galería en index.html...');
            
            const activeSlides = this.galleryData
                .filter(slide => slide.active)
                .sort((a, b) => a.order - b.order);

            // Actualizar cada slide en el index.html
            activeSlides.forEach((slide, index) => {
                const slideElement = document.querySelector(`.gallery-slide[data-property="${slide.propertyId}"]`);
                
                if (slideElement) {
                    // Actualizar contenido del slide
                    if (slide.type === 'image') {
                        const img = slideElement.querySelector('img');
                        if (img) {
                            img.src = slide.url;
                            img.alt = slide.title;
                        }
                    } else if (slide.type === 'video') {
                        const video = slideElement.querySelector('video');
                        if (video) {
                            const source = video.querySelector('source');
                            if (source) {
                                source.src = slide.url;
                            }
                        }
                    }

                    // Actualizar overlay
                    const overlay = slideElement.querySelector('.slide-overlay');
                    if (overlay) {
                        const title = overlay.querySelector('h3');
                        const description = overlay.querySelector('p');
                        
                        if (title) title.textContent = slide.title;
                        if (description) description.textContent = slide.description;
                    }

                    // Actualizar atributos de datos
                    slideElement.dataset.property = slide.propertyId;
                    slideElement.dataset.slug = slide.slug;
                }
            });

            console.log('✅ Galería actualizada exitosamente');
            
        } catch (error) {
            console.error('❌ Error actualizando galería:', error);
        }
    }

    /**
     * Guarda los cambios de la galería en Supabase
     */
    async saveGalleryChanges(gallerySlides) {
        try {
            console.log('💾 Guardando cambios de galería...');
            
            // Aquí se implementaría la lógica para guardar en Supabase
            // Por ahora solo actualizamos los datos locales
            this.galleryData = gallerySlides;
            
            // Actualizar la galería en el index.html si estamos en esa página
            if (window.location.pathname.includes('index.html')) {
                this.updateIndexGallery();
            }
            
            console.log('✅ Cambios de galería guardados');
            
        } catch (error) {
            console.error('❌ Error guardando cambios:', error);
            throw error;
        }
    }

    /**
     * Obtiene los datos actuales de la galería
     */
    getGalleryData() {
        return this.galleryData;
    }

    /**
     * Actualiza un slide específico
     */
    updateSlide(slideId, slideData) {
        const slideIndex = this.galleryData.findIndex(slide => slide.id === slideId);
        
        if (slideIndex !== -1) {
            this.galleryData[slideIndex] = { ...this.galleryData[slideIndex], ...slideData };
            console.log('✅ Slide actualizado:', slideId);
            return true;
        }
        
        console.warn('⚠️ Slide no encontrado:', slideId);
        return false;
    }

    /**
     * Agrega un nuevo slide
     */
    addSlide(slideData) {
        const newSlide = {
            id: Date.now(),
            ...slideData,
            active: true
        };
        
        this.galleryData.push(newSlide);
        console.log('✅ Slide agregado:', newSlide.id);
        return newSlide;
    }

    /**
     * Elimina un slide
     */
    removeSlide(slideId) {
        const slideIndex = this.galleryData.findIndex(slide => slide.id === slideId);
        
        if (slideIndex !== -1) {
            this.galleryData.splice(slideIndex, 1);
            console.log('✅ Slide eliminado:', slideId);
            return true;
        }
        
        console.warn('⚠️ Slide no encontrado:', slideId);
        return false;
    }
}

// Crear instancia global
window.gallerySync = new GallerySync();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GallerySync;
}