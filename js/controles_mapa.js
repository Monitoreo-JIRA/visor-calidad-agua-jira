// ==========================================
// CONTROLES FLOTANTES DEL MAPA
// ==========================================


// ------------------------------------------
// PANEL DE CAPAS
// ------------------------------------------

const botonCapasFlotante =
    document.getElementById(
        'boton-capas-flotante'
    );

const panelCapasFlotante =
    document.getElementById(
        'panel-capas-flotante'
    );

const cerrarPanelCapas =
    document.getElementById(
        'cerrar-panel-capas'
    );


// ------------------------------------------
// PANEL DE SIMBOLOGÍA
// ------------------------------------------

const botonLeyendaFlotante =
    document.getElementById(
        'boton-leyenda-flotante'
    );

const panelLeyendaFlotante =
    document.getElementById(
        'panel-leyenda-flotante'
    );

const cerrarPanelLeyenda =
    document.getElementById(
        'cerrar-panel-leyenda'
    );


// ------------------------------------------
// CASILLAS DE CAPAS
// ------------------------------------------

const checkSubcuencas =
    document.getElementById(
        'capa-subcuencas-check'
    );

const checkCauces =
    document.getElementById(
        'capa-cauces-check'
    );

const checkSitios =
    document.getElementById(
        'capa-sitios-check'
    );


// ==========================================
// ABRIR Y CERRAR PANELES
// ==========================================

function alternarPanelCapas() {
    const panelOculto =
        panelCapasFlotante.classList.toggle(
            'oculto'
        );

    botonCapasFlotante.classList.toggle(
        'activo',
        !panelOculto
    );

    /*
       Si se abre el panel de capas,
       cerrar el de simbología.
    */
    if (!panelOculto) {
        cerrarLeyendaFlotante();
    }
}


function cerrarCapasFlotantes() {
    panelCapasFlotante.classList.add(
        'oculto'
    );

    botonCapasFlotante.classList.remove(
        'activo'
    );
}


function alternarPanelLeyenda() {
    const panelOculto =
        panelLeyendaFlotante.classList.toggle(
            'oculto'
        );

    botonLeyendaFlotante.classList.toggle(
        'activo',
        !panelOculto
    );

    /*
       Si se abre la simbología,
       cerrar el panel de capas.
    */
    if (!panelOculto) {
        cerrarCapasFlotantes();
    }
}


function cerrarLeyendaFlotante() {
    panelLeyendaFlotante.classList.add(
        'oculto'
    );

    botonLeyendaFlotante.classList.remove(
        'activo'
    );
}


// ==========================================
// MOSTRAR Y OCULTAR CAPAS
// ==========================================

function actualizarCapa(
    capa,
    mostrar
) {
    if (!capa) {
        return;
    }

    if (mostrar) {
        if (!map.hasLayer(capa)) {
            capa.addTo(map);
        }
    } else {
        if (map.hasLayer(capa)) {
            map.removeLayer(capa);
        }
    }
}


// ==========================================
// EVENTOS DE LOS BOTONES
// ==========================================

botonCapasFlotante.addEventListener(
    'click',
    alternarPanelCapas
);


cerrarPanelCapas.addEventListener(
    'click',
    cerrarCapasFlotantes
);


botonLeyendaFlotante.addEventListener(
    'click',
    alternarPanelLeyenda
);


cerrarPanelLeyenda.addEventListener(
    'click',
    cerrarLeyendaFlotante
);


// ==========================================
// EVENTOS DE LAS CAPAS
// ==========================================

checkSubcuencas.addEventListener(
    'change',
    function () {
        actualizarCapa(
            window.capaSubcuencas,
            this.checked
        );
    }
);


checkCauces.addEventListener(
    'change',
    function () {
        actualizarCapa(
            window.capaCauces,
            this.checked
        );
    }
);


checkSitios.addEventListener(
    'change',
    function () {
        actualizarCapa(
            window.capaSitios ??
                capaSitios,
            this.checked
        );
    }
);


// ==========================================
// CERRAR AL HACER CLIC FUERA
// ==========================================

document.addEventListener(
    'click',
    function (evento) {
        const clicEnBotonCapas =
            botonCapasFlotante.contains(
                evento.target
            );

        const clicEnPanelCapas =
            panelCapasFlotante.contains(
                evento.target
            );

        const clicEnBotonLeyenda =
            botonLeyendaFlotante.contains(
                evento.target
            );

        const clicEnPanelLeyenda =
            panelLeyendaFlotante.contains(
                evento.target
            );

        if (
            !clicEnBotonCapas &&
            !clicEnPanelCapas
        ) {
            cerrarCapasFlotantes();
        }

        if (
            !clicEnBotonLeyenda &&
            !clicEnPanelLeyenda
        ) {
            cerrarLeyendaFlotante();
        }
    }
);


console.log(
    'Controles flotantes del mapa cargados.'
);
