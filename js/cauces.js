// ==========================================
// CAUCES MONITOREADOS
// ==========================================

fetch(
    'data/geojson/Cauces_monitoreados.geojson'
)
    .then(function (response) {
        if (!response.ok) {
            throw new Error(
                'No se pudo cargar el GeoJSON de cauces.'
            );
        }

        return response.json();
    })
    .then(function (datos) {
        const capaCauces =
            L.geoJSON(
                datos,
                {
                    pane: 'overlayPane',

                    style: function () {
                        return {
                            color: '#2F80C1',
                            weight: 1.8,
                            opacity: 0.85,
                            lineCap: 'round',
                            lineJoin: 'round'
                        };
                    },

                    onEachFeature:
                        function (
                            feature,
                            layer
                        ) {
                            const nombre =
                                feature
                                    .properties
                                    .Name ||
                                'Cauce monitoreado';

                            layer.bindTooltip(
                                nombre,
                                {
                                    sticky: true
                                }
                            );

                            layer.on({
                                mouseover:
                                    function (
                                        evento
                                    ) {
                                        evento
                                            .target
                                            .setStyle({
                                                color:
                                                    '#1565C0',
                                                weight:
                                                    3
                                            });
                                    },

                                mouseout:
                                    function (
                                        evento
                                    ) {
                                        capaCauces
                                            .resetStyle(
                                                evento
                                                    .target
                                            );
                                    }
                            });
                        }
                }
            );

        capaCauces.addTo(map);

        controlCapas.addOverlay(
            capaCauces,
            'Cauces monitoreados'
        );

        // Exponer la capa para el control
        // flotante de visibilidad.
        window.capaCauces =
            capaCauces;
    })
    .catch(function (error) {
        console.error(
            'Error al cargar los cauces:',
            error
        );
    });
