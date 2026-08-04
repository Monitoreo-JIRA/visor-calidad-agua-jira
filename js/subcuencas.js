// ==========================================
// SUBCUENCAS
// ==========================================


// Elegir el color de cada subcuenca
function colorSubcuenca(nombre) {

    switch (nombre) {

        case 'Armería':
            return '#D7A95A';   // ocre

        case 'Ayuquila':
            return '#2F80C1';   // azul institucional

        case 'Tuxcacuesco':
            return '#6FAE6A';   // verde bosque suave

        default:
            return '#B5BDC3';

    }

}


// Cargar la capa de subcuencas
fetch('data/geojson/Subcuencas.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(
                'No se pudo cargar el archivo GeoJSON'
            );
        }

        return response.json();
    })
    .then(datos => {
        window.capaSubcuencas = L.geoJSON(
            datos,
            {
                pane: 'subcuencasPane',

                style: function (feature) {
                    return {
                        color: '#5F6D75',
                        weight: 1,
                        opacity: 0.75,

                        fillColor: colorSubcuenca(
                            feature.properties.description
                        ),

                        fillOpacity: 0.30
                    };
                },

                onEachFeature: function (
                    feature,
                    layer
                ) {
                    const nombre =
                        feature.properties.description;

                    layer.bindTooltip(
                        nombre,
                        {
                            sticky: true
                        }
                    );

                    layer.on({
                        mouseover: function (
                            evento
                        ) {
                            evento.target.setStyle({
                                color: '#176f8f',
                                weight: 2.2,
                                opacity: 1,
                                fillOpacity: 0.34
                            });

                            evento.target.bringToFront();
                        },

                        mouseout: function (
                            evento
                        ) {
                            window.capaSubcuencas.resetStyle(
                                evento.target
                            );

                            if (
                                typeof capaSitios !==
                                    'undefined' &&
                                capaSitios
                            ) {
                                capaSitios.bringToFront();
                            }
                        }
                    });
                }
            }
        ).addTo(map);


        // Agregar las subcuencas
        // al control de capas
        controlCapas.addOverlay(
            window.capaSubcuencas,
            'Subcuencas'
        );


        // Ajustar el mapa para mostrar
        // todas las subcuencas
        map.fitBounds(
            window.capaSubcuencas.getBounds()
        );
    })
    .catch(error => {
        console.error(
            'Error al cargar las subcuencas:',
            error
        );
    });