// ==========================================
// SITIOS DE MONITOREO
// ==========================================

let capaSitios = null;
let sitioSeleccionado = null;

function obtenerFotografiaSitio(id) {
    const idSitio = String(id ?? '')
        .trim()
        .toUpperCase();

    if (!/^S\d+$/.test(idSitio)) {
        return '';
    }

    return `
        <div class="popup-fotografia">
            <img
                src="images/sitios/${idSitio}.jpg"
                alt="Fotografía de referencia del sitio ${idSitio}"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.textContent =
                        'Fotografía no disponible';
                "
            >
            <p>Fotografía de referencia del sitio</p>
        </div>
    `;
}

/**
 * Cargar la capa de sitios después de que
 * el histórico esté disponible.
 */
async function cargarSitiosMonitoreo() {
    try {
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

        capaSitios = L.geoJSON(
            datos,
            {
                pointToLayer: function (
                    feature,
                    latlng
                ) {
                    return L.circleMarker(
                        latlng,
                        {
                            pane: 'sitiosPane',
                            radius: 4.5,
                            color: '#ffffff',
                            weight: 1,
                            fillColor: '#566d78',
                            fillOpacity: 0.95
                        }
                    );
                },

                onEachFeature: function (
                    feature,
                    layer
                ) {
                    const propiedades =
                        feature.properties ?? {};

                    const nombre =
                        propiedades.Sitio ??
                        propiedades['Sitios de monitoreo'] ??
                        'Sitio sin nombre';

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

                    layer.idSitio = id;
                    layer.nombreSitio = nombre;

                    if (id === 'Sin ID') {
                        sitiosSinId.push(nombre);
                    }

                    layer.bindTooltip(
                        nombre,
                        {
                            sticky: true,
                            direction: 'top'
                        }
                    );


layer.bindPopup(`
    <div class="popup-sitio">
        <h3>${nombre}</h3>

        ${obtenerFotografiaSitio(id)}

        <div class="popup-linea">
            <span class="popup-etiqueta">ID</span>
            <span>${id}</span>
        </div>

        <div class="popup-linea">
            <span class="popup-etiqueta">Municipio</span>
            <span>${municipio}</span>
        </div>

        <div class="popup-linea">
            <span class="popup-etiqueta">Localidad</span>
            <span>${localidad}</span>
        </div>

        <hr>

        <div class="popup-mensaje">
            Selecciona un año y un mes para consultar
            los resultados de calidad del agua.
        </div>
    </div>
`);


                    layer.on(
                        'click',
                        function () {
                            sitioSeleccionado = {
                                id: id,
                                nombre: nombre
                            };

                            console.log(
                                'Sitio seleccionado:',
                                sitioSeleccionado
                            );

                            if (
                                typeof mostrarResultadosFisicoquimicos ===
                                'function'
                            ) {
                                mostrarResultadosFisicoquimicos(
                                    id,
                                    nombre
                                );
                            }
                        }
                    );

                    layer.on({
                        mouseover:
                            function (evento) {
                                evento.target.setStyle({
                                    radius: 6,
                                    weight: 2
                                });

                                evento.target.bringToFront();
                            },

                        mouseout:
                            function (evento) {
                                evento.target.setStyle({
                                    radius: 4.5,
                                    weight: 1
                                });
                            }
                    });
                }
            }
        ).addTo(map);

        window.capaSitios = capaSitios;

        capaSitios.bringToFront();

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


cargarSitiosMonitoreo();
