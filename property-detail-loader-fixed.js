    async loadPropertyTours(propertyId) {
        try {
            console.log('🌐 Cargando tours 360° de la propiedad...');
            
            // Primero intentar cargar desde tabla property_tours
            const { data: toursFromTable, error: toursError } = await window.supabase
                .from('property_tours')
                .select('id, tour_name, tour_url, tour_order')
                .eq('property_id', propertyId)
                .order('tour_order', { ascending: true });

            if (!toursError && toursFromTable && toursFromTable.length > 0) {
                this.propertyTours = toursFromTable;
                console.log(`✅ ${this.propertyTours.length} tours cargados desde tabla property_tours`);
                return;
            }

            // Si no hay tours en la tabla, buscar en campos de la propiedad principal
            console.log('🔍 No se encontraron tours en tabla property_tours, buscando en campos de la propiedad...');
            
            // Intentar obtener tours de diferentes campos posibles en la propiedad
            const { data: propertyData, error: propertyError } = await window.supabase
                .from('properties')
                .select('tour_url, virtual_tour, tour_360, tours')
                .eq('id', propertyId)
                .single();

            if (propertyError) {
                console.error('⚠️ Error al cargar datos de tours de la propiedad:', propertyError);
                this.propertyTours = [];
                return;
            }

            // Buscar URL de tour en diferentes campos posibles
            let tourUrl = null;
            let tourName = 'Tour Virtual 360°';

            if (propertyData) {
                // Probar diferentes nombres de campos donde podría estar la URL
                tourUrl = propertyData.tour_url || 
                         propertyData.virtual_tour || 
                         propertyData.tour_360 || 
                         propertyData.tours;

                console.log('🔍 Datos de tours encontrados:', {
                    tour_url: propertyData.tour_url,
                    virtual_tour: propertyData.virtual_tour,
                    tour_360: propertyData.tour_360,
                    tours: propertyData.tours
                });
            }

            if (tourUrl) {
                // Si es un array de tours, tomar el primero o procesarlos todos
                if (Array.isArray(tourUrl)) {
                    this.propertyTours = tourUrl.map((url, index) => ({
                        id: `property-tour-${index}`,
                        tour_name: `Tour Virtual ${index + 1}`,
                        tour_url: url,
                        tour_order: index + 1
                    }));
                } else if (typeof tourUrl === 'string' && tourUrl.trim() !== '') {
                    // URL única como string
                    this.propertyTours = [{
                        id: 'property-tour-1',
                        tour_name: tourName,
                        tour_url: tourUrl.trim(),
                        tour_order: 1
                    }];
                } else {
                    this.propertyTours = [];
                }
                
                console.log(`✅ ${this.propertyTours.length} tours cargados desde campos de la propiedad`);
            } else {
                console.log('ℹ️ No se encontraron tours en ningún campo');
                this.propertyTours = [];
            }
            
        } catch (error) {
            console.error('💥 Error en loadPropertyTours:', error);
            this.propertyTours = [];
        }
    }