// ==========================================
// DATOS HISTÓRICOS DE MONITOREO
// ==========================================

let datosHistoricos = [];

// Catálogo automático: nombre normalizado → ID_Sitio
let idPorNombreSitio = new Map();

const ordenPeriodos = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
];


/**
 * Normalizar nombres para ignorar:
 * - mayúsculas y minúsculas;
 * - acentos;
 * - espacios sobrantes.
 */
function normalizarNombre(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}


/**
 * Crear automáticamente la relación:
 * nombre del sitio → ID_Sitio.
 */
function crearCatalogoIds() {
    idPorNombreSitio.clear();

    datosHistoricos.forEach(registro => {
        const nombre = normalizarNombre(registro.Sitio);
        const id = String(registro.ID_Sitio ?? '').trim();

        if (nombre && id && !idPorNombreSitio.has(nombre)) {
            idPorNombreSitio.set(nombre, id);
        }
    });

    console.log(
        'Sitios identificados automáticamente:',
        idPorNombreSitio.size
    );
}


/**
 * Obtener el ID de un sitio a partir de su nombre.
 */
function obtenerIdPorNombre(nombreSitio) {
    const nombreNormalizado = normalizarNombre(nombreSitio);

    // Coincidencia directa
    if (idPorNombreSitio.has(nombreNormalizado)) {
        return idPorNombreSitio.get(nombreNormalizado);
    }

    /*
     * Ajuste para una diferencia conocida entre archivos:
     * GeoJSON: "El Paso de San Francisco"
     * Histórico: "Paso de San Francisco"
     */
    if (nombreNormalizado === 'el paso de san francisco') {
        return (
            idPorNombreSitio.get('paso de san francisco') ??
            'Sin ID'
        );
    }

    return 'Sin ID';
}


/**
 * Cargar el archivo histórico de Excel.
 */
async function cargarDatosHistoricos() {
    try {
        const respuesta = await fetch(
            'data/monitoreo/Monitoreo_historico.xlsx'
        );

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el Excel. Código: ${respuesta.status}`
            );
        }

        const contenido = await respuesta.arrayBuffer();

        const libro = XLSX.read(contenido, {
            type: 'array',
            cellDates: true
        });

        console.log(
            'Hojas encontradas:',
            libro.SheetNames
        );

        const nombreHoja = libro.SheetNames.includes(
            'Monitoreo_historico'
        )
            ? 'Monitoreo_historico'
            : libro.SheetNames[0];

        const hoja = libro.Sheets[nombreHoja];

        datosHistoricos = XLSX.utils.sheet_to_json(hoja, {
            defval: null,
            raw: false
        });

        console.log(
            'Hoja leída:',
            nombreHoja
        );

        console.log(
            'Registros históricos cargados:',
            datosHistoricos.length
        );

        console.log(
            'Columnas detectadas:',
            Object.keys(datosHistoricos[0] || {})
        );

        // Construir automáticamente el catálogo de IDs
        crearCatalogoIds();

        // Llenar filtros
        llenarSelectorAnios();
        configurarSelectorMeses();

        return datosHistoricos;

    } catch (error) {
        console.error(
            'Error al leer el histórico:',
            error
        );

        throw error;
    }
}


/**
 * Llenar el selector de años.
 */
function llenarSelectorAnios() {
    const selectorAnio =
        document.getElementById('filtro-anio');

    const anios = [
        ...new Set(
            datosHistoricos
                .map(registro => Number(registro['Año']))
                .filter(anio => Number.isFinite(anio))
        )
    ].sort((a, b) => b - a);

    selectorAnio.innerHTML =
        '<option value="">Seleccionar...</option>';

    anios.forEach(anio => {
        const opcion = document.createElement('option');

        opcion.value = String(anio);
        opcion.textContent = String(anio);

        selectorAnio.appendChild(opcion);
    });

    console.log(
        'Años disponibles:',
        anios
    );
}


/**
 * Preparar el selector de meses.
 */
function configurarSelectorMeses() {
    const selectorAnio =
        document.getElementById('filtro-anio');

    const selectorMes =
        document.getElementById('filtro-mes');

    selectorMes.innerHTML =
        '<option value="">Selecciona primero un año</option>';

    selectorMes.disabled = true;

    selectorAnio.addEventListener('change', function () {
        llenarSelectorMeses(this.value);
    });
}


/**
 * Llenar los meses disponibles para el año elegido.
 */
function llenarSelectorMeses(anioSeleccionado) {
    const selectorMes =
        document.getElementById('filtro-mes');

    selectorMes.innerHTML = '';

    if (!anioSeleccionado) {
        selectorMes.innerHTML =
            '<option value="">Selecciona primero un año</option>';

        selectorMes.disabled = true;
        return;
    }

    const periodos = [
        ...new Set(
            datosHistoricos
                .filter(registro =>
                    String(registro['Año']) ===
                    String(anioSeleccionado)
                )
                .map(registro =>
                    String(
                        registro.Periodo_Muestreo ?? ''
                    ).trim()
                )
                .filter(periodo => periodo !== '')
        )
    ];

    periodos.sort((a, b) => {
        const posicionA = ordenPeriodos.indexOf(a);
        const posicionB = ordenPeriodos.indexOf(b);

        if (posicionA === -1 && posicionB === -1) {
            return a.localeCompare(b, 'es');
        }

        if (posicionA === -1) {
            return 1;
        }

        if (posicionB === -1) {
            return -1;
        }

        return posicionA - posicionB;
    });

    selectorMes.innerHTML =
        '<option value="">Seleccionar...</option>';

    periodos.forEach(periodo => {
        const opcion = document.createElement('option');

        opcion.value = periodo;
        opcion.textContent = periodo;

        selectorMes.appendChild(opcion);
    });

    selectorMes.disabled = false;

    console.log(
        `Periodos disponibles para ${anioSeleccionado}:`,
        periodos
    );
}


// Promesa que utilizarán los demás archivos
const datosHistoricosListos = cargarDatosHistoricos();