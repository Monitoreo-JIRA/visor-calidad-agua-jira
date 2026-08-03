// ==========================================
// MAPA PRINCIPAL
// ==========================================

// Crear el mapa y centrarlo en la región de la JIRA
const map = L.map('map').setView(
    [19.55, -104.20],
    9
);

// Crear panel para las subcuencas
map.createPane('subcuencasPane');

map.getPane(
    'subcuencasPane'
).style.zIndex = 400;

// Crear panel para los sitios de monitoreo
map.createPane('sitiosPane');

map.getPane(
    'sitiosPane'
).style.zIndex = 650;