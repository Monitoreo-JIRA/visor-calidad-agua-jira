// ==========================================
// RESULTADOS FISICOQUÍMICOS
// ==========================================

function formatearDatoFisicoquimico(
    valor,
    unidad = ''
) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ''
    ) {
        return 'SD';
    }

    const numero = Number(valor);

    const texto = Number.isFinite(numero)
        ? numero.toLocaleString('es-MX', {
            maximumFractionDigits: 2
        })
        : String(valor);

    return unidad
        ? `${texto} ${unidad}`
        : texto;
}


function limpiarTablaFisicoquimica() {
    document.getElementById(
        'fisicoquimico-nombre'
    ).textContent =
        'Sitio no seleccionado';

    document.getElementById(
        'fisicoquimico-periodo'
    ).textContent =
        'Sin periodo';

    document.getElementById(
        'resultado-ph'
    ).textContent = '—';

    document.getElementById(
        'resultado-od-mg'
    ).textContent = '—';

    document.getElementById(
        'resultado-od-pct'
    ).textContent = '—';

    document.getElementById(
        'resultado-temperatura'
    ).textContent = '—';

    document.getElementById(
        'resultado-conductividad'
    ).textContent = '—';

    document.getElementById(
        'resultado-tds'
    ).textContent = '—';

    document.getElementById(
        'resultado-salinidad'
    ).textContent = '—';
}


function buscarRegistroFisicoquimico(
    idSitio,
    anio,
    periodo
) {
    return datosHistoricos.find(registro =>
        String(
            registro.ID_Sitio ?? ''
        ).trim() ===
            String(idSitio).trim() &&

        String(
            registro['Año'] ?? ''
        ) ===
            String(anio) &&

        String(
            registro.Periodo_Muestreo ?? ''
        ).trim() ===
            String(periodo).trim()
    );
}


function mostrarResultadosFisicoquimicos(
    idSitio,
    nombreSitio
) {
    if (
        typeof moduloActivo === 'undefined' ||
        moduloActivo !== 'fisicoquimico'
    ) {
        return;
    }

    const anio =
        document.getElementById(
            'filtro-anio'
        ).value;

    const periodo =
        document.getElementById(
            'filtro-mes'
        ).value;

    const contexto =
        document.getElementById(
            'fisicoquimico-contexto'
        );

    if (!anio || !periodo) {
        limpiarTablaFisicoquimica();

        contexto.textContent =
            'Selecciona primero un año y un mes.';

        return;
    }

    const registro =
        buscarRegistroFisicoquimico(
            idSitio,
            anio,
            periodo
        );

    document.getElementById(
        'fisicoquimico-nombre'
    ).textContent =
        nombreSitio;

    document.getElementById(
        'fisicoquimico-periodo'
    ).textContent =
        `${periodo} ${anio}`;

    if (!registro) {
        contexto.textContent =
            'No hay resultados disponibles para este sitio y periodo.';

        document.getElementById(
            'resultado-ph'
        ).textContent = 'SD';

        document.getElementById(
            'resultado-od-mg'
        ).textContent = 'SD';

        document.getElementById(
            'resultado-od-pct'
        ).textContent = 'SD';

        document.getElementById(
            'resultado-temperatura'
        ).textContent = 'SD';

        document.getElementById(
            'resultado-conductividad'
        ).textContent = 'SD';

        document.getElementById(
            'resultado-tds'
        ).textContent = 'SD';

        document.getElementById(
            'resultado-salinidad'
        ).textContent = 'SD';

        return;
    }

    contexto.textContent =
        'Resultados del monitoreo seleccionado.';

    document.getElementById(
        'resultado-ph'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.pH
        );

    document.getElementById(
        'resultado-od-mg'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.Oxigeno_Disuelto_mg_L,
            'mg/L'
        );

    document.getElementById(
        'resultado-od-pct'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.Oxigeno_Disuelto_pct,
            '%'
        );

    document.getElementById(
        'resultado-temperatura'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.Temperatura_Agua_C,
            '°C'
        );

    document.getElementById(
        'resultado-conductividad'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.Conductividad_uS_cm,
            'µS/cm'
        );

    document.getElementById(
        'resultado-tds'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.TDS_ppm,
            'ppm'
        );

    document.getElementById(
        'resultado-salinidad'
    ).textContent =
        formatearDatoFisicoquimico(
            registro.Salinidad_PSU,
            'PSU'
        );
}