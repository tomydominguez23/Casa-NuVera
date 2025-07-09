// supabase.js - Versión Corregida
console.log('🔄 Iniciando configuración de Supabase...');

const SUPABASE_URL = 'https://otfbouzmhmmguvqbbwku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZmJvdXptaG1tZ3V2cWJid2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODAyMTcsImV4cCI6MjA2NzE1NjIxN30.MDbvYvlXE4Hg7vG55uDN140HB4jtsdF-__SoxbddPcQ';

// Función para inicializar Supabase cuando esté disponible
function initializeSupabase() {
    try {
        // Verificar si Supabase está disponible
        if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
            console.log('⏳ Esperando a que Supabase se cargue...');
            return false;
        }

        // Crear cliente de Supabase
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Guardar referencia global
        window.supabaseClient = supabaseClient;
        window.supabase = supabaseClient; // Para compatibilidad con property-handler.js

        console.log('✅ Supabase configurado correctamente');
        console.log('🔗 URL:', SUPABASE_URL);
        console.log('🏠 Proyecto: Casa Nuvera');

        // Probar conexión
        testConnection();
        
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return false;
    }
}

// Función para probar la conexión
async function testConnection() {
    try {
        const { data, error } = await window.supabase
            .from('properties')
            .select('count')
            .limit(1);
            
        if (error) {
            console.warn('⚠️ Advertencia al conectar:', error.message);
        } else {
            console.log('🌐 Conexión a base de datos exitosa');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo probar la conexión:', error.message);
    }
}

// Función para verificar si Supabase está listo
function checkSupabaseReady() {
    if (initializeSupabase()) {
        console.log('🚀 Supabase inicializado - Casa Nuvera');
        
        // Notificar que Supabase está listo
        window.dispatchEvent(new CustomEvent('supabaseReady'));
        return;
    }
    
    // Reintentar en 100ms si no está listo
    setTimeout(checkSupabaseReady, 100);
}

// Iniciar cuando el script se carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSupabaseReady);
} else {
    checkSupabaseReady();
}
