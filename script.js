document.addEventListener('DOMContentLoaded', function () {
  
  const navHome = document.getElementById('nav-home');
  const navMaps = document.getElementById('nav-maps');
  const navAbout = document.getElementById('nav-about'); 
  const allNavItems = document.querySelectorAll('.nav-item');
  
  const homeContent = document.getElementById('home-content');
  const mapContent = document.getElementById('map-content');
  const aboutContent = document.getElementById('about-content'); 
  const ctaButton = document.querySelector('.cta-button');
  
  let map;
  let mapInitialized = false;

  function showHome() {
    homeContent.classList.remove('hidden');
    mapContent.classList.add('hidden');
    aboutContent.classList.add('hidden');
    allNavItems.forEach(item => item.classList.remove('active'));
    navHome.classList.add('active');
  }

  function showMaps() {
    homeContent.classList.add('hidden');
    aboutContent.classList.add('hidden');
    mapContent.classList.remove('hidden');
    allNavItems.forEach(item => item.classList.remove('active'));
    navMaps.classList.add('active');
    if (!mapInitialized) {
      initializeMap();
      mapInitialized = true;
    } else {
      setTimeout(() => map.invalidateSize(), 10);
    }
  }

  function showAbout() {
    homeContent.classList.add('hidden');
    mapContent.classList.add('hidden');
    aboutContent.classList.remove('hidden');
    allNavItems.forEach(item => item.classList.remove('active'));
    navAbout.classList.add('active');
  }

  navHome.addEventListener('click', showHome);
  navMaps.addEventListener('click', showMaps);
  navAbout.addEventListener('click', showAbout); 
  ctaButton.addEventListener('click', showMaps);

  function initializeMap() {
    let universityFeatures = []; // Variabel untuk menyimpan data GeoJSON features

    map = L.map('map').setView([-7.78, 110.38], 12);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });
    const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
    });
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
    });
    
    osm.addTo(map);

    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    
    const markerLayer = L.layerGroup().addTo(map);
    const universitySelect = document.getElementById('university-select');
    const typeFilterSelect = document.getElementById('type-filter-select');
    const bufferSlider = document.getElementById('buffer-slider');
    const bufferValue = document.getElementById('buffer-value');
    const routeButton = document.getElementById('route-button');
    const infoContainer = document.getElementById('university-info');
    const infoPhoto = document.getElementById('info-photo');
    const infoAddress = document.getElementById('info-address');
    const infoTelp = document.getElementById('info-telp');
    const infoWebsite = document.getElementById('info-website');
    const infoDeskripsi = document.getElementById('info-deskripsi');
    
    const geojsonControlPanel = document.getElementById('geojson-control-panel');
    const geojsonOpacitySlider = document.getElementById('geojson-opacity-slider');
    const geojsonOpacityValue = document.getElementById('geojson-opacity-value');
    const geojsonColorSlider = document.getElementById('geojson-color-slider');
    
    const baseMaps = {
        "Default": osm,
        "Satelit": satellite,
        "Mode Gelap": dark,
        "Topografi": topo
    };
    const overlayMaps = {
        "Tanda Kampus": markerLayer
    };

    let jogjaLayer;
    let layersControl;

    function updateLayersControl() {
        if (layersControl) {
            map.removeControl(layersControl);
        }
        layersControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
    }
    
    updateLayersControl();

    fetch('peta/jogjakarta.geojson')
      .then(response => response.json())
      .then(data => {
          jogjaLayer = L.geoJSON(data, {
              style: () => {
                  const hue = geojsonColorSlider.value;
                  const initialColor = `hsl(${hue}, 100%, 50%)`;
                  return {
                      color: initialColor,
                      weight: 2,
                      opacity: 1,
                      fillColor: initialColor,
                      fillOpacity: parseFloat(geojsonOpacitySlider.value)
                  };
              }
          });
          overlayMaps["Batas Administrasi DIY"] = jogjaLayer;
          updateLayersControl();
          const overlayLabels = document.querySelectorAll('.leaflet-control-layers-overlays label');
          overlayLabels.forEach(label => {
              if (label.textContent.includes('Batas Administrasi DIY')) {
                  label.appendChild(geojsonControlPanel);
              }
          });
      })
      .catch(err => console.error("Gagal memuat GeoJSON Batas Administrasi:", err));

    map.on('overlayadd', e => {
        if (e.layer === jogjaLayer) { geojsonControlPanel.classList.remove('hidden'); }
    });
    map.on('overlayremove', e => {
        if (e.layer === jogjaLayer) { geojsonControlPanel.classList.add('hidden'); }
    });
    geojsonOpacitySlider.addEventListener('input', function() {
        if (jogjaLayer) {
            const newOpacity = parseFloat(this.value);
            jogjaLayer.setStyle({ fillOpacity: newOpacity });
            geojsonOpacityValue.textContent = newOpacity.toFixed(1);
        }
    });
    geojsonColorSlider.addEventListener('input', function() {
        if (jogjaLayer) {
            const hue = this.value;
            const newColor = `hsl(${hue}, 100%, 50%)`;
            jogjaLayer.setStyle({ color: newColor, fillColor: newColor });
        }
    });

    let selectedUniversity = null;
    let bufferCircle = null;
    let routingControl = null;

    function displayUniversityInfo(uniFeature) {
        const props = uniFeature.properties;
        infoPhoto.src = props.foto || '';
        infoAddress.textContent = props.alamat || 'Tidak tersedia';
        infoTelp.textContent = props.telp || 'Tidak tersedia';
        infoWebsite.href = props.website ? `http://${props.website}` : '#';
        infoWebsite.textContent = props.website || 'Tidak tersedia';
        infoDeskripsi.textContent = props.Deskripsi || 'Tidak ada deskripsi.';
        infoContainer.classList.remove('hidden');
    }

    function updateBuffer() {
      if (bufferCircle) { map.removeLayer(bufferCircle); bufferCircle = null; }
      const radiusInKm = parseFloat(bufferSlider.value);
      bufferValue.textContent = `${radiusInKm.toFixed(1)} km`;
      if (selectedUniversity && radiusInKm > 0) {
        // Ingat: GeoJSON [longitude, latitude], Leaflet [latitude, longitude]
        const coords = L.latLng(selectedUniversity.geometry.coordinates[1], selectedUniversity.geometry.coordinates[0]);
        bufferCircle = L.circle(coords, {
          radius: radiusInKm * 1000, color: '#3388ff', fillColor: '#3388ff', fillOpacity: 0.2
        }).addTo(map);
      }
    }

    function populateDropdown(universities) {
      universitySelect.innerHTML = '<option value="">--Pilih Perguruan Tinggi--</option>';
      universities.forEach((uniFeature, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = uniFeature.properties.name;
        universitySelect.appendChild(option);
      });
    }

    function clearAllFeatures() {
      markerLayer.clearLayers();
      if (bufferCircle) map.removeLayer(bufferCircle);
      if (routingControl) map.removeControl(routingControl);
      selectedUniversity = null;
      bufferCircle = null;
      routingControl = null;
      bufferSlider.value = 0;
      bufferValue.textContent = '0 km';
      infoContainer.classList.add('hidden');
      routeButton.textContent = 'Tampilkan Rute Tercepat';
    }

    function applyFilters() {
      clearAllFeatures();
      const selectedType = typeFilterSelect.value;
      const filteredData = (selectedType === 'all')
        ? universityFeatures
        : universityFeatures.filter(feature => feature.properties.status.toLowerCase() === selectedType);
      
      populateDropdown(filteredData);
    }
    
    universitySelect.addEventListener('change', function() {
      clearAllFeatures();
      const selectedIndex = this.value;
      if (selectedIndex !== '') { 
        const selectedType = typeFilterSelect.value;
        const currentList = (selectedType === 'all') 
            ? universityFeatures 
            : universityFeatures.filter(f => f.properties.status.toLowerCase() === selectedType);
        
        selectedUniversity = currentList[selectedIndex];
        
        if (selectedUniversity) {
          const props = selectedUniversity.properties;
          // Ingat: GeoJSON [longitude, latitude], Leaflet [latitude, longitude]
          const coords = L.latLng(selectedUniversity.geometry.coordinates[1], selectedUniversity.geometry.coordinates[0]);
          const marker = L.marker(coords)
            .addTo(markerLayer)
            .bindPopup(`<b>${props.name}</b><br>${props.status}`);
          
          map.flyTo(coords, 15);
          marker.openPopup();
          updateBuffer();
          displayUniversityInfo(selectedUniversity);
        }
      }
    });

    typeFilterSelect.addEventListener('change', applyFilters);
    bufferSlider.addEventListener('input', updateBuffer);
    
    routeButton.addEventListener('click', function() {
      if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
        routeButton.textContent = 'Tampilkan Rute Tercepat';
        return;
      }

      if (!selectedUniversity) {
          alert('Silakan pilih universitas terlebih dahulu!');
          return;
      }

      navigator.geolocation.getCurrentPosition(function(position) {
          const userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
          const destination = L.latLng(selectedUniversity.geometry.coordinates[1], selectedUniversity.geometry.coordinates[0]);
          
          routingControl = L.Routing.control({
            plan: L.routing.plan([
              L.Routing.waypoint(userLocation, 'Lokasi Anda'),
              L.Routing.waypoint(destination, selectedUniversity.properties.name)
            ], {
                createMarker: function(i, waypoint, n) {
                    let markerOptions = { draggable: true, icon: greenIcon };
                    if (i === n - 1) {
                        markerOptions.draggable = false;
                        markerOptions.icon = redIcon;
                    }
                    return L.marker(waypoint.latLng, markerOptions);
                }
            }),
            router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1` }),
            show: true, 
            addWaypoints: false
          }).addTo(map);
          
          routeButton.textContent = 'Sembunyikan Rute';

      }, function() {
          alert('Tidak dapat mengakses lokasi Anda. Pastikan Anda mengizinkan akses lokasi di browser.');
      });
    });

    // --- MEMUAT DATA KAMPUS DARI GEOJSON ---
    fetch('Data/titikkampus.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        universityFeatures = data.features;
        applyFilters(); // Panggil applyFilters setelah data berhasil dimuat
      })
      .catch(err => {
        console.error("Gagal memuat atau mem-parsing GeoJSON Kampus:", err);
        alert("Gagal memuat data kampus. Silakan cek konsol untuk detailnya.");
      });
  }
});