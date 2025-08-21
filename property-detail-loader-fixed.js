    renderPropertyDetail() {
        // Ocultar loading y mostrar contenido
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('propertyContent').style.display = 'block';
        
        this.updatePageTitle();
        this.renderPropertyHeader();
        this.renderPropertyGallery();
        this.renderPropertyInfo();
        this.renderPropertyFeatures();
        this.renderPropertyTours();
        this.renderContactInfo();
        this.renderSimilarProperties();
    }

    showError(message) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('propertyContent').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
    }