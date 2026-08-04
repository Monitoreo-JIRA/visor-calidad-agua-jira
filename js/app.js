// ==========================================
// PANEL LATERAL FLOTANTE Y CONTRAÍBLE
// ==========================================

const panelLateralElemento =
    document.getElementById(
        'panel-lateral'
    );

const botonPanelElemento =
    document.getElementById(
        'boton-panel'
    );

const botonAbrirPanel =
    document.getElementById(
        'abrir-panel-lateral'
    );

const accesoBacteriologico =
    document.getElementById(
        'acceso-bacteriologico'
    );

const accesoFisicoquimico =
    document.getElementById(
        'acceso-fisicoquimico'
    );


function contraerPanelLateral() {
    panelLateralElemento.classList.add(
        'contraido'
    );

    document.body.classList.remove(
        'panel-abierto'
    );

    setTimeout(function () {
        if (
            typeof map !== 'undefined' &&
            map
        ) {
            map.invalidateSize();
        }
    }, 260);
}


function abrirPanelLateral() {
    panelLateralElemento.classList.remove(
        'contraido'
    );

    document.body.classList.add(
        'panel-abierto'
    );

    setTimeout(function () {
        if (
            typeof map !== 'undefined' &&
            map
        ) {
            map.invalidateSize();
        }
    }, 260);
}


botonPanelElemento.addEventListener(
    'click',
    contraerPanelLateral
);


botonAbrirPanel.addEventListener(
    'click',
    abrirPanelLateral
);


/*
   Abrir directamente el módulo
   bacteriológico.
*/

accesoBacteriologico.addEventListener(
    'click',
    function () {
        panelLateralElemento.classList.remove(
            'modo-fisicoquimico'
        );

        panelLateralElemento.classList.add(
            'modo-bacteriologico'
        );

        abrirPanelLateral();
        const botonLeyendaFlotante =
    document.getElementById(
        'boton-leyenda-flotante'
    );

if (botonLeyendaFlotante) {
    botonLeyendaFlotante.style.display =
        'flex';
}
       

        const botonBacteriologico =
            document.getElementById(
                'boton-bacteriologico'
            );

        if (botonBacteriologico) {
            botonBacteriologico.click();
        }
    }
);


/*
   Abrir directamente el módulo
   fisicoquímico.
*/

accesoFisicoquimico.addEventListener(
    'click',
    function () {
        panelLateralElemento.classList.remove(
            'modo-bacteriologico'
        );

        panelLateralElemento.classList.add(
            'modo-fisicoquimico'
        );

        abrirPanelLateral();
        const botonLeyendaFlotante =
    document.getElementById(
        'boton-leyenda-flotante'
    );

if (botonLeyendaFlotante) {
    botonLeyendaFlotante.style.display =
        'none';
}

        const botonFisicoquimicos =
            document.getElementById(
                'boton-fisicoquimicos'
            );

        if (botonFisicoquimicos) {
            botonFisicoquimicos.click();
        }
    }
);
if (
    panelLateralElemento &&
    !panelLateralElemento.classList.contains(
        'contraido'
    )
) {
    document.body.classList.add(
        'panel-abierto'
    );
}
