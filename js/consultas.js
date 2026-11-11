// ==========================================
// CONSULTA DE RESULTADOS
// ==========================================

console.log('consultas.js cargado correctamente');

const botonConsultar =
    document.querySelector('.boton-consulta');

const colorSinDatos = '#9e9e9e';
const colorApto = '#2e9d50';
const colorCercaCriterio = '#f2c94c';
const colorNoApto = '#d9363e';


function obtenerValorEcoli(registro) {
    if (!registro) {
        return null;
    }

    const valorOriginal = registro.E_coli_100mL;

    // Detectar valores sin dato antes de convertirlos a número
    if (
        valorOriginal === undefined ||
        valorOriginal === null ||
        valorOriginal === '' ||
        String(valorOriginal).trim() === '' ||
        String(valorOriginal).trim().toLowerCase() === 'sd' ||
        String(valorOriginal).trim().toLowerCase() === 'sin datos'
    ) {
        return null;
    }

    const eColi = Number(valorOriginal);

    if (!Number.isFinite(eColi)) {
        return null;
    }

    return eColi;
}



function obtenerColorResultado(registro) {
    const eColi = obtenerValorEcoli(registro);

    if (eColi === null) {
        return colorSinDatos;
    }

    if (eColi < 100) {
        return colorApto;
    }

    if (eColi <= 235) {
        return colorCercaCriterio;
    }

    return colorNoApto;
}


function obtenerAptitudResultado(registro) {
    const eColi = obtenerValorEcoli(registro);

    if (eColi === null) {
        return 'Sin datos';
    }

    if (eColi < 100) {
        return 'Aptitud favorable';
    }

    if (eColi <= 235) {
        return 'Precaución';
    }

    return 'Aptitud desfavorable';
}


function obtenerInterpretacionResultado(registro) {
    const eColi = obtenerValorEcoli(registro);

    if (eColi === null) {
        return 'Sin datos';
    }

    if (eColi < 100) {
        return 'Concentración baja de <em>E. coli</em>';
    }

    if (eColi <= 235) {
        return 'Concentración cercana al valor de referencia';
    }

    return 'Supera el valor de referencia';
}


function formatearValor(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ''
    ) {
        return 'SD';
    }

    const numero = Number(valor);

    if (Number.isFinite(numero)) {
        return numero.toLocaleString('es-MX');
    }

    return String(valor);
}


function obtenerNombreCapa(layer) {
    const propiedades =
        layer.feature?.properties ?? {};

    return (
        layer.nombreSitio ??
        propiedades.Sitio ??
        propiedades['Sitios de monitoreo'] ??
        'Sitio sin nombre'
    );
}


function obtenerIdCapa(layer) {
    if (
        layer.idSitio &&
        layer.idSitio !== 'Sin ID'
    ) {
        return String(layer.idSitio).trim();
    }

    const propiedades =
        layer.feature?.properties ?? {};

    const idGeoJSON =
        propiedades.ID_Sitio ??
        propiedades.ID;

    if (
        idGeoJSON &&
        String(idGeoJSON).startsWith('S')
    ) {
        return String(idGeoJSON).trim();
    }

    const nombre =
        obtenerNombreCapa(layer);

    const nombreNormalizado =
        normalizarNombre(nombre);

    const coincidencia =
        datosHistoricos.find(registro =>
            normalizarNombre(registro.Sitio) ===
            nombreNormalizado
        );

    return coincidencia
        ? String(coincidencia.ID_Sitio).trim()
        : null;
}


function crearPopupResultado(
    layer,
    registro,
    anio,
    periodo
) {
    const propiedades =
        layer.feature?.properties ?? {};

    const nombre =
        obtenerNombreCapa(layer);

    const id =
        registro?.ID_Sitio ??
        obtenerIdCapa(layer) ??
        'Sin ID';

    const municipio =
        propiedades.Municipio ??
        registro?.Municipio ??
        'Sin información';

    const localidad =
        propiedades.Localidad ??
        registro?.Localidad ??
        'Sin información';

// Fotografía de referencia del sitio de monitoreo
   const fotografia = obtenerFotografiaSitio(id);

    const informacionSitio = `
        <h3>${nombre}</h3>

        ${fotografia}

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

        <div class="popup-linea">
            <span class="popup-etiqueta">Periodo</span>
            <span>${periodo} ${anio}</span>
        </div>
    `;

    if (!registro) {
        return `
            <div class="popup-sitio">
                ${informacionSitio}

                <div class="popup-mensaje">
                    Sin datos disponibles para este sitio.
                </div>
            </div>
        `;
    }

    return `
        <div class="popup-sitio">
            ${informacionSitio}

            <div class="popup-linea">
                <span class="popup-etiqueta"><i>E. coli</i></span>
                <span>
                    ${formatearValor(
                        registro.E_coli_100mL
                    )} UFC/100 mL
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">Coliformes</span>
                <span>
                    ${formatearValor(
                        registro.Coliformes_Totales_100mL
                    )} UFC/100 mL
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">Aptitud</span>
                <span>
                    ${obtenerAptitudResultado(registro)}
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">Interpretación</span>
                <span>
                    ${obtenerInterpretacionResultado(registro)}
                </span>
            </div>
        </div>
    `;
}

// ==========================================
// FILTRAR SITIOS POR COLOR DE RESULTADO
// ==========================================

const filtroResultado =
    document.getElementById('filtro-resultado');

const mensajeFiltroResultado =
    document.getElementById('mensaje-filtro-resultado');

let resultadosConsultaActual = null;

function aplicarFiltroResultado() {
    if (!filtroResultado || !resultadosConsultaActual || !capaSitios) {
        return;
    }

    const seleccion = filtroResultado.value;

    const colores = {
        verde: colorApto,
        amarillo: colorCercaCriterio,
        rojo: colorNoApto,
        gris: colorSinDatos
    };

    capaSitios.eachLayer(function (layer) {
        const id = obtenerIdCapa(layer);

        const registro = id
            ? resultadosConsultaActual.get(id)
            : null;

        const color = obtenerColorResultado(registro);

        const mostrar =
            seleccion === 'todos' ||
            color === colores[seleccion];

        if (mostrar) {
            layer.setStyle({
                opacity: 1,
                fillOpacity: 0.95
            });

            // Reactivar la interacción
            if (layer.getElement()) {
                layer.getElement().style.pointerEvents = 'auto';
            }

        } else {
            layer.setStyle({
                opacity: 0,
                fillOpacity: 0
            });

            // Impedir clics y etiquetas en puntos ocultos
            if (layer.getElement()) {
                layer.getElement().style.pointerEvents = 'none';
            }

            // Cerrar una ventana emergente si estaba abierta
            if (layer.isPopupOpen()) {
                layer.closePopup();
            }

            // Cerrar la etiqueta si estaba abierta
            if (layer.isTooltipOpen()) {
                layer.closeTooltip();
            }
        }
    });
}

if (filtroResultado) {
    filtroResultado.addEventListener(
        'change',
        aplicarFiltroResultado
    );
}
// Actualizar el círculo del resultado seleccionado

const circuloFiltroResultado =
    document.getElementById('circulo-filtro-resultado');

function actualizarCirculoFiltroResultado() {
    const circulo = document.querySelector(
        '#boton-filtro-resultado .circulo-resultado'
    );

    if (circulo) {
        circulo.className = 'circulo-resultado ' + filtroResultado.value;
    }
}

filtroResultado.addEventListener(
    'change',
    actualizarCirculoFiltroResultado
);
function consultarResultados() {
    const anio =
        document.getElementById(
            'filtro-anio'
        ).value;

    const periodo =
        document.getElementById(
            'filtro-mes'
        ).value;

    if (!anio || !periodo) {
        alert(
            'Selecciona un año y un mes antes de consultar.'
        );

        return;
    }
    const leyendaPeriodo =
    document.getElementById('leyenda-periodo');

if (leyendaPeriodo) {
    leyendaPeriodo.textContent =
        `Periodo consultado: ${periodo} ${anio}`;
}

    if (
        typeof capaSitios === 'undefined' ||
        !capaSitios
    ) {
        console.error(
            'La capa de sitios todavía no está disponible.'
        );

        return;
    }

    const registrosFiltrados =
        datosHistoricos.filter(registro =>
            String(registro['Año']) ===
                String(anio) &&
            String(
                registro.Periodo_Muestreo
            ).trim() ===
                String(periodo).trim()
        );

    const resultadosPorId =
        new Map();

    registrosFiltrados.forEach(registro => {
        const id = String(
            registro.ID_Sitio ?? ''
        ).trim();

        if (id) {
            resultadosPorId.set(
                id,
                registro
            );
        }
    });

// Guardar los resultados del periodo consultado
resultadosConsultaActual = resultadosPorId;

// Activar el selector de colores
if (filtroResultado) {
    filtroResultado.disabled = false;
    filtroResultado.value = 'todos';

actualizarCirculoFiltroResultado();
}

if (mensajeFiltroResultado) {
    mensajeFiltroResultado.textContent =
        'Selecciona un color para filtrar los sitios del mapa.';
}
    let sitiosConDatos = 0;
    let sitiosSinDatos = 0;

    capaSitios.eachLayer(layer => {
        const id =
            obtenerIdCapa(layer);

        const registro = id
            ? resultadosPorId.get(id)
            : null;

        const color =
            obtenerColorResultado(registro);

       layer.setStyle({
    radius: 4.5,
    color: '#ffffff',
    weight: 1,
    fillColor: color,
    fillOpacity: 0.95
});

        layer.bindPopup(
            crearPopupResultado(
                layer,
                registro,
                anio,
                periodo
            )
        );

        if (registro) {
            sitiosConDatos++;
        } else {
            sitiosSinDatos++;
        }
    });
aplicarFiltroResultado();
    capaSitios.bringToFront();

    console.log(
        `Consulta ${periodo} ${anio}:`,
        {
            registrosEncontrados:
                registrosFiltrados.length,
            sitiosConDatos,
            sitiosSinDatos
        }
    );
}


if (botonConsultar) {
    botonConsultar.addEventListener(
        'click',
        consultarResultados
    );

    console.log(
        'Botón Consultar conectado correctamente.'
    );
} else {
    console.error(
        'No se encontró el botón Consultar.'
    );
}
