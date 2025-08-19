        async function loadPropertyDetails(propertyId) {
            try {
                showLoading(true);
                
                console.log('📥 Cargando detalles de propiedad ID:', propertyId);
                
                // Query corregido - usar published en lugar de status
                const { data: property, error: propertyError } = await window.supabase
                    .from('properties')
                    .select(`
                        id,
                        title,
                        property_type,
                        category,
                        bedrooms,
                        bathrooms,
                        description,
                        region,
                        commune,
                        address,
                        neighborhood,
                        total_area,
                        built_area,
                        parking_spaces,
                        currency,
                        price,
                        expenses,
                        features,
                        featured,
                        published,
                        created_at,
                        contact_name,
                        contact_phone,
                        contact_email
                    `)
                    .eq('id', propertyId)
                    .eq('published', true)
                    .single();

                if (propertyError || !property) {
                    throw new Error('Propiedad no encontrada');
                }

                currentProperty = property;

                // Cargar imágenes desde property_images
                await loadPropertyImages(propertyId);

                // Cargar tours 360° desde la base de datos
                await loadPropertyTours(propertyId);

                // Cargar propiedades similares
                await loadSimilarProperties(property.commune || property.address);

                showLoading(false);
                renderPropertyDetails();
                
            } catch (error) {
                console.error('💥 Error al cargar propiedad:', error);
                showError(error.message);
                showLoading(false);
            }
        }

        async function loadPropertyImages(propertyId) {
            try {
                console.log('🖼️ Cargando imágenes para propiedad:', propertyId);
                
                const { data: images, error } = await window.supabase
                    .from('property_images')
                    .select('image_url, image_order, is_main')
                    .eq('property_id', propertyId)
                    .order('image_order', { ascending: true });

                if (!error && images && images.length > 0) {
                    // Buscar imagen principal o tomar la primera
                    const mainImage = images.find(img => img.is_main) || images[0];
                    propertyImages = images.map(img => ({ 
                        image_url: img.image_url, 
                        is_main: img.is_main || false 
                    }));
                    console.log(`✅ ${images.length} imágenes cargadas`);
                } else {
                    propertyImages = [{ 
                        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', 
                        is_main: true 
                    }];
                    console.log('ℹ️ Usando imagen por defecto (no hay imágenes en BD)');
                }
            } catch (error) {
                console.error('💥 Error cargando imágenes:', error);
                propertyImages = [{ 
                    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', 
                    is_main: true 
                }];
            }
        }

        async function loadSimilarProperties(currentLocation) {
            try {
                console.log('🔍 Cargando propiedades similares en:', currentLocation);
                
                // Buscar propiedades en la misma comuna
                const { data: properties, error } = await window.supabase
                    .from('properties')
                    .select(`
                        id,
                        title,
                        property_type,
                        bedrooms,
                        bathrooms,
                        total_area,
                        price,
                        currency,
                        commune,
                        address
                    `)
                    .eq('published', true)
                    .neq('id', currentProperty.id)
                    .limit(3);

                if (error) {
                    console.warn('⚠️ Error cargando propiedades similares:', error);
                    return;
                }

                if (properties && properties.length > 0) {
                    // Cargar imágenes para cada propiedad similar
                    for (let property of properties) {
                        try {
                            const { data: images } = await window.supabase
                                .from('property_images')
                                .select('image_url, is_main')
                                .eq('property_id', property.id)
                                .order('image_order', { ascending: true })
                                .limit(1);

                            if (images && images.length > 0) {
                                property.main_image = images[0].image_url;
                            } else {
                                property.main_image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
                            }
                        } catch (imgError) {
                            property.main_image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
                        }
                    }

                    similarProperties = properties;
                    console.log(`✅ ${properties.length} propiedades similares encontradas`);
                    renderSimilarProperties();
                } else {
                    console.log('ℹ️ No se encontraron propiedades similares');
                }

            } catch (error) {
                console.error('💥 Error cargando propiedades similares:', error);
            }
        }

        function renderPropertyInfo() {
            const getBadgeText = (type) => {
                switch(type) {
                    case 'venta': return 'EN VENTA';
                    case 'arriendo': return 'EN ARRIENDO'; 
                    case 'casa': return 'CASA';
                    case 'departamento': return 'DEPARTAMENTO';
                    default: return 'DISPONIBLE';
                }
            };

            // Crear ubicación completa
            const locationParts = [];
            if (currentProperty.neighborhood) locationParts.push(currentProperty.neighborhood);
            if (currentProperty.commune) locationParts.push(currentProperty.commune);
            if (currentProperty.region && currentProperty.region !== currentProperty.commune) {
                locationParts.push(currentProperty.region);
            }
            const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : 
                (currentProperty.address || 'Ubicación no especificada');

            // Update header
            document.getElementById('propertyBadge').textContent = getBadgeText(currentProperty.property_type);
            document.getElementById('propertyTitle').textContent = currentProperty.title;
            document.getElementById('propertyLocation').textContent = `📍 ${fullLocation}`;
            document.getElementById('propertyPrice').textContent = formatPrice(currentProperty.price, currentProperty.currency);

            // Update contact price
            document.getElementById('contactPrice').textContent = formatPrice(currentProperty.price, currentProperty.currency);

            // Render features
            const featuresGrid = document.getElementById('featuresGrid');
            const features = [];

            if (currentProperty.bedrooms !== null && currentProperty.bedrooms !== undefined) {
                features.push({
                    icon: '🛏️',
                    value: currentProperty.bedrooms === 0 ? 'Studio' : currentProperty.bedrooms,
                    label: currentProperty.bedrooms === 0 ? '' : 'Dormitorios'
                });
            }

            if (currentProperty.bathrooms) {
                features.push({
                    icon: '🚿',
                    value: currentProperty.bathrooms,
                    label: 'Baños'
                });
            }

            // Usar total_area o built_area
            const area = currentProperty.total_area || currentProperty.built_area;
            if (area) {
                features.push({
                    icon: '📐',
                    value: `${area}m²`,
                    label: 'Superficie'
                });
            }

            if (currentProperty.parking_spaces && currentProperty.parking_spaces > 0) {
                features.push({
                    icon: '🚗',
                    value: currentProperty.parking_spaces,
                    label: 'Estacionamientos'
                });
            }

            featuresGrid.innerHTML = features.map(feature => `
                <div class="feature-item">
                    <div class="feature-icon">${feature.icon}</div>
                    <div class="feature-value">${feature.value}</div>
                    <div class="feature-label">${feature.label}</div>
                </div>
            `).join('');

            // Update description
            document.getElementById('propertyDescription').innerHTML = 
                currentProperty.description ? 
                `<p>${currentProperty.description}</p>` : 
                '<p>No hay descripción disponible para esta propiedad.</p>';
        }

        function renderSimilarProperties() {
            if (similarProperties.length === 0) return;
            
            const similarPropertiesSection = document.getElementById('similarPropertiesSection');
            const similarPropertiesGrid = document.getElementById('similarPropertiesGrid');
            
            const propertiesHTML = similarProperties.map(property => {
                const formattedPrice = formatPrice(property.price, property.currency);
                const bedrooms = property.bedrooms || 0;
                const bathrooms = property.bathrooms || 0;
                const area = property.total_area || property.built_area || 0;
                const location = property.commune || property.address || 'Ubicación no especificada';

                return `
                    <div class="similar-property-card" onclick="goToProperty('${property.id}', '${createSlug(property.title)}')">
                        <div class="similar-property-image">
                            <img src="${property.main_image}" alt="${property.title}" loading="lazy">
                            <div class="similar-property-price-badge">
                                ${formattedPrice}
                            </div>
                        </div>
                        <div class="similar-property-content">
                            <h4 class="similar-property-title">${property.title || 'Propiedad sin título'}</h4>
                            <div class="similar-property-location">${location}</div>
                            <div class="similar-property-features">
                                <div class="similar-property-feature">
                                    <svg class="similar-property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 9 9 9s9-3.45 9-9V7l-10-5z"/>
                                    </svg>
                                    ${bedrooms} hab
                                </div>
                                <div class="similar-property-feature">
                                    <svg class="similar-property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 14c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
                                    </svg>
                                    ${bathrooms} baños
                                </div>
                                <div class="similar-property-feature">
                                    <svg class="similar-property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                                    </svg>
                                    ${area}m²
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            similarPropertiesGrid.innerHTML = propertiesHTML;
            similarPropertiesSection.style.display = 'block';
        }

        function formatPrice(price, currency = 'CLP') {
            if (!price) return 'Precio a consultar';
            
            const numPrice = parseFloat(price);
            if (isNaN(numPrice)) return 'Precio a consultar';
            
            // Formato según moneda
            switch(currency) {
                case 'CLP':
                    return `$${numPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
                case 'UF':
                    return `UF ${numPrice.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;
                case 'USD':
                    return `US$ ${numPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                default:
                    return `${currency} ${numPrice.toLocaleString('es-CL')}`;
            }
        }