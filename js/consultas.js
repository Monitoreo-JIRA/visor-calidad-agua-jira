// ==========================================
// CONSULTA DE RESULTADOS
// ==========================================

console.log('consultas.js cargado correctamente');

const botonConsultar =
    document.querySelector('.boton-consulta');

const colorSinDatos = '#9e9e9e';
const colorBajo = '#2e9d50';
const colorModerado = '#f2c94c';
const colorAlto = '#d9363e';


function obtenerColorResultado(registro) {
    if (!registro) {
        return colorSinDatos;
    }

    const nivel = String(
        registro.Nivel_Atencion_Calculado ?? ''
    )
        .trim()
        .toLowerCase();

    if (nivel === 'bajo') {
        return colorBajo;
    }

    if (nivel === 'moderado') {
        return colorModerado;
    }

    if (nivel === 'alto') {
        return colorAlto;
    }

    return colorSinDatos;
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

    const subcuenca =
        propiedades.Subcuenca ??
        registro?.Subcuenca ??
        'Sin información';

    const microcuenca =
        propiedades.Microcuenca ??
        registro?.Microcuenca ??
        'Sin información';

    const municipio =
        propiedades.Municipio ??
        registro?.Municipio ??
        'Sin información';

    const localidad =
        propiedades.Localidad ??
        registro?.Localidad ??
        'Sin información';

    const altitud =
        propiedades.Altitud ??
        registro?.Altitud ??
        'Sin información';

    if (!registro) {
        return `
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
                    <span>
                        ${altitud} m s. n. m.
                    </span>
                </div>

                <hr>

                <div class="popup-linea">
                    <span class="popup-etiqueta">
                        Periodo
                    </span>
                    <span>${periodo} ${anio}</span>
                </div>

                <div class="popup-mensaje">
                    Sin datos disponibles para este sitio.
                </div>
            </div>
        `;
    }

    return `
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
                <span>
                    ${altitud} m s. n. m.
                </span>
            </div>

            <hr>

            <div class="popup-linea">
                <span class="popup-etiqueta">
                    Periodo
                </span>
                <span>${periodo} ${anio}</span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">
                    E. coli
                </span>
                <span>
                    ${formatearValor(
                        registro.E_coli_100mL
                    )} NMP/100 mL
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">
                    Coliformes
                </span>
                <span>
                    ${formatearValor(
                        registro
                            .Coliformes_Totales_100mL
                    )} NMP/100 mL
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">
                    Aptitud
                </span>
                <span>
                    ${
                        registro
                            .Aptitud_Recreativa_Calculada ??
                        'SD'
                    }
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">
                    Nivel
                </span>
                <span>
                    ${
                        registro
                            .Nivel_Atencion_Calculado ??
                        'SD'
                    }
                </span>
            </div>

            <div class="popup-linea">
                <span class="popup-etiqueta">
                    Interpretación
                </span>
                <span>
                    ${
                        registro
                            .Interpretacion_Calculada ??
                        'Sin datos'
                    }
                </span>
            </div>
        </div>
    `;
}


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