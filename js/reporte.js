// ==========================================
// REPORTE ANUAL POR SITIO
// ==========================================

const botonReporte =
    document.getElementById('boton-reporte');

const modalReporte =
    document.getElementById('modal-reporte');

const botonCerrarReporte =
    document.getElementById('cerrar-reporte');

const botonImprimirReporte =
    document.getElementById('imprimir-reporte');

const tituloReporte =
    document.getElementById('titulo-reporte');

const anioReporte =
    document.getElementById('anio-reporte');

const fechaReporte =
    document.getElementById('fecha-reporte');

const contenidoReporte =
    document.getElementById('contenido-reporte');


// Gráficas internas del reporte
let graficaReporteBacteriologica = null;
let graficaReporteFisicoquimica = null;


// Periodos programados de monitoreo
const mesesReporte = [
    {
        clave: 'Feb',
        nombre: 'Febrero'
    },
    {
        clave: 'Abr',
        nombre: 'Abril'
    },
    {
        clave: 'Jun',
        nombre: 'Junio'
    },
    {
        clave: 'Ago',
        nombre: 'Agosto'
    },
    {
        clave: 'Oct',
        nombre: 'Octubre'
    },
    {
        clave: 'Dic',
        nombre: 'Diciembre'
    }
];


// Parámetros disponibles en la gráfica fisicoquímica
const parametrosFisicoquimicosReporte = {
    pH: {
        campo: 'pH',
        etiqueta: 'pH',
        unidad: ''
    },

    Oxigeno_Disuelto_mg_L: {
        campo: 'Oxigeno_Disuelto_mg_L',
        etiqueta: 'Oxígeno disuelto',
        unidad: 'mg/L'
    },

    Oxigeno_Disuelto_pct: {
        campo: 'Oxigeno_Disuelto_pct',
        etiqueta: 'Saturación de OD',
        unidad: '%'
    },

    Temperatura_Agua_C: {
        campo: 'Temperatura_Agua_C',
        etiqueta: 'Temperatura del agua',
        unidad: '°C'
    },

    Conductividad_uS_cm: {
        campo: 'Conductividad_uS_cm',
        etiqueta: 'Conductividad',
        unidad: 'µS/cm'
    },

    TDS_ppm: {
        campo: 'TDS_ppm',
        etiqueta: 'TDS',
        unidad: 'ppm'
    },

    Salinidad_PSU: {
        campo: 'Salinidad_PSU',
        etiqueta: 'Salinidad',
        unidad: 'PSU'
    }
};


// ==========================================
// FUNCIONES GENERALES
// ==========================================

function convertirNumeroReporte(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ''
    ) {
        return null;
    }

    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : null;
}


function formatearNumeroReporte(valor) {
    const numero =
        convertirNumeroReporte(valor);

    if (numero === null) {
        return 'SD';
    }

    return numero.toLocaleString(
        'es-MX',
        {
            maximumFractionDigits: 2
        }
    );
}


function formatearDatoReporte(
    valor,
    unidad = ''
) {
    const texto =
        formatearNumeroReporte(valor);

    if (texto === 'SD') {
        return 'SD';
    }

    return unidad
        ? `${texto} ${unidad}`
        : texto;
}


function convertirValorLogaritmicoReporte(valor) {
    const numero =
        convertirNumeroReporte(valor);

    if (numero === null) {
        return null;
    }

    // La escala logarítmica no admite cero.
    // Solo para dibujar, el cero se representa en 1.
    if (numero <= 0) {
        return 1;
    }

    return numero;
}


function destruirGraficasReporte() {
    if (graficaReporteBacteriologica) {
        graficaReporteBacteriologica.destroy();
        graficaReporteBacteriologica = null;
    }

    if (graficaReporteFisicoquimica) {
        graficaReporteFisicoquimica.destroy();
        graficaReporteFisicoquimica = null;
    }
}


// ==========================================
// INFORMACIÓN DEL SITIO
// ==========================================

function obtenerInformacionSitioReporte(idSitio) {
    let informacion = null;

    if (!capaSitios) {
        return informacion;
    }

    capaSitios.eachLayer(layer => {
        if (
            String(layer.idSitio) ===
            String(idSitio)
        ) {
            const propiedades =
                layer.feature?.properties ?? {};

            informacion = {
                nombre:
                    layer.nombreSitio ??
                    propiedades.Sitio ??
                    propiedades[
                        'Sitios de monitoreo'
                    ] ??
                    'Sitio sin nombre',

                id:
                    layer.idSitio ??
                    'Sin ID',

                subcuenca:
                    propiedades.Subcuenca ??
                    'Sin información',

                microcuenca:
                    propiedades.Microcuenca ??
                    'Sin información',

                municipio:
                    propiedades.Municipio ??
                    'Sin información',

                localidad:
                    propiedades.Localidad ??
                    'Sin información',

                altitud:
                    propiedades.Altitud ??
                    'Sin información'
            };
        }
    });

    return informacion;
}


// ==========================================
// REGISTROS ANUALES
// ==========================================

function obtenerRegistrosAnualesReporte(
    idSitio,
    anio
) {
    return datosHistoricos.filter(registro =>
        String(
            registro.ID_Sitio ?? ''
        ).trim() ===
            String(idSitio).trim() &&

        String(
            registro['Año'] ?? ''
        ) ===
            String(anio)
    );
}


function obtenerRegistroMesReporte(
    registros,
    claveMes
) {
    return registros.find(registro =>
        String(
            registro.Periodo_Muestreo ?? ''
        ).trim() === claveMes
    );
}


// ==========================================
// RESUMEN BACTERIOLÓGICO
// ==========================================

function obtenerResumenAnualReporte(registros) {
    const registrosConEcoli =
        registros.filter(registro =>
            convertirNumeroReporte(
                registro.E_coli_100mL
            ) !== null
        );

    const registrosAptos =
        registrosConEcoli.filter(registro =>
            convertirNumeroReporte(
                registro.E_coli_100mL
            ) <= 200
        );

    const registrosNoAptos =
        registrosConEcoli.filter(registro =>
            convertirNumeroReporte(
                registro.E_coli_100mL
            ) > 200
        );

    let registroMaximo = null;
    let registroMinimo = null;

    registrosConEcoli.forEach(registro => {
        const valor =
            convertirNumeroReporte(
                registro.E_coli_100mL
            );

        if (
            !registroMaximo ||
            valor >
                convertirNumeroReporte(
                    registroMaximo.E_coli_100mL
                )
        ) {
            registroMaximo = registro;
        }

        if (
            !registroMinimo ||
            valor <
                convertirNumeroReporte(
                    registroMinimo.E_coli_100mL
                )
        ) {
            registroMinimo = registro;
        }
    });

    return {
        monitoreos:
            registrosConEcoli.length,

        aptos:
            registrosAptos.length,

        noAptos:
            registrosNoAptos.length,

        registroMaximo,

        registroMinimo
    };
}


// ==========================================
// FILAS DE LA TABLA BACTERIOLÓGICA
// ==========================================

function crearFilasBacteriologicasReporte(
    registros
) {
    return mesesReporte
        .map(mes => {
            const registro =
                obtenerRegistroMesReporte(
                    registros,
                    mes.clave
                );

            if (!registro) {
                return `
                    <tr class="fila-sin-datos">
                        <td>${mes.nombre}</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                    </tr>
                `;
            }

            const aptitud =
                registro
                    .Aptitud_Recreativa_Calculada ??
                'SD';

            const nivel =
                registro
                    .Nivel_Atencion_Calculado ??
                'SD';

            return `
                <tr>
                    <td>${mes.nombre}</td>

                    <td>
                        ${formatearNumeroReporte(
                            registro.E_coli_100mL
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro
                                .Coliformes_Totales_100mL
                        )}
                    </td>

                    <td>${aptitud}</td>

                    <td>${nivel}</td>
                </tr>
            `;
        })
        .join('');
}


// ==========================================
// FILAS DE LA TABLA FISICOQUÍMICA
// ==========================================

function crearFilasFisicoquimicasReporte(
    registros
) {
    return mesesReporte
        .map(mes => {
            const registro =
                obtenerRegistroMesReporte(
                    registros,
                    mes.clave
                );

            if (!registro) {
                return `
                    <tr class="fila-sin-datos">
                        <td>${mes.nombre}</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                        <td>SD</td>
                    </tr>
                `;
            }

            return `
                <tr>
                    <td>${mes.nombre}</td>

                    <td>
                        ${formatearNumeroReporte(
                            registro.pH
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro
                                .Oxigeno_Disuelto_mg_L
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro
                                .Oxigeno_Disuelto_pct
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro
                                .Temperatura_Agua_C
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro
                                .Conductividad_uS_cm
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro.TDS_ppm
                        )}
                    </td>

                    <td>
                        ${formatearNumeroReporte(
                            registro.Salinidad_PSU
                        )}
                    </td>
                </tr>
            `;
        })
        .join('');
}


// ==========================================
// GRÁFICA BACTERIOLÓGICA DEL REPORTE
// ==========================================

function dibujarGraficaBacteriologicaReporte(
    registros
) {
    const canvas =
        document.getElementById(
            'grafica-reporte-bacteriologica'
        );

    if (!canvas) {
        return;
    }

    const etiquetas =
        mesesReporte.map(mes => mes.clave);

    const valoresEcoli =
        mesesReporte.map(mes => {
            const registro =
                obtenerRegistroMesReporte(
                    registros,
                    mes.clave
                );

            return registro
                ? convertirValorLogaritmicoReporte(
                    registro.E_coli_100mL
                )
                : null;
        });

    const valoresColiformes =
        mesesReporte.map(mes => {
            const registro =
                obtenerRegistroMesReporte(
                    registros,
                    mes.clave
                );

            return registro
                ? convertirValorLogaritmicoReporte(
                    registro
                        .Coliformes_Totales_100mL
                )
                : null;
        });

    graficaReporteBacteriologica =
        new Chart(
            canvas,
            {
                type: 'line',

                data: {
                    labels: etiquetas,

                    datasets: [
                        {
                            label:
                                'E. coli (NMP/100 mL)',

                            data:
                                valoresEcoli,

                            tension: 0.25,
                            spanGaps: false
                        },

                        {
                            label:
                                'Coliformes totales (NMP/100 mL)',

                            data:
                                valoresColiformes,

                            tension: 0.25,
                            spanGaps: false
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    interaction: {
                        mode: 'index',
                        intersect: false
                    },

                    plugins: {
                        legend: {
                            position: 'top'
                        },

                        tooltip: {
                            callbacks: {
                                label:
                                    function (contexto) {
                                        const mes =
                                            mesesReporte[
                                                contexto
                                                    .dataIndex
                                            ];

                                        const registro =
                                            obtenerRegistroMesReporte(
                                                registros,
                                                mes.clave
                                            );

                                        if (!registro) {
                                            return (
                                                contexto
                                                    .dataset
                                                    .label +
                                                ': SD'
                                            );
                                        }

                                        const valorReal =
                                            contexto.datasetIndex ===
                                            0
                                                ? registro
                                                    .E_coli_100mL
                                                : registro
                                                    .Coliformes_Totales_100mL;

                                        return (
                                            contexto
                                                .dataset
                                                .label +
                                            ': ' +
                                            formatearNumeroReporte(
                                                valorReal
                                            ) +
                                            ' NMP/100 mL'
                                        );
                                    }
                            }
                        },

                        annotation: {
                            annotations: {
                                criterioEcoli: {
                                    type: 'line',
                                    yMin: 200,
                                    yMax: 200,

                                    borderColor:
                                        '#444444',

                                    borderWidth: 2,

                                    borderDash: [
                                        6,
                                        6
                                    ],

                                    label: {
                                        display: true,

                                        content:
                                            'Criterio E. coli: 200 NMP/100 mL',

                                        position: 'end',

                                        backgroundColor:
                                            'rgba(255,255,255,0.92)',

                                        color:
                                            '#333333',

                                        padding: 5
                                    }
                                }
                            }
                        }
                    },

                    scales: {
                        x: {
                            title: {
                                display: true,
                                text:
                                    'Periodo de monitoreo'
                            }
                        },

                        y: {
                            type:
                                'logarithmic',

                            min: 1,

                            title: {
                                display: true,
                                text:
                                    'NMP/100 mL'
                            }
                        }
                    }
                }
            }
        );
}


// ==========================================
// GRÁFICA FISICOQUÍMICA DEL REPORTE
// ==========================================

function dibujarGraficaFisicoquimicaReporte(
    registros
) {
    const canvas =
        document.getElementById(
            'grafica-reporte-fisicoquimica'
        );

    const selector =
        document.getElementById(
            'parametro-reporte-fisicoquimico'
        );

    if (!canvas || !selector) {
        return;
    }

    const parametro =
        selector.value;

    const configuracion =
        parametrosFisicoquimicosReporte[
            parametro
        ];

    if (!configuracion) {
        return;
    }

    if (graficaReporteFisicoquimica) {
        graficaReporteFisicoquimica.destroy();
        graficaReporteFisicoquimica = null;
    }

    const etiquetas =
        mesesReporte.map(mes => mes.clave);

    const valores =
        mesesReporte.map(mes => {
            const registro =
                obtenerRegistroMesReporte(
                    registros,
                    mes.clave
                );

            if (!registro) {
                return null;
            }

            return convertirNumeroReporte(
                registro[
                    configuracion.campo
                ]
            );
        });

    graficaReporteFisicoquimica =
        new Chart(
            canvas,
            {
                type: 'line',

                data: {
                    labels: etiquetas,

                    datasets: [
                        {
                            label:
                                configuracion.unidad
                                    ? `${configuracion.etiqueta} (${configuracion.unidad})`
                                    : configuracion.etiqueta,

                            data: valores,

                            tension: 0.25,

                            spanGaps: false
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    interaction: {
                        mode: 'index',
                        intersect: false
                    },

                    plugins: {
                        legend: {
                            position: 'top'
                        },

                        tooltip: {
                            callbacks: {
                                label:
                                    function (contexto) {
                                        const valor =
                                            contexto
                                                .parsed
                                                .y;

                                        if (
                                            valor === null ||
                                            valor === undefined
                                        ) {
                                            return (
                                                configuracion
                                                    .etiqueta +
                                                ': SD'
                                            );
                                        }

                                        return (
                                            configuracion
                                                .etiqueta +
                                            ': ' +
                                            valor.toLocaleString(
                                                'es-MX',
                                                {
                                                    maximumFractionDigits:
                                                        2
                                                }
                                            ) +
                                            (
                                                configuracion
                                                    .unidad
                                                    ? ` ${configuracion.unidad}`
                                                    : ''
                                            )
                                        );
                                    }
                            }
                        }
                    },

                    scales: {
                        x: {
                            title: {
                                display: true,
                                text:
                                    'Periodo de monitoreo'
                            }
                        },

                        y: {
                            beginAtZero: false,

                            title: {
                                display: true,

                                text:
                                    configuracion.unidad ||
                                    configuracion.etiqueta
                            }
                        }
                    }
                }
            }
        );
}


// ==========================================
// GENERAR REPORTE
// ==========================================

function generarReporteAnualSitio() {
    const anio =
        document.getElementById(
            'filtro-anio'
        ).value;

    if (!anio) {
        alert(
            'Selecciona primero un año de consulta.'
        );

        return;
    }

    if (!sitioSeleccionado) {
        alert(
            'Selecciona primero un sitio en el mapa.'
        );

        return;
    }

    const informacionSitio =
        obtenerInformacionSitioReporte(
            sitioSeleccionado.id
        );

    if (!informacionSitio) {
        alert(
            'No se pudo obtener la información del sitio seleccionado.'
        );

        return;
    }

    const registros =
        obtenerRegistrosAnualesReporte(
            sitioSeleccionado.id,
            anio
        );

    if (registros.length === 0) {
        alert(
            `No hay registros de ${sitioSeleccionado.nombre} para ${anio}.`
        );

        return;
    }

    destruirGraficasReporte();

    const resumen =
        obtenerResumenAnualReporte(
            registros
        );

    const filasBacteriologicas =
        crearFilasBacteriologicasReporte(
            registros
        );

    const filasFisicoquimicas =
        crearFilasFisicoquimicasReporte(
            registros
        );

    const textoMaximo =
        resumen.registroMaximo
            ? `
                ${formatearDatoReporte(
                    resumen
                        .registroMaximo
                        .E_coli_100mL,
                    'NMP/100 mL'
                )}
                (${resumen
                    .registroMaximo
                    .Periodo_Muestreo})
            `
            : 'SD';

    const textoMinimo =
        resumen.registroMinimo
            ? `
                ${formatearDatoReporte(
                    resumen
                        .registroMinimo
                        .E_coli_100mL,
                    'NMP/100 mL'
                )}
                (${resumen
                    .registroMinimo
                    .Periodo_Muestreo})
            `
            : 'SD';

    tituloReporte.textContent =
    informacionSitio.nombre;

if (anioReporte) {
    anioReporte.textContent =
        anio;
}

    const fechaActual =
        new Date().toLocaleDateString(
            'es-MX',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        );

    if (fechaReporte) {
        fechaReporte.textContent =
            `Fecha de generación: ${fechaActual}`;
    }

    contenidoReporte.innerHTML = `
        <section class="reporte-seccion">

            <h3>
                Información general
            </h3>

            <div class="reporte-ficha">

                <div>
                    <strong>ID</strong>
                    <span>${informacionSitio.id}</span>
                </div>

                <div>
                    <strong>Subcuenca</strong>
                    <span>
                        ${informacionSitio.subcuenca}
                    </span>
                </div>

                <div>
                    <strong>Microcuenca</strong>
                    <span>
                        ${informacionSitio.microcuenca}
                    </span>
                </div>

                <div>
                    <strong>Municipio</strong>
                    <span>
                        ${informacionSitio.municipio}
                    </span>
                </div>

                <div>
                    <strong>Localidad</strong>
                    <span>
                        ${informacionSitio.localidad}
                    </span>
                </div>

                <div>
                    <strong>Altitud</strong>
                    <span>
                        ${informacionSitio.altitud}
                        m s. n. m.
                    </span>
                </div>

            </div>

        </section>


        <section class="reporte-seccion">

            <h3>
                Resumen bacteriológico del año
            </h3>

            <div class="reporte-indicadores">

                <div class="indicador-monitoreos">
                    <strong>
                        ${resumen.monitoreos}
                    </strong>

                    <span>
                        Monitoreos con resultado
                    </span>
                </div>

                <div class="indicador-apto">
                    <strong>
                        ${resumen.aptos}
                    </strong>

                    <span>
                        Resultados aptos
                    </span>
                </div>

                <div class="indicador-no-apto">
                    <strong>
                        ${resumen.noAptos}
                    </strong>

                    <span>
                        Resultados no aptos
                    </span>
                </div>

            </div>

            <div class="reporte-extremos">

                <p>
                    <strong>
                        Mayor concentración de
                        <em>E. coli</em>:
                    </strong>

                    ${textoMaximo}
                </p>

                <p>
                    <strong>
                        Menor concentración de
                        <em>E. coli</em>:
                    </strong>

                    ${textoMinimo}
                </p>

            </div>

        </section>


        <section class="reporte-seccion">

            <h3>
                Comportamiento bacteriológico anual
            </h3>

            <div class="reporte-grafica">

                <canvas
                    id="grafica-reporte-bacteriologica"
                ></canvas>

            </div>

        </section>


        <section class="reporte-seccion">

            <h3>
                Resultados bacteriológicos por periodo
                de monitoreo
            </h3>

            <div class="reporte-tabla-contenedor">

                <table class="reporte-tabla">

                    <thead>
                        <tr>
                            <th>
                                Mes
                            </th>

                            <th>
                                <em>E. coli</em>

                                <small>
                                    NMP/100 mL
                                </small>
                            </th>

                            <th>
                                Coliformes totales

                                <small>
                                    NMP/100 mL
                                </small>
                            </th>

                            <th>
                                Aptitud
                            </th>

                            <th>
                                Nivel
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filasBacteriologicas}
                    </tbody>

                </table>

            </div>

        </section>


        <section class="reporte-seccion">

            <h3>
                Resultados fisicoquímicos por periodo
                de monitoreo
            </h3>

            <div class="reporte-tabla-contenedor">

                <table
                    class="reporte-tabla
                           reporte-tabla-fisicoquimica"
                >

                    <thead>
                        <tr>
                            <th>
                                Mes
                            </th>

                            <th>
                                pH
                            </th>

                            <th>
                                OD
                                <br>
                                <small>mg/L</small>
                            </th>

                            <th>
                                OD
                                <br>
                                <small>%</small>
                            </th>

                            <th>
                                Temp.
                                <br>
                                <small>°C</small>
                            </th>

                            <th>
                                Conduct.
                                <br>
                                <small>µS/cm</small>
                            </th>

                            <th>
                                TDS
                                <br>
                                <small>ppm</small>
                            </th>

                            <th>
                                Salinidad
                                <br>
                                <small>PSU</small>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filasFisicoquimicas}
                    </tbody>

                </table>

            </div>

        </section>


        <section class="reporte-seccion">

            <h3>
                Comportamiento fisicoquímico anual
            </h3>

            <div class="reporte-selector-parametro">

                <label
                    for="parametro-reporte-fisicoquimico"
                >
                    Parámetro:
                </label>

                <select
                    id="parametro-reporte-fisicoquimico"
                >
                    <option value="pH">
                        pH
                    </option>

                    <option value="Oxigeno_Disuelto_mg_L">
                        Oxígeno disuelto (mg/L)
                    </option>

                    <option value="Oxigeno_Disuelto_pct">
                        Saturación de OD (%)
                    </option>

                    <option value="Temperatura_Agua_C">
                        Temperatura del agua (°C)
                    </option>

                    <option value="Conductividad_uS_cm">
                        Conductividad (µS/cm)
                    </option>

                    <option value="TDS_ppm">
                        TDS (ppm)
                    </option>

                    <option value="Salinidad_PSU">
                        Salinidad (PSU)
                    </option>
                </select>

            </div>

            <div class="reporte-grafica">

                <canvas
                    id="grafica-reporte-fisicoquimica"
                ></canvas>

            </div>

        </section>


        <p class="reporte-nota">
            El programa de monitoreo se realiza de manera
            bimestral, en los meses de febrero, abril, junio,
            agosto, octubre y diciembre. La aptitud recreativa
            se evalúa con base en la concentración de
            <em>E. coli</em>; conforme al criterio de la
            COFEPRIS (2026), los sitios con valores de hasta
            200 NMP/100 mL se consideran aptos para uso
            recreativo de contacto primario.
        </p>
    `;

    modalReporte.classList.remove(
        'oculto'
    );

    // Esperar a que el modal y los canvas
    // tengan dimensiones antes de dibujar.
    requestAnimationFrame(() => {
        dibujarGraficaBacteriologicaReporte(
            registros
        );

        dibujarGraficaFisicoquimicaReporte(
            registros
        );

        const selectorFisicoquimico =
            document.getElementById(
                'parametro-reporte-fisicoquimico'
            );

        if (selectorFisicoquimico) {
            selectorFisicoquimico.addEventListener(
                'change',
                function () {
                    dibujarGraficaFisicoquimicaReporte(
                        registros
                    );
                }
            );
        }
    });
}


// ==========================================
// CERRAR REPORTE
// ==========================================

function cerrarReporteAnual() {
    modalReporte.classList.add(
        'oculto'
    );

    destruirGraficasReporte();
}


// ==========================================
// IMPRIMIR O GUARDAR COMO PDF
// ==========================================

function imprimirReporteAnual() {
    window.print();
}


// ==========================================
// EVENTOS
// ==========================================

if (botonReporte) {
    botonReporte.addEventListener(
        'click',
        generarReporteAnualSitio
    );
}


if (botonCerrarReporte) {
    botonCerrarReporte.addEventListener(
        'click',
        cerrarReporteAnual
    );
}


if (botonImprimirReporte) {
    botonImprimirReporte.addEventListener(
        'click',
        imprimirReporteAnual
    );
}


if (modalReporte) {
    modalReporte.addEventListener(
        'click',
        function (evento) {
            if (
                evento.target === modalReporte
            ) {
                cerrarReporteAnual();
            }
        }
    );
}


console.log(
    'Módulo de reporte anual cargado correctamente.'
);