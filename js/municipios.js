
 // ==========================================
 // LÍMITES MUNICIPALES JIRA
 // ==========================================

 const coloresMunicipios = [
    '#E76F51', // Coral
    '#2A9D8F', // Verde turquesa
    '#E9C46A', // Amarillo
    '#8E7DBE', // Violeta
    '#457B9D', // Azul
    '#F4A261', // Naranja
    '#7A9E7E', // Verde
    '#D17A9B', // Rosa
    '#A67C52', // Café
    '#6C9BCF'  // Azul claro
];

const coloresPorMunicipio = {};
 fetch('data/geojson/Municipios_JIRA.geojson')
     .then(response => {
         if (!response.ok) {
             throw new Error('No se pudo cargar el GeoJSON municipal');
         }
         return response.json();
     })
     .then(datos => {
         window.capaMunicipios = L.geoJSON(datos, {
    pane: 'municipiosPane',

style: function (feature) {
    const nombre = feature.properties?.NOMBRE
        ?? 'Municipio sin nombre';

    if (!coloresPorMunicipio[nombre]) {
        const indice = Object.keys(coloresPorMunicipio).length;

        coloresPorMunicipio[nombre] =
            coloresMunicipios[indice % coloresMunicipios.length];
    }

    return {
        color: '#FFFFFF',
        weight: 0.5,
        opacity: 0.9,
        dashArray: null,
        fill: true,
        fillColor: coloresPorMunicipio[nombre],
        fillOpacity: 0.30,
        interactive: true
    };
},

             onEachFeature: function (feature, layer) {
    const nombre = feature.properties?.NOMBRE
        ?? 'Municipio sin nombre';

    layer.bindTooltip(nombre, {
        sticky: true,
        direction: 'top',
        opacity: 0.95
    });
}
         });

         // Disponible en el control de capas,
         // inicialmente desactivada.
         controlCapas.addOverlay(
             window.capaMunicipios,
             'Límites municipales'
         );
         window.capaMunicipios.addTo(map);

         console.log('Límites municipales cargados');
         console.log(
    'Municipios encontrados:',
    window.capaMunicipios.getLayers().length
);

console.log(
    'Extensión geográfica:',
    window.capaMunicipios.getBounds().toBBoxString()
);
     })
     .catch(error => {
         console.error(
             'Error al cargar límites municipales:',
             error
         );
       
     });
