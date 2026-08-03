// ===============================
// CAPAS BASE DEL VISOR
// ===============================

// Mapa base de OpenStreetMap
const mapaCalles = L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }
);

// Imagen satelital de Esri
const mapaSatelital = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
    }
);

// Mostrar el mapa satelital al iniciar
mapaSatelital.addTo(map);

// Capas base disponibles
const mapasBase = {
    'Satélite': mapaSatelital,
    'Mapa': mapaCalles
};

// Crear el control de capas
const controlCapas = L.control.layers(
    mapasBase,
    {},
    {
        position: 'topright',
        collapsed: false
    }
).addTo(map);

// Agregar escala
L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false
}).addTo(map);