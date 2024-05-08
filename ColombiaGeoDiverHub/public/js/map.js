// Declaramos una variable global para el mapa
var map;
var markers = L.markerClusterGroup();
var capaPuntos = L.layerGroup();

// Función anónima autoejecutable para evitar conflictos con otras librerías
(function() {
  

var datos_modal = {}

// Esperamos a que el documento esté listo
$(document).ready(function () {

  // Inicializamos el mapa en una posición y con un zoom determinados
  map = L.map('map').setView([5.5, -74], 5);

  AddMenu();

  
  // Añadimos el mapa base de OpenStreetMap con relieve
  var osm = L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);


  // Añadimos el poligono de regiones naturales de Colombia desde Arcgis.com
  var reg_colombia = L.esri.featureLayer({
    url: "https://services6.arcgis.com/DDaVpjlpeb7RGXHg/arcgis/rest/services/Regiones_Naturales_de_Colombia/FeatureServer/0"
  });
  reg_colombia.addTo(map);

  var ligs;
  markers.clearLayers();
  capaPuntos.clearLayers();
  database.ref().child("lig").get().then((snapshot) => {
    if (snapshot.exists()) {
        this.database = snapshot.val();
        db = snapshot.val();
        console.log(db);
        for (let i = 0; i < db.length; i++) {
            const element = db[i];
            if (element.active){
                auxLng = element['lng'];
                auxLat = element['lat'];
                var point = L.marker([auxLat, auxLng]).toGeoJSON();                
                L.extend(point.properties, {
                    id: i,
                    Codigo: element['code'],
                    Fecha: element['date'],
                    Descripcion: element['info'],
                    Norte: element['lat'],
                    Este: element['lng'],
                    Nombre: element['name'],
                    Region: element['region'],
                    Tipologia: element['type'],
                    Responsable: element['user'],
                    
                });
                L.geoJson(point,{
                    onEachFeature: function(feature, layer) {
                      if (feature.properties) {
                        layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                        return k + ": " + feature.properties[k];
                        }).join("<br />"), {
                        maxHeight: 200
                        });
                      }
                    }
                }).addTo(markers);
                
            }
            
        }
        markers.addTo(capaPuntos);
        markers.addTo(map);
        notification.success('¡Listo!', 'Se cargó con exito los eventos');
        console.log(capaPuntos.toGeoJSON());
    } else {
        console.log("No data available");
        notification.alert('¡Error!', 'Ocurrió un error al intentar cargar los eventos de la base de datos, no hay datos');
    }
  }).catch((error) => {
      notification.alert('¡Error!', 'Ocurrió un error al intentar cargar los eventos');
      console.log(error);
  });


  // Datos propios para cada region


  // Creamos un mapa base satelital de ESRI
  var imagery = L.esri.basemapLayer('Imagery');

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
    {name: 'Regiones Colombia', layer: reg_colombia},
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
    drawPolyline: false,
    drawPolygon: false,
    
    drawRectangle: false,
    drawCircle: false,
    drawCircleMarker: false,
    drawText: false,

    editMode: false,
    dragMode:true,
    cutPolygon:false,
    removalMode: false,
    rotateMode: false
  });

  notification = L.control.notifications({
    timeout: 4000,
    position: 'topright',
    closable: true,
    dismissable: true,
    className: 'pastel'
}).addTo(map);


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
          
  $('#dataModal').on('show.bs.modal', function (e) {
    console.log($(e.relatedTarget).data('whatever'));
    $(".modal-title").html(datos_modal[$(e.relatedTarget).data('whatever')]["title"]);
    $(".modal-body").html(datos_modal[$(e.relatedTarget).data('whatever')]["html_content"]);
  })

  $('#files').change(function(evt) {
    var files = evt.target.files; 
    for (var i = 0, f; f = files[i]; i++) {
        if (f.name.slice(-3) === 'zip') {
            GraficarFileSHP(f);
        }else if (f.name.slice(-3) === 'kml') {
            GraficarFileKML(f);
        }else if (f.name.slice(-3) === 'kmz') {
            GraficarFileKMZ(f);
        }else if (f.name.slice(-4) === 'json') {
            GraficarFileGeoJSON(f);
        }else{
            notification.alert('Atención', 'Tipo de archivo incorrecto');
        }
      }
});
// Función que asigna el nombre del archivo al texto del input
$("#files").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});
  
});

function AddMenu() {
  for (let i = 0; i < datos["data_modal"].length; i++) {
    const element = datos["data_modal"][i];
    datos_modal[element["id"]] = element;    

    $("#menu-content").append(`<a class="dropdown-item" data-toggle="modal" data-target="#dataModal" data-whatever="${element["id"]}">${element["title"]}</a>`);

  }
}

// crearDB();
function crearDB() {
  var bd = {"lig": []};
  for (let i = 0; i < aburra["features"].length; i++) {
    const element = aburra["features"][i];
    let object = {}

    object["name"] = element["properties"]["Name"] ? element["properties"]["Name"] : "Sin nombre";
    object["region"] = "";
    object["code"] = element["properties"]["Nomenclatu"];
    object["date"] = "2024-03-03";
    object["lat"] = element["geometry"]["coordinates"][1];
    object["lng"] = element["geometry"]["coordinates"][0];
    object["type"] = "";
    object["info"] = "";
    object["user"] = "";
    object["active"] = true;

    bd["lig"].push(object);
  }
  for (let i = 0; i < nuqui["features"].length; i++) {
    const element = nuqui["features"][i];
    let object = {}

    object["name"] = element["properties"]["Nombre"] ? element["properties"]["Nombre"] : "Sin nombre";
    object["region"] = element["properties"]["Región"] ? element["properties"]["Región"] : "";
    object["code"] = "NU" + i;
    object["date"] = "2024-03-03";
    object["lat"] = element["geometry"]["coordinates"][1];
    object["lng"] = element["geometry"]["coordinates"][0];
    object["type"] = "";
    object["info"] = "";
    object["user"] = "";
    object["active"] = true;

    bd["lig"].push(object);
  }
  for (let i = 0; i < sanrafael["features"].length; i++) {
    const element = sanrafael["features"][i];
    let object = {}

    object["name"] = element["properties"]["Name"] ? element["properties"]["Name"] : "Sin nombre";
    object["region"] = "";
    object["code"] = "SR" + i;
    object["date"] = "2024-03-03";
    object["lat"] = element["geometry"]["coordinates"][1];
    object["lng"] = element["geometry"]["coordinates"][0];
    object["type"] = "";
    object["info"] = "";
    object["user"] = "";
    object["active"] = true;

    bd["lig"].push(object);
  }
  for (let i = 0; i < snsm["features"].length; i++) {
    const element = snsm["features"][i];
    let object = {}

    object["name"] = element["properties"]["Name"] ? element["properties"]["Name"] : "Sin nombre";
    object["region"] = "";
    object["code"] = "SNSM" + i;
    object["date"] = "2024-03-03";
    object["lat"] = element["geometry"]["coordinates"][1];
    object["lng"] = element["geometry"]["coordinates"][0];
    object["type"] = "";
    object["info"] = "";
    object["user"] = "";
    object["active"] = true;

    bd["lig"].push(object);
  }

  console.log(bd);
}

//Cargar Capas ----->

// Función que controla el input donde se suben los archivos

// Función que añade el cudro de la capa a la sección de la Barra Lateral para capas tipo KML, KMZ, GeoJSON y SHP
function AgregarContenidoFile(f) {
    $("#content-input-cargarCapa").append(
        '<div class="content-file">'+
            '<div class="locate-cargarCapa" id="locate-cargarCapa_' + featuresCount + '"  onClick="EnfocarCapa(id)"><i class="fa-solid fa-crosshairs"></i></div>'+
            '<label class="switch">'+
                '<input type="checkbox" checked id="file_' + featuresCount + '" onChange="toggleDatosFiles(id)">'+
                '<span class="slider round"></span>'+
            '</label>'+
            '<a>'+ f.name +'</a>'+
            '<div class="d-block"></div>'+
            '<div class="slidecontainer">'+
                '<input type="range" min="0" max="100" value="0" class="sliderb" id="transp_file_'+featuresCount+'">'+
                '<p>Transparencia: <span id="valTransp_file_'+featuresCount+'"></span>%</p>'+
            '</div>'+
        '</div>'
    );
    var slider = $("#transp_file_"+featuresCount)[0];
    var output = $("#valTransp_file_"+featuresCount)[0];
    output.innerHTML = slider.value;
    slider.oninput = function () {
      var id = parseInt($(this).attr('id').split('_')[2]);
      var output = $("#valTransp_file_"+id)[0];
      output.innerHTML = this.value;
      var transpa = (100 - parseInt(this.value)) / 100;
      if ($('#file_' + id).prop('checked')) {
        featureFiles[id].setStyle({opacity : transpa});
      }
    }
    featuresCount++;
}

// Funciones para cargar la información al visor
// Cargar KML
function GraficarFileKML(f) {
    var reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e) {
        fetch(e.target.result)
          .then(res => res.text())
          .then(kmltext => {
            const parser = new DOMParser();
            const kml = parser.parseFromString(kmltext, 'text/xml');
            const track = new L.KML(kml,{pane: "layersPane"});
            track.setStyle({opacity : 1});   
            track.addTo(map); 
            try {
                map.fitBounds(track.getBounds());
            } catch (error) {
                console.log(error);
            }
            featureFiles.push(track);
            AgregarContenidoFile(f);
          });
      };
    })(f);
    reader.readAsDataURL(f); 
}
// Cargar KMZ
function GraficarFileKMZ(f) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var result = reader.result;
        var kmz = L.kmzLayer().addTo(map);
        kmz.parse(result, { name: f.name, icons: {} ,pane: "layersPane"});
        featureFiles.push(kmz);        
        try {
            setTimeout(() => { map.fitBounds(kmz.getBounds()); AgregarContenidoFile(f);}, 200);
        } catch (error) {
            console.log(error);
        }
    };
    reader.readAsArrayBuffer(f); 
}
// Cargar GeoJSON
function GraficarFileGeoJSON(f) {
  
    var reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e) {

        var obj = JSON.parse(e.target.result);
        
        var geoJSON = new L.geoJson(obj, {
          onEachFeature: function(feature, layer) {
            if (feature.properties) {
              layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                return k + ": " + feature.properties[k];
              }).join("<br />"), {
                maxHeight: 200
              });
            }
          },
          pane: "layersPane",
        });
        geoJSON.setStyle({opacity : 1});  
        geoJSON.addTo(map);  
        map.fitBounds(geoJSON.getBounds());
        featureFiles.push(geoJSON);
        AgregarContenidoFile(f);
      };
    })(f);
    reader.readAsText(f);
  
}
// Cargar SHP comprimidos en .zip
function GraficarFileSHP(f) {
    var reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e) {
  
        var shpfile = new L.Shapefile(e.target.result, {
          onEachFeature: function(feature, layer) {
            if (feature.properties) {
              layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                return k + ": " + feature.properties[k];
              }).join("<br />"), {
                maxHeight: 200
              });
            }
          },
          pane: "layersPane",
        });
        shpfile.setStyle({opacity : 1});  
        shpfile.addTo(map);  
        try {
            setTimeout(() => { map.fitBounds(shpfile.getBounds());}, 200);
        } catch (error) {
            console.log(error);
        }
        featureFiles.push(shpfile);
        AgregarContenidoFile(f);
        shpfile.once("data:loaded", function() {
          console.log("finished loaded shapefile");
          console.log(shpfile.toGeoJSON());
        });   
  
      };
    })(f);
    reader.readAsArrayBuffer(f);
}



})();

// Variables para gestión de Carga de Capas
var featureFiles = [];
var featuresCount = 0;

// Función que centra la capa seleccionada en el mapa
function EnfocarCapa(id){
  var num = id.split("_")[1];
  try {
      map.fitBounds(featureFiles[num].getBounds());
  } catch (error) {
      console.log(error);
  }
}
// Función que muestra/oculta las capas en el mapa
function toggleDatosFiles(id){
  var num = id.split("_")[1];
  if ($('#'+id).prop('checked')){
      featureFiles[num].addTo(map);
  } else{
      map.removeLayer(featureFiles[num]);
  }
}


//<----- Fin Cargar Capas