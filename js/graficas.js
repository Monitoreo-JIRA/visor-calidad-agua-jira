// ==========================================
// GRÁFICAS HISTÓRICAS
// ==========================================

const botonGraficas =
    document.getElementById('boton-graficas');

const modalGrafica =
    document.getElementById('modal-grafica');

const botonCerrarGrafica =
    document.getElementById('cerrar-grafica');

const tituloGrafica =
    document.getElementById('titulo-grafica');

const subtituloGrafica =
    document.getElementById('subtitulo-grafica');

const lienzoGrafica =
    document.getElementById('grafica-historica');

const contenedorSelectorParametro =
    document.getElementById(
        'selector-parametro-grafica'
    );

const selectorParametroFisicoquimico =
    document.getElementById(
        'parametro-fisicoquimico-grafica'
    );

let graficaHistorica = null;

const ordenMesesGrafica = {
    Ene: 1,
    Feb: 2,
    Mar: 3,
    Abr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Ago: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dic: 12
};


const configuracionFisicoquimicos = {
    pH: {
        etiqueta: 'pH',
        unidad: '',
        campo: 'pH'
    },

    Oxigeno_Disuelto_mg_L: {
        etiqueta: 'Oxígeno disuelto',
        unidad: 'mg/L',
        campo: 'Oxigeno_Disuelto_mg_L'
    },

    Oxigeno_Disuelto_pct: {
        etiqueta: 'Saturación de OD',
        unidad: '%',
        campo: 'Oxigeno_Disuelto_pct'
    },

    Temperatura_Agua_C: {
        etiqueta: 'Temperatura del agua',
        unidad: '°C',
        campo: 'Temperatura_Agua_C'
    },

    Conductividad_uS_cm: {
        etiqueta: 'Conductividad',
        unidad: 'µS/cm',
        campo: 'Conductividad_uS_cm'
    },

    TDS_ppm: {
        etiqueta: 'TDS',
        unidad: 'ppm',
        campo: 'TDS_ppm'
    },

    Salinidad_PSU: {
        etiqueta: 'Salinidad',
        unidad: 'PSU',
        campo: 'Salinidad_PSU'
    }
};


function convertirNumeroGrafica(
    valor,
    usarEscalaLogaritmica = false
) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ''
    ) {
        return null;
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return null;
    }

    if (
        usarEscalaLogaritmica &&
        numero <= 0
    ) {
        return 1;
    }

    return numero;
}


function obtenerRegistrosGrafica(
    idSitio,
    anio
) {
    return datosHistoricos
        .filter(registro =>
            String(
                registro.ID_Sitio ?? ''
            ).trim() ===
                String(idSitio).trim() &&

            String(
                registro['Año'] ?? ''
            ) ===
                String(anio)
        )
        .sort((a, b) => {
            const mesA =
                ordenMesesGrafica[
                    String(
                        a.Periodo_Muestreo ?? ''
                    ).trim()
                ] ?? 99;

            const mesB =
                ordenMesesGrafica[
                    String(
                        b.Periodo_Muestreo ?? ''
                    ).trim()
                ] ?? 99;

            if (mesA !== mesB) {
                return mesA - mesB;
            }

            return String(
                a.Fecha ?? ''
            ).localeCompare(
                String(
                    b.Fecha ?? ''
                )
            );
        });
}


function obtenerEtiquetasGrafica(
    registros
) {
    return registros.map(registro => {
        const periodo = String(
            registro.Periodo_Muestreo ?? ''
        ).trim();

        return periodo ||
            String(registro.Fecha ?? '');
    });
}


function validarGrafica() {
    const selectorAnio =
        document.getElementById(
            'filtro-anio'
        );

    const anio =
        selectorAnio.value;

    if (!anio) {
        alert(
            'Selecciona primero un año de consulta.'
        );

        return null;
    }

    if (!sitioSeleccionado) {
        alert(
            'Selecciona primero un sitio en el mapa.'
        );

        return null;
    }

    const registros =
        obtenerRegistrosGrafica(
            sitioSeleccionado.id,
            anio
        );

    if (registros.length === 0) {
        alert(
            `No hay datos de ${sitioSeleccionado.nombre} para ${anio}.`
        );

        return null;
    }

    return {
        anio,
        registros
    };
}


function destruirGraficaAnterior() {
    if (graficaHistorica) {
        graficaHistorica.destroy();
        graficaHistorica = null;
    }
}


function dibujarGraficaBacteriologica(
    anio,
    registros
) {
    contenedorSelectorParametro.classList.add(
        'oculto'
    );

    const etiquetas =
        obtenerEtiquetasGrafica(registros);

    const valoresEcoli =
        registros.map(registro =>
            convertirNumeroGrafica(
                registro.E_coli_100mL,
                true
            )
        );

    const valoresColiformes =
        registros.map(registro =>
            convertirNumeroGrafica(
                registro
                    .Coliformes_Totales_100mL,
                true
            )
        );

    tituloGrafica.textContent =
        sitioSeleccionado.nombre;

    subtituloGrafica.textContent =
        `Monitoreos bacteriológicos realizados durante ${anio}`;

    destruirGraficaAnterior();

    graficaHistorica = new Chart(
        lienzoGrafica,
        {
            type: 'line',

            data: {
                labels: etiquetas,

                datasets: [
                    {
                        label:
                            'E. coli (NMP/100 mL)',
                        data: valoresEcoli,
                        tension: 0.25,
                        spanGaps: false
                    },

                    {
                        label:
                            'Coliformes totales (NMP/100 mL)',
                        data: valoresColiformes,
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
                            label: function (
                                contexto
                            ) {
                                const registro =
                                    registros[
                                        contexto.dataIndex
                                    ];

                                let valorReal;

                                if (
                                    contexto.datasetIndex ===
                                    0
                                ) {
                                    valorReal =
                                        registro
                                            .E_coli_100mL;
                                } else {
                                    valorReal =
                                        registro
                                            .Coliformes_Totales_100mL;
                                }

                                if (
                                    valorReal === null ||
                                    valorReal === undefined ||
                                    valorReal === ''
                                ) {
                                    return (
                                        contexto
                                            .dataset
                                            .label +
                                        ': SD'
                                    );
                                }

                                const numero =
                                    Number(valorReal);

                                const valorFormateado =
                                    Number.isFinite(
                                        numero
                                    )
                                        ? numero.toLocaleString(
                                            'es-MX'
                                        )
                                        : String(
                                            valorReal
                                        );

                                return (
                                    contexto
                                        .dataset
                                        .label +
                                    ': ' +
                                    valorFormateado +
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
                                        'rgba(255, 255, 255, 0.92)',
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
                                'Periodo de muestreo'
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
                        },

                        ticks: {
                            callback:
                                function (
                                    valor
                                ) {
                                    const valoresMostrar = [
                                        1,
                                        10,
                                        100,
                                        200,
                                        1000,
                                        10000,
                                        25000
                                    ];

                                    if (
                                        valoresMostrar.includes(
                                            Number(
                                                valor
                                            )
                                        )
                                    ) {
                                        return Number(
                                            valor
                                        ).toLocaleString(
                                            'es-MX'
                                        );
                                    }

                                    return '';
                                }
                        }
                    }
                }
            }
        }
    );

    modalGrafica.classList.remove(
        'oculto'
    );
}


function dibujarGraficaFisicoquimica(
    anio,
    registros
) {
    contenedorSelectorParametro.classList.remove(
        'oculto'
    );

    const parametroSeleccionado =
        selectorParametroFisicoquimico.value;

    const configuracion =
        configuracionFisicoquimicos[
            parametroSeleccionado
        ];

    if (!configuracion) {
        console.error(
            'Parámetro fisicoquímico no reconocido:',
            parametroSeleccionado
        );

        return;
    }

    const etiquetas =
        obtenerEtiquetasGrafica(registros);

    const valores =
        registros.map(registro =>
            convertirNumeroGrafica(
                registro[
                    configuracion.campo
                ],
                false
            )
        );

    tituloGrafica.textContent =
        sitioSeleccionado.nombre;

    subtituloGrafica.textContent =
        `${configuracion.etiqueta} durante ${anio}`;

    destruirGraficaAnterior();

    graficaHistorica = new Chart(
        lienzoGrafica,
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
                            label: function (
                                contexto
                            ) {
                                const registro =
                                    registros[
                                        contexto.dataIndex
                                    ];

                                const valorReal =
                                    registro[
                                        configuracion.campo
                                    ];

                                if (
                                    valorReal === null ||
                                    valorReal === undefined ||
                                    valorReal === ''
                                ) {
                                    return (
                                        configuracion
                                            .etiqueta +
                                        ': SD'
                                    );
                                }

                                const numero =
                                    Number(valorReal);

                                const valorFormateado =
                                    Number.isFinite(
                                        numero
                                    )
                                        ? numero.toLocaleString(
                                            'es-MX',
                                            {
                                                maximumFractionDigits:
                                                    2
                                            }
                                        )
                                        : String(
                                            valorReal
                                        );

                                return (
                                    configuracion
                                        .etiqueta +
                                    ': ' +
                                    valorFormateado +
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
                                'Periodo de muestreo'
                        }
                    },

                    y: {
                        beginAtZero: false,

                        title: {
                            display: true,
                            text:
                                configuracion.unidad ||
                                configuracion.etiqueta
                        },

                        ticks: {
                            callback:
                                function (
                                    valor
                                ) {
                                    return Number(
                                        valor
                                    ).toLocaleString(
                                        'es-MX',
                                        {
                                            maximumFractionDigits:
                                                2
                                        }
                                    );
                                }
                        }
                    }
                }
            }
        }
    );

    modalGrafica.classList.remove(
        'oculto'
    );
}


function dibujarGraficaSegunModulo() {
    const validacion =
        validarGrafica();

    if (!validacion) {
        return;
    }

    const {
        anio,
        registros
    } = validacion;

    if (
        typeof moduloActivo !==
            'undefined' &&
        moduloActivo ===
            'fisicoquimico'
    ) {
        dibujarGraficaFisicoquimica(
            anio,
            registros
        );

        return;
    }

    dibujarGraficaBacteriologica(
        anio,
        registros
    );
}


function actualizarGraficaFisicoquimica() {
    if (
        typeof moduloActivo ===
            'undefined' ||
        moduloActivo !==
            'fisicoquimico'
    ) {
        return;
    }

    if (
        modalGrafica.classList.contains(
            'oculto'
        )
    ) {
        return;
    }

    dibujarGraficaSegunModulo();
}


function cerrarVentanaGrafica() {
    modalGrafica.classList.add(
        'oculto'
    );
}


if (botonGraficas) {
    botonGraficas.addEventListener(
        'click',
        dibujarGraficaSegunModulo
    );
}


if (
    selectorParametroFisicoquimico
) {
    selectorParametroFisicoquimico.addEventListener(
        'change',
        actualizarGraficaFisicoquimica
    );
}


if (botonCerrarGrafica) {
    botonCerrarGrafica.addEventListener(
        'click',
        cerrarVentanaGrafica
    );
}


if (modalGrafica) {
    modalGrafica.addEventListener(
        'click',
        function (evento) {
            if (
                evento.target ===
                modalGrafica
            ) {
                cerrarVentanaGrafica();
            }
        }
    );
}


console.log(
    'Módulo de gráficas cargado correctamente.'
);