// Declaramos una variable global para el mapa
var map;
var legend;
var arraySize;
var markers = L.markerClusterGroup();
var capaPuntos = L.layerGroup();
var capaDescarga = L.layerGroup();

// Función anónima autoejecutable para evitar conflictos con otras librerías
(function() {
  

var datos_modal = {}

  // Esperamos a que el documento esté listo
  $(document).ready(function () {

    // Inicializamos el mapa en una posición y con un zoom determinados
    map = L.map('map').setView([5.5, -74], 5);

    AddMenu();

    var today = new Date().toISOString().split('T')[0];
    $("#lig_fecha").val(today);
    
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
    capaDescarga.clearLayers();
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
                        feature.layer = layer;
                        if (feature.properties) {
                          layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                            return k + ": " + feature.properties[k];
                          }).join("<br />"), {
                            maxHeight: 200
                          });
                        }
                      }
                  }).addTo(markers);

                  var point1 = L.marker([auxLat, auxLng]).toGeoJSON();                
                  L.extend(point1.properties, {
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
                  L.geoJson(point1).addTo(capaDescarga);
                  
              }
              
          }
          markers.addTo(capaPuntos);
          markers.addTo(map);
          notification.success('¡Listo!', 'Se cargó con exito los LIG');
          console.log(capaPuntos.toGeoJSON());
          // Añadimos la capa de municipio al control de búsqueda con los campos que queremos filtrar y que se muestrarán en la busqueda
          searchCtrl.indexFeatures(markers.toGeoJSON(), ['Codigo', 'Descripcion','Nombre', 'Region', 'Tipologia', 'Responsable']);
      
      } else {
          console.log("No data available");
          notification.alert('¡Error!', 'Ocurrió un error al intentar cargar los LIG de la base de datos, no hay datos');
      }
    }).catch((error) => {
        notification.alert('¡Error!', 'Ocurrió un error al intentar cargar los LIG');
        console.log(error);
    });

    database.ref().child("lig").orderByKey().limitToLast(1).on('value', function(snapshot) {
      var lastKey = Object.keys(snapshot.val())[0];
      arraySize = parseInt(lastKey) + 1; // Sumamos 1 porque los índices comienzan en 0
      console.log('Tamaño del array:', arraySize);
    });


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
    legend = L.multiControl(overlays, {position:'topright', label: 'Control de capas'}).addTo(map);
    
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
    ];

    // Creamos el control de mapas base y lo añadimos al mapa
    const basemaps = new L.basemapsSwitcher(basemaps_array, { position: 'topright' }).addTo(map);
    
    // Añadimos el contenido del control de mapas base a la barra lateral
    $("#basemapContent").append($(basemaps._container));
    // Removemos la clase que oculta los mapabase
    $(basemaps._container).find(".basemapImg").removeClass("hidden");



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
    map.pm.setGlobalOptions({'snappable':false})

    map.on('pm:create', function (e) {
      var layer = e.layer;
      console.log(layer);
      sidebar.open('agregar');
      $("#lig_norte").val(layer._latlng.lat);
      $("#lig_este").val(layer._latlng.lng);
      layer.on('pm:edit', (e) => {
        console.log(e.layer);
        $("#lig_norte").val(e.layer._latlng.lat);
        $("#lig_este").val(e.layer._latlng.lng);
        sidebar.open('agregar');
      });
    });


    notification = L.control.notifications({
      timeout: 4000,
      position: 'bottomright',
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
    
    $("#logout").click(function (e) {
      firebase.auth().signOut();
      location.reload();
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
  function AgregarContenidoFile(f, layer) {
    legend.addOverlay({name: f.name, layer: layer});
    sidebar.open('capas');
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
              AgregarContenidoFile(f, track); 
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
          kmz.on('click', function(event) {
            if (event.layer.feature.geometry.type === "Point"){
              $("#lig_norte").val(event.latlng.lat);
              $("#lig_este").val(event.latlng.lng);
              sidebar.open('agregar');
            }
          });     
          try {
              setTimeout(() => { map.fitBounds(kmz.getBounds()); AgregarContenidoFile(f, kmz);}, 200);
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
          geoJSON.on('click', function(event) {
            if (event.layer.feature.geometry.type === "Point"){
              $("#lig_norte").val(event.latlng.lat);
              $("#lig_este").val(event.latlng.lng);
              sidebar.open('agregar');
            }
          });
          map.fitBounds(geoJSON.getBounds());
          AgregarContenidoFile(f, geoJSON); 
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
          console.log('shpfile', shpfile);
          shpfile.on('click', function(event) {
            if (event.layer.feature.geometry.type === "Point"){
              $("#lig_norte").val(event.latlng.lat);
              $("#lig_este").val(event.latlng.lng);
              sidebar.open('agregar');
            }
          });
          
          try {
              setTimeout(() => { map.fitBounds(shpfile.getBounds());}, 200);
          } catch (error) {
              console.log(error);
          }
          AgregarContenidoFile(f, shpfile); 
    
        };
      })(f);
      reader.readAsArrayBuffer(f);
  }

})();



//<----- Fin Cargar Capas

//Descargar Datos ----->

function DescargarDatos() {
  let filtroDescarga = '';
  let filtrotipo = $("#tipo_descarga").val();
  DescargarDatosJSON(capaDescarga.toGeoJSON(), "", filtroDescarga, filtrotipo, 0 )
  console.log(capaDescarga.toGeoJSON());
  
}

// Función para descargar un archivo
function saveToFile(content, filename) {
  var file = filename + '.json';
  console.log(content)
  saveAs(new File([JSON.stringify(content)], file, {
      type: "text/plain;charset=utf-8"
  }), file);
}

//Función que filtra los datos según el mpio seleccionado y construye el geojson
function DescargarDatosJSON(baseDatos, clase, filtro, filtrotipo, numero_real){
  let archivoFinal = {...baseDatos}
  //Eliminar el campos no deseados

  if (filtrotipo === 'shp') {
      var options = {
          folder: 'LIG_' +dateFormat(new Date(),'Y-m-d'),
          types: {
              point: 'LIG_'+dateFormat(new Date(),'Y-m-d'),
              polygon: 'LIG_'+dateFormat(new Date(),'Y-m-d'),
              polyline: 'LIG_'+dateFormat(new Date(),'Y-m-d')
          }
      }
      archivoFinal1 = unescape(encodeURIComponent(JSON.stringify(archivoFinal)))
      archivoFinal2 = JSON.parse(archivoFinal1)
      shpwrite.download(archivoFinal2, options);
  } else {
      saveToFile(archivoFinal, 'LIG_'+dateFormat(new Date(),'Y-m-d')); //Generar el archivo descargable
  }

}



function GuardarLIG() {
  const ids = {
    'code' : 'lig_code',
    'date' : 'lig_fecha',
    'info' : 'lig_obs',
    'lat' : 'lig_norte',
    'lng' : 'lig_este',
    'name' : 'lig_name',
    'region' : 'lig_region',
    'type' : 'lig_tipologia',
    'user' : 'lig_respon',
  }
  var stat = true;
  for (const key in ids) {
    if (Object.hasOwnProperty.call(ids, key)) {
      const element = ids[key];
      if ($("#"+element).val().trim() === "") {
        notification.alert('¡Error!', 'Debe llenar todos los campos');
        stat = false;
        break;
      }
    }
  }

  if (stat){
    var object = {"active": true}
    for (const key in ids) {
      if (Object.hasOwnProperty.call(ids, key)) {
        const element = ids[key];
        object[key] = $("#"+element).val().trim();
      }
    }
    console.log(object);
    database.ref('lig/'+arraySize).set(object).then((snap) => {
      notification.success('¡Listo!', 'Se guardó con exito el LIG');
      sidebar.close();
    }).catch((error) => {
      notification.alert('¡Error!', 'Ocurrió un error al intentar guardar el LIG');
      console.log(error);
    });
  }

}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      database.ref().child("users/"+user.uid).get().then((snapshot) => {
          if (snapshot.exists()) {
              if (snapshot.val().level > 1) {
                  $("#resgistro_Evento").toggleClass("d-none");  
                  $("#registrarEvento").toggleClass("d-none");
                  $("#registropane").append(
                      `<br>
                      <div class="form-group">
                        <label>ID:</label><br>
                        <input disabled type="text" class="form-control" id="lig_id_edit">
                      </div>
                      <div class="form-group">
                        <label>Nombre:</label><br>
                        <input type="text" class="form-control" id="lig_name_edit">
                      </div>
                      <div class="form-group">
                        <label>Código:</label><br>
                        <input type="text" class="form-control" id="lig_code_edit">
                      </div>
                      <div class="form-group">
                        <label>Región:</label><br>
                        <input type="text" class="form-control" id="lig_region_edit">
                      </div>
                      <div class="form-group">
                        <label>Fecha de ingreso:</label><br>
                        <input type="date" class="form-control" id="lig_fecha_edit">
                      </div>
                      <div class="form-group">
                        <label>Latitud (Norte):</label><br>
                        <input type="number" step=0.000000000000001 class="form-control" id="lig_norte_edit">
                      </div>
                      <div class="form-group">
                        <label>Longitud (Este):</label><br>
                        <input type="number" step=0.000000000000001 class="form-control" id="lig_este_edit">
                      </div>
                      <div class="form-group">
                        <label>Tipología:</label><br>
                        <select class="form-control" id="lig_tipologia_edit">
                          <option value="01">Científico</option>
                          <option value="02">Turístico</option>
                          <option value="03">Educativo</option>
                          <option value="04">Mixto</option>
                        </select>
                      </div>
                      <div class="form-group" id="lig_descripcion_edit">
                        <label>Descripción</label><br>
                        <textarea class="form-control" rows="3" id="lig_obs_edit"></textarea/>
                      </div>
                      <div class="form-group">
                        <label>Responsable:</label><br>
                        <input type="text" class="form-control" id="lig_respon_edit">
                      </div>
                      <br>
                      <div class="form-group">
                        <button type="button" class="btn btn-comun" onClick="EditarLIG()"> Editar LIG</button>
                        <button type="button" class="btn btn-comun" onClick="BorrarLIG()"> Borrar LIG</button>
                      </div>`
                  );
                  markers.on('click', function(e) {
                      editPoint(e);
                  }); 
              }
          } else {
              console.log("No data available");
          }
      }).catch((error) => {
          console.log(error);
      });
      
  } else {
      
      console.log("no hay usuario");      
  }

});

function editPoint(e) {
  const ids = {
    'id' : 'lig_id_edit',
    'Codigo' : 'lig_code_edit',
    'Fecha' : 'lig_fecha_edit',
    'Descripcion' : 'lig_obs_edit',
    'Norte' : 'lig_norte_edit',
    'Este' : 'lig_este_edit',
    'Nombre' : 'lig_name_edit',
    'Region' : 'lig_region_edit',
    'Tipologia' : 'lig_tipologia_edit',
    'Responsable' : 'lig_respon_edit',
  }
  for (const key in ids) {
    if (Object.hasOwnProperty.call(ids, key)) {
      const element = ids[key];
      $("#"+element).val(e.layer.feature.properties[key]);
    }
  }
  console.log(e);
  sidebar.open('registrarEvento');
}

function EditarLIG() {
  const ids = {
    'code' : 'lig_code_edit',
    'date' : 'lig_fecha_edit',
    'info' : 'lig_obs_edit',
    'lat' : 'lig_norte_edit',
    'lng' : 'lig_este_edit',
    'name' : 'lig_name_edit',
    'region' : 'lig_region_edit',
    'type' : 'lig_tipologia_edit',
    'user' : 'lig_respon_edit',
  }
  const id = $("#lig_id_edit").val();
  var stat = true;

  if (stat){
    var object = {"active": true}
    for (const key in ids) {
      if (Object.hasOwnProperty.call(ids, key)) {
        const element = ids[key];
        object[key] = $("#"+element).val()
      }
    }
    console.log(object);
    database.ref('lig/'+id).set(object).then((snap) => {
      notification.success('¡Listo!', 'Se guardó con exito el evento');
      sidebar.close();
    }).catch((error) => {
      notification.alert('¡Error!', 'Ocurrió un error al intentar guardar el evento');
      console.log(error);
    });
  }

}

function BorrarLIG() {
  const id = $("#lig_id_edit").val();
  var stat = true;
  if (stat){
    database.ref('lig/'+id+'/'+'active').set(
      false
    ).then((snapshot) => {
      notification.success('¡Listo!', 'Se desactivó con exito el LIG');
    }).catch((error) => {
      console.error(error);
      notification.alert('¡Error!', 'Ocurrió un error al intentar desacrtivar el LIG');
    });
  }

}