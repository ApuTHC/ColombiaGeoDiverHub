/* <-------------- ventana emergente bienvenida --------------> */



/* <-------------- API key_Arcgis --------------> */

/* <------------------- Menu geodiversidad -------------------> */

/* Configura el ancho del menu desplegable a XXX px (show it) */
function openNav() {
  document.getElementById("sidepanelmenu").style.width = "350px";
  document.getElementById("main").style.marginLeft = "350px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}
/* configura el ancho del menu a 0 (hide it) */
function closeNav() {
  document.getElementById("sidepanelmenu").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.body.style.backgroundColor = "#333333";
}




// Función anónima autoejecutable para evitar conflictos con otras librerías
(function() {
  
// Declaramos una variable global para el mapa
var map;

// Esperamos a que el documento esté listo
$(document).ready(function () {

  // Inicializamos el mapa en una posición y con un zoom determinados
  map = L.map('map').setView([5.5, -74], 5);



  

  // Añadimos el mapa base de OpenStreetMap con relieve
  var osm = L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);


  // Añadimos el poligono de Colombia desde Arcgis.com
  var limite_colombia = L.esri.featureLayer({url: "https://services1.arcgis.com/Qrk4Z5vQ94JXkdYM/arcgis/rest/services/colombia/FeatureServer/0"});
  limite_colombia.addTo(map);


  // Añadimos el poligono de regiones naturales de Colombia desde Arcgis.com
  var reg_colombia = L.esri.featureLayer({
    url: "https://services6.arcgis.com/DDaVpjlpeb7RGXHg/arcgis/rest/services/Regiones_Naturales_de_Colombia/FeatureServer/0"
  });
   reg_colombia.addTo(map);


     // Añadimos el poligono de regiones naturales de Colombia desde Arcgis.com
  var ligs_AV = L.esri.featureLayer({
    url: "https://services1.arcgis.com/Qrk4Z5vQ94JXkdYM/arcgis/rest/services/ligs_av/FeatureServer/0"
  });
  ligs_AV.addTo(map);


  

  // Datos propios para cada region

  // Creamos un geojson que representa un punto para cada region
  var geojson_pacifico = 
  { 
    "type": "Point", 
    "coordinates": [-77.404518,6.226262]
  } 
  // Creamos una capa a partir del geojson anterior y la añadimos al mapa
  var pacifico = L.geoJSON(geojson_pacifico).addTo(map).bindPopup("<b>Pacífico</b>");


  var geojson_caribe = 
  { 
    "type": "Point", 
    "coordinates": [-73.05902,10.836154]
  } 
  // Creamos una capa a partir del geojson anterior y la añadimos al mapa
  var caribe = L.geoJSON(geojson_caribe).addTo(map).bindPopup("<b>Caribe</b>");

  
  var geojson_andina = 
  { 
    "type": "Point", 
    "coordinates": [-76.999741,1.145637]
  } 
  // Creamos una capa a partir del geojson anterior y la añadimos al mapa
  var andina = L.geoJSON(geojson_andina).addTo(map).bindPopup("<b>Andina</b>");


  // Creamos un geojson que representa un punto para cada region
  var geojson_orinoco = 
  { 
    "type": "Point", 
    "coordinates": [-67.570038,6.203475]
  } 
  // Creamos una capa a partir del geojson anterior y la añadimos al mapa
  var orinoco = L.geoJSON(geojson_orinoco).addTo(map).bindPopup("<b>Orinoco</b>");


  // Creamos un geojson que representa un punto para cada region
  var geojson_amazonas = 
  { 
    "type": "Point", 
    "coordinates": [-70.048828,-4.101083]
  } 
  // Creamos una capa a partir del geojson anterior y la añadimos al mapa
  var amazonas = L.geoJSON(geojson_amazonas).addTo(map).bindPopup("<b>Amazonas</b>");


  // Creamos un mapa base satelital de ESRI
  var imagery = L.esri.basemapLayer('Imagery');

  // Funcion que arroja coordenadas cuando se da click
  var popup = L.popup();

    function onMapClick(e) {
        popup.setLatLng(e.latlng).setContent("Este sitio tiene las siquientes coordenadas: " + e.latlng.toString()).openOn(map);
    }

    map.on('click', onMapClick);

  /* <------------------- Barra Lateral -------------------> */

  // Inicializamos la barra lateral y la añadimos al mapa
  sidebar = L.control.sidebar({
    autopan: false,       // whether to maintain the centered map point when opening the sidebar
    closeButton: true,    // whether t add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'right',     // left or right
  }).addTo(map);


  /* <------------------- Control de Capas -------------------> */

  // Creamos un objeto con las capas y sus nombres que queremos que aparezcan en el control de capas
  const overlays = [
    {name: 'Limite Colombia', layer: limite_colombia},
    {name: 'Regiones Colombia', layer: reg_colombia},
    {name: 'Andina', layer: andina},
    {name: 'Caribe', layer: caribe},
    {name: 'Pacífica', layer: pacifico},
    {name: 'Orinoco', layer: orinoco},
    {name: 'Amazonas', layer: amazonas},

  ];
  // Creamos el control de capas y lo añadimos al mapa
  const legend = L.multiControl(overlays, {position:'topright', label: 'Control de capas'}).addTo(map);
  
  // Añadimos el contenido del control de capas a la barra lateral
  $("#capasContent").append($(legend._container).find(".leaflet-controllable-legend-body"));
  // Borramos el contenedor del control de capas del mapa
  $(legend._container).remove();


  /* <------------------- Control de Mapa Base -------------------> */

  // Creamos un array con los objetos que contengan los mapas base, imagenes y nombres que queremos que aparezcan en el control de mapas base
  const basemaps_array = [
    {
      layer: osm, //DEFAULT MAP
      icon: 'img/img1.PNG',
      name: 'OpenStreetMap'
    },
    {
      layer: imagery,
      icon: 'img/img2.PNG',
      name: 'Imagery ESRI'
    },
    {
      layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      icon: 'img/img3.PNG',
      name: 'OpenTopoMap'
    },
    {
      layer: L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
        attribution: '© Google'
      }),
      icon: 'img/img4.PNG',
      name: 'Google Maps'

      
    },
  ];

  // Creamos el control de mapas base y lo añadimos al mapa
  const basemaps = new L.basemapsSwitcher(basemaps_array, { position: 'topright' }).addTo(map);
  
  // Añadimos el contenido del control de mapas base a la barra lateral
  $("#basemapContent").append($(basemaps._container));
  // Removemos la clase que oculta los mapabase
  $(basemaps._container).find(".basemapImg").removeClass("hidden");


  /* <------------- Control de carga de archivos------------> */



  /* <------------- Control de descarga de archivos------------> */



  /* <------------- Control de Herramienta de MiniMapa -------------------> */

  // Creamos el mapa base para el minimapa
  var osm2 = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {minZoom: 0, maxZoom: 13, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
  // Se crean los estilos para el rectangulo y la sombra que representa el area visible en el minimapa
  var rect1 = {color: "#ff1100", weight: 3};
  var rect2 = {color: "#0000AA", weight: 1, opacity:0, fillOpacity:0};
  // Creamos el control de minimapa y lo añadimos al mapa
  var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, aimingRectOptions : rect1, shadowRectOptions: rect2, position: "bottomleft"}).addTo(map);


/* <------------------- Control de escala grafica -------------------> */
L.control.scale({position: "bottomleft", maxWidth: 100, metric: true, imperial: false}).addTo(map);
    
/* <------------------- Control de botones de zoom -------------------> */
map.zoomControl.setPosition('bottomleft');




  /* <------------- Control de Herramienta de Dibujo ------------> */

  // Creamos el control de dibujo y lo añadimos al mapa
  map.pm.addControls({
    position: 'bottomleft',
    drawMarker: true,
    drawPolyline: true,
    drawPolygon: true,
    
    drawRectangle: false,
    drawCircle: false,
    drawCircleMarker: false,
    drawText: false,

    editMode: true,
    dragMode:true,
    cutPolygon:false,
    removalMode: true,
    rotateMode: false
  });

  // Declaramos una variable de contador de capas creadas
  var contador = 1;

  // Creamos una función que se ejecutará cada vez que se cree una nueva capa
  map.on('pm:create', function (e) {
      // Obtenemos la capa creada y su GeoJSON
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      console.log(geojson);
      // Creamos un nombre para la capa e incrementamos el contador de capas creadas
      const nombre = layer.pm._shape + " " + contador;
      contador++;
      // Añadimos la capa creada al control de capas
      legend.addOverlay({name: nombre, layer: layer});

      // Ejecutamos el editor de LIGs



  });


  /* <----------- Control de Herramienta de Busqueda ----------> */

  // Creamos el control de búsqueda y lo añadimos al mapa
  searchCtrl = L.control.fuseSearch().addTo(map);


  // Añadimos el contenido del control de búsqueda a la barra lateral
  $("#buscadorContent").append($(".leaflet-fusesearch-panel .content"));
  // Removemos el botón y contenedor del control de búsqueda del mapa
  $(searchCtrl._container).remove();
  // Añadimos un ícono de búsqueda al control de búsqueda
  $(".content .header").prepend('<i class="fa-solid fa-magnifying-glass-location"></i>');
  // Removemos el botón de cerrar del control de búsqueda
  $(".content .header .close").remove();


  /* <----------- Control de datos y capas cargadas----------> */

        // Get the modals
        var modals = document.getElementsByClassName('modal');
        // Get the button that opens the modal
          var btns = document.getElementsByClassName("openmodal");
        // Get the <span> element that closes the modal
          var spans=document.getElementsByClassName("close");

        // When the user clicks the button, open the modal 
          for(let i=0;i<btns.length;i++){
            btns[i].onclick = function() {
              modals[i].style.display = "block";
             }
          }
        // When the user clicks on <span> (x), close the modal
          for(let i=0;i<spans.length;i++){
           spans[i].onclick = function() {
             modals[i].style.display = "none";
             }
          }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
         if (event.target == modal) {
            modal.style.display = "none";
             }
          }        
          

  
});
})();
















