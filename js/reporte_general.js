// ==========================================
// REPORTE ANUAL GENERAL
// ==========================================

const botonReporteGeneral =
    document.getElementById(
        'boton-reporte-general'
    );

const modalReporteGeneral =
    document.getElementById(
        'modal-reporte-general'
    );

const botonCerrarReporteGeneral =
    document.getElementById(
        'cerrar-reporte-general'
    );

const botonImprimirReporteGeneral =
    document.getElementById(
        'imprimir-reporte-general'
    );

const anioReporteGeneral =
    document.getElementById(
        'anio-reporte-general'
    );

const fechaReporteGeneral =
    document.getElementById(
        'fecha-reporte-general'
    );

const contenidoReporteGeneral =
    document.getElementById(
        'contenido-reporte-general'
    );


const mesesReporteGeneral = [
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


// ==========================================
// FUNCIONES GENERALES
// ==========================================

function convertirNumeroReporteGeneral(valor) {
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


function formatearNumeroReporteGeneral(valor) {
    const numero =
        convertirNumeroReporteGeneral(valor);

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


function obtenerNombreMesReporteGeneral(
    claveMes
) {
    const mes =
        mesesReporteGeneral.find(
            elemento =>
                elemento.clave === claveMes
        );

    return mes
        ? mes.nombre
        : claveMes;
}


// ==========================================
// INFORMACIÓN DE LOS SITIOS
// ==========================================

function obtenerInformacionSitiosGeneral() {
    const sitios = new Map();

    if (!capaSitios) {
        return sitios;
    }

    capaSitios.eachLayer(layer => {
        const propiedades =
            layer.feature?.properties ?? {};

        const id = String(
            layer.idSitio ?? ''
        ).trim();

        if (!id || id === 'Sin ID') {
            return;
        }

        sitios.set(
            id,
            {
                id,

                nombre:
                    layer.nombreSitio ??
                    propiedades.Sitio ??
                    propiedades[
                        'Sitios de monitoreo'
                    ] ??
                    'Sitio sin nombre',

                subcuenca:
                    propiedades.Subcuenca ??
                    'Sin información',

                municipio:
                    propiedades.Municipio ??
                    'Sin información',

                localidad:
                    propiedades.Localidad ??
                    'Sin información'
            }
        );
    });

    return sitios;
}


// ==========================================
// REGISTROS DEL AÑO
// ==========================================

function obtenerRegistrosGeneralesAnio(anio) {
    return datosHistoricos.filter(registro =>
        String(
            registro['Año'] ?? ''
        ) ===
            String(anio)
    );
}


function obtenerRegistroSitioMesGeneral(
    registros,
    idSitio,
    claveMes
) {
    return registros.find(registro =>
        String(
            registro.ID_Sitio ?? ''
        ).trim() ===
            String(idSitio).trim() &&

        String(
            registro.Periodo_Muestreo ?? ''
        ).trim() ===
            claveMes
    );
}


// ==========================================
// RESUMEN GENERAL
// ==========================================

function calcularResumenGeneral(
    registros,
    sitios
) {
    const registrosConEcoli =
        registros.filter(registro =>
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            ) !== null
        );

    const aptos =
        registrosConEcoli.filter(registro =>
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            ) <= 200
        );

    const noAptos =
        registrosConEcoli.filter(registro =>
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            ) > 200
        );

    const idsConDatos = new Set(
        registrosConEcoli.map(registro =>
            String(
                registro.ID_Sitio ?? ''
            ).trim()
        )
    );

    let registroMaximo = null;
    let registroMinimo = null;

    registrosConEcoli.forEach(registro => {
        const valor =
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            );

        if (
            !registroMaximo ||
            valor >
                convertirNumeroReporteGeneral(
                    registroMaximo.E_coli_100mL
                )
        ) {
            registroMaximo = registro;
        }

        if (
            !registroMinimo ||
            valor <
                convertirNumeroReporteGeneral(
                    registroMinimo.E_coli_100mL
                )
        ) {
            registroMinimo = registro;
        }
    });

    const porcentajeAptos =
        registrosConEcoli.length > 0
            ? (
                aptos.length /
                registrosConEcoli.length *
                100
            )
            : 0;

    function obtenerNombreRegistro(registro) {
        if (!registro) {
            return 'SD';
        }

        const id = String(
            registro.ID_Sitio ?? ''
        ).trim();

        return (
            sitios.get(id)?.nombre ??
            registro.Sitio ??
            'Sitio sin nombre'
        );
    }

    return {
        sitiosConDatos:
            idsConDatos.size,

        totalResultados:
            registrosConEcoli.length,

        aptos:
            aptos.length,

        noAptos:
            noAptos.length,

        porcentajeAptos,

        registroMaximo,

        registroMinimo,

        nombreMaximo:
            obtenerNombreRegistro(
                registroMaximo
            ),

        nombreMinimo:
            obtenerNombreRegistro(
                registroMinimo
            )
    };
}


// ==========================================
// RESUMEN POR SITIO
// ==========================================

function calcularResumenSitioGeneral(
    idSitio,
    registros
) {
    const registrosSitio =
        registros.filter(registro =>
            String(
                registro.ID_Sitio ?? ''
            ).trim() ===
                String(idSitio).trim()
        );

    const registrosConEcoli =
        registrosSitio.filter(registro =>
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            ) !== null
        );

    const aptos =
        registrosConEcoli.filter(registro =>
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            ) <= 200
        ).length;

    const noAptos =
        registrosConEcoli.filter(registro =>
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            ) > 200
        ).length;

    let registroMaximo = null;

    registrosConEcoli.forEach(registro => {
        const valor =
            convertirNumeroReporteGeneral(
                registro.E_coli_100mL
            );

        if (
            !registroMaximo ||
            valor >
                convertirNumeroReporteGeneral(
                    registroMaximo.E_coli_100mL
                )
        ) {
            registroMaximo = registro;
        }
    });

    let resultadoPredominante = 'Sin datos';

    if (aptos > noAptos) {
        resultadoPredominante =
            'Mayormente apto';
    } else if (noAptos > aptos) {
        resultadoPredominante =
            'Mayormente no apto';
    } else if (
        aptos > 0 &&
        aptos === noAptos
    ) {
        resultadoPredominante =
            'Resultados iguales';
    }

    return {
        monitoreos:
            registrosConEcoli.length,

        aptos,

        noAptos,

        maximo:
            registroMaximo
                ? registroMaximo
                    .E_coli_100mL
                : null,

        periodoMaximo:
            registroMaximo
                ? registroMaximo
                    .Periodo_Muestreo
                : null,

        resultadoPredominante
    };
}


// ==========================================
// FILAS DE TABLAS
// ==========================================

function crearFilasResumenSitiosGeneral(
    sitios,
    registros
) {
    return Array.from(
        sitios.values()
    )
        .sort((a, b) =>
            a.nombre.localeCompare(
                b.nombre,
                'es'
            )
        )
        .map(sitio => {
            const resumen =
                calcularResumenSitioGeneral(
                    sitio.id,
                    registros
                );

            return `
                <tr>
                    <td>${sitio.nombre}</td>

                    <td>${sitio.subcuenca}</td>

                    <td>${resumen.monitoreos}</td>

                    <td>${resumen.aptos}</td>

                    <td>${resumen.noAptos}</td>

                    <td>
                        ${formatearNumeroReporteGeneral(
                            resumen.maximo
                        )}
                    </td>

                    <td>
                        ${
                            resumen.periodoMaximo
                                ? obtenerNombreMesReporteGeneral(
                                    resumen
                                        .periodoMaximo
                                )
                                : 'SD'
                        }
                    </td>

                    <td>
                        ${resumen.resultadoPredominante}
                    </td>
                </tr>
            `;
        })
        .join('');
}


function crearFilasPeriodosGeneral(
    sitios,
    registros
) {
    return Array.from(
        sitios.values()
    )
        .sort((a, b) =>
            a.nombre.localeCompare(
                b.nombre,
                'es'
            )
        )
        .map(sitio => {
            const celdas =
                mesesReporteGeneral
                    .map(mes => {
                        const registro =
                            obtenerRegistroSitioMesGeneral(
                                registros,
                                sitio.id,
                                mes.clave
                            );

                        const valor =
                            registro
                                ? registro
                                    .E_coli_100mL
                                : null;

                        const numero =
                            convertirNumeroReporteGeneral(
                                valor
                            );

                        let clase = '';

                        if (numero !== null) {
                            clase =
                                numero <= 200
                                    ? 'celda-apta'
                                    : 'celda-no-apta';
                        }

                        return `
                            <td class="${clase}">
                                ${formatearNumeroReporteGeneral(
                                    valor
                                )}
                            </td>
                        `;
                    })
                    .join('');

            return `
                <tr>
                    <td>${sitio.nombre}</td>
                    ${celdas}
                </tr>
            `;
        })
        .join('');
}


// ==========================================
// GENERAR REPORTE GENERAL
// ==========================================

function generarReporteAnualGeneral() {
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

    const sitios =
        obtenerInformacionSitiosGeneral();

    const registros =
        obtenerRegistrosGeneralesAnio(
            anio
        );

    if (registros.length === 0) {
        alert(
            `No hay registros disponibles para ${anio}.`
        );

        return;
    }

    const resumen =
        calcularResumenGeneral(
            registros,
            sitios
        );

    const filasResumen =
        crearFilasResumenSitiosGeneral(
            sitios,
            registros
        );

    const filasPeriodos =
        crearFilasPeriodosGeneral(
            sitios,
            registros
        );

    const textoMaximo =
        resumen.registroMaximo
            ? `
                ${resumen.nombreMaximo}:
                ${formatearNumeroReporteGeneral(
                    resumen
                        .registroMaximo
                        .E_coli_100mL
                )}
                NMP/100 mL
                (${obtenerNombreMesReporteGeneral(
                    resumen
                        .registroMaximo
                        .Periodo_Muestreo
                )})
            `
            : 'SD';

    const textoMinimo =
        resumen.registroMinimo
            ? `
                ${resumen.nombreMinimo}:
                ${formatearNumeroReporteGeneral(
                    resumen
                        .registroMinimo
                        .E_coli_100mL
                )}
                NMP/100 mL
                (${obtenerNombreMesReporteGeneral(
                    resumen
                        .registroMinimo
                        .Periodo_Muestreo
                )})
            `
            : 'SD';

    anioReporteGeneral.textContent =
        anio;

    const fechaActual =
        new Date().toLocaleDateString(
            'es-MX',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        );

    fechaReporteGeneral.textContent =
        `Fecha de generación: ${fechaActual}`;

    contenidoReporteGeneral.innerHTML = `
        <section class="reporte-seccion">

            <h3>
                Resumen anual de la red
            </h3>

            <div class="reporte-indicadores
                        reporte-indicadores-generales">

                <div class="indicador-monitoreos">
                    <strong>
                        ${resumen.sitiosConDatos}
                    </strong>

                    <span>
                        Sitios con resultados
                    </span>
                </div>

                <div class="indicador-monitoreos">
                    <strong>
                        ${resumen.totalResultados}
                    </strong>

                    <span>
                        Resultados bacteriológicos
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

                <div class="indicador-monitoreos">
                    <strong>
                        ${
                            resumen
                                .porcentajeAptos
                                .toLocaleString(
                                    'es-MX',
                                    {
                                        maximumFractionDigits:
                                            1
                                    }
                                )
                        } %
                    </strong>

                    <span>
                        Resultados aptos
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
                Resumen bacteriológico por sitio
            </h3>

            <div class="reporte-tabla-contenedor">

                <table
                    class="reporte-tabla
                           reporte-tabla-general"
                >

                    <thead>
                        <tr>
                            <th>Sitio</th>
                            <th>Subcuenca</th>
                            <th>Monitoreos</th>
                            <th>Aptos</th>
                            <th>No aptos</th>

                            <th>
                                Máximo de
                                <em>E. coli</em>
                                <small>
                                    NMP/100 mL
                                </small>
                            </th>

                            <th>
                                Periodo del máximo
                            </th>

                            <th>
                                Resultado predominante
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filasResumen}
                    </tbody>

                </table>

            </div>

        </section>


        <section class="reporte-seccion">

            <h3>
                Concentración de <em>E. coli</em> por
                sitio y periodo de monitoreo
            </h3>

            <div class="reporte-tabla-contenedor">

                <table
                    class="reporte-tabla
                           reporte-tabla-periodos"
                >

                    <thead>
                        <tr>
                            <th>Sitio</th>
                            <th>Feb</th>
                            <th>Abr</th>
                            <th>Jun</th>
                            <th>Ago</th>
                            <th>Oct</th>
                            <th>Dic</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filasPeriodos}
                    </tbody>

                </table>

            </div>

        </section>


        <p class="reporte-nota">
            El programa de monitoreo se realiza de manera
            bimestral, en febrero, abril, junio, agosto,
            octubre y diciembre. La aptitud recreativa se
            evalúa con base en la concentración de
            <em>E. coli</em>. Conforme al criterio de la
            COFEPRIS (2026), los resultados de hasta
            200 NMP/100 mL se consideran aptos para uso
            recreativo de contacto primario.
        </p>
    `;

    modalReporteGeneral.classList.remove(
        'oculto'
    );
}


// ==========================================
// EVENTOS
// ==========================================

function cerrarReporteAnualGeneral() {
    modalReporteGeneral.classList.add(
        'oculto'
    );
}


if (botonReporteGeneral) {
    botonReporteGeneral.addEventListener(
        'click',
        generarReporteAnualGeneral
    );
}


if (botonCerrarReporteGeneral) {
    botonCerrarReporteGeneral.addEventListener(
        'click',
        cerrarReporteAnualGeneral
    );
}


if (botonImprimirReporteGeneral) {
    botonImprimirReporteGeneral.addEventListener(
        'click',
        function () {
            window.print();
        }
    );
}


if (modalReporteGeneral) {
    modalReporteGeneral.addEventListener(
        'click',
        function (evento) {
            if (
                evento.target ===
                modalReporteGeneral
            ) {
                cerrarReporteAnualGeneral();
            }
        }
    );
}


console.log(
    'Módulo de reporte anual general cargado correctamente.'
);
