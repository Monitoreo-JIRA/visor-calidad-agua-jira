// ==========================================
// SITIOS DE MONITOREO
// ==========================================

let capaSitios = null;
let sitioSeleccionado = null;


/**
 * Cargar la capa de sitios después de que
 * el histórico esté disponible.
 */
async function cargarSitiosMonitoreo() {
    try {
        // Esperar a que termine de leerse el Excel
        await datosHistoricosListos;

       const respuesta = await fetch(
    'data/geojson/Sitios_monitoreo.geojson?v=2'
);

        if (!respuesta.ok) {
            throw new Error(
                'No se pudo cargar el archivo de sitios de monitoreo'
            );
        }

        const datos = await respuesta.json();

        const sitiosSinId = [];

        capaSitios = L.geoJSON(datos, {

            // Convertir cada punto en un círculo
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    pane: 'sitiosPane',
                    radius: 4.5,
                    color: '#ffffff',
                    weight: 1,
                    fillColor: '#566d78',
                    fillOpacity: 0.95
                });
            },

            // Información y comportamiento de cada sitio
            onEachFeature: function (feature, layer) {
                const propiedades =
                    feature.properties ?? {};

                const nombre =
                    propiedades.Sitio ??
                    propiedades['Sitios de monitoreo'] ??
                    'Sitio sin nombre';

                // Obtener automáticamente el ID desde el Excel
                const id =
                    obtenerIdPorNombre(nombre);

                const subcuenca =
                    propiedades.Subcuenca ??
                    'Sin información';

                const microcuenca =
                    propiedades.Microcuenca ??
                    'Sin información';

                const municipio =
                    propiedades.Municipio ??
                    'Sin información';

                const localidad =
                    propiedades.Localidad ??
                    'Sin información';

                const altitud =
                    propiedades.Altitud ??
                    'Sin información';

                // Guardar información útil dentro de la capa
                layer.idSitio = id;
                layer.nombreSitio = nombre;

                if (id === 'Sin ID') {
                    sitiosSinId.push(nombre);
                }

                // Tooltip al pasar el cursor
                layer.bindTooltip(nombre, {
                    sticky: true,
                    direction: 'top'
                });

                // Popup inicial del sitio
                layer.bindPopup(`
                    <div class="popup-sitio">
                        <h3>${nombre}</h3>

                        <div class="popup-linea">
                            <span class="popup-etiqueta">ID</span>
                            <span>${id}</span>
                        </div>

                        <div class="popup-linea">
                            <span class="popup-etiqueta">
                                Subcuenca
                            </span>
                            <span>${subcuenca}</span>
                        </div>

                        <div class="popup-linea">
                            <span class="popup-etiqueta">
                                Microcuenca
                            </span>
                            <span>${microcuenca}</span>
                        </div>

                        <div class="popup-linea">
                            <span class="popup-etiqueta">
                                Municipio
                            </span>
                            <span>${municipio}</span>
                        </div>

                        <div class="popup-linea">
                            <span class="popup-etiqueta">
                                Localidad
                            </span>
                            <span>${localidad}</span>
                        </div>

                        <div class="popup-linea">
                            <span class="popup-etiqueta">
                                Altitud
                            </span>
                            <span>${altitud} m s. n. m.</span>
                        </div>

                        <hr>

                        <div class="popup-mensaje">
                            Selecciona un año y un mes para consultar
                            los resultados de calidad del agua.
                        </div>
                    </div>
                `);

                // Seleccionar el sitio
                layer.on('click', function () {
                    sitioSeleccionado = {
                        id: id,
                        nombre: nombre
                    };

                    console.log(
                        'Sitio seleccionado:',
                        sitioSeleccionado
                    );

                    // Actualizar la tabla fisicoquímica
                    // únicamente si ese módulo está activo
                    if (
                        typeof mostrarResultadosFisicoquimicos ===
                        'function'
                    ) {
                        mostrarResultadosFisicoquimicos(
                            id,
                            nombre
                        );
                    }
                });

                // Efecto al pasar el cursor
                layer.on({
                    mouseover: function (evento) {
                        evento.target.setStyle({
                            radius: 6,
                            weight: 2
                        });

                        evento.target.bringToFront();
                    },

                    mouseout: function (evento) {
                        evento.target.setStyle({
                            radius: 4.5,
                            weight: 1
                        });
                    }
                });
            }

        }).addTo(map);

        // Mantener los sitios encima de las subcuencas
        capaSitios.bringToFront();

        // Agregar la capa al selector de Leaflet
        controlCapas.addOverlay(
            capaSitios,
            'Sitios de monitoreo'
        );

        console.log(
            'Sitios cargados:',
            capaSitios.getLayers().length
        );

        if (sitiosSinId.length > 0) {
            console.warn(
                'Sitios sin coincidencia de ID:',
                sitiosSinId
            );
        } else {
            console.log(
                'Todos los sitios tienen ID histórico.'
            );
        }

    } catch (error) {
        console.error(
            'Error al cargar los sitios:',
            error
        );
    }
}


// Iniciar la carga
cargarSitiosMonitoreo();