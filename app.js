/* Banco temporário da sessão */
var DB = {
  complaints: 'vivacidade.complaints',
  orgs: 'vivacidade.orgs',
  profile: 'vivacidade.profile',
  accounts: 'vivacidade.accounts',
  user: 'vivacidade.currentUser'
};

var defaultLocation = { lat: -15.793889, lng: -47.882778 };
var complaintImage = '';
var map = null;
var markers = [];

function $(id) {
  return document.querySelector(id);
}

function all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function getData(key, defaultValue) {
  var value = sessionStorage.getItem(key);
  if (value === null) {
    sessionStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return defaultValue;
  }
}

function saveData(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
  return true;
}

function message(text) {
  var toast = $('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(window.messageTimer);
  window.messageTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}

function clean(text) {
  return String(text || '').replace(/[&<>'"]/g, function (char) {
    var symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return symbols[char];
  });
}

function statusName(status) {
  if (status === 'em_andamento') return 'Em andamento';
  if (status === 'resolvido') return 'Resolvido';
  return 'Em análise';
}

function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

var imageFallbacks = {
  buraco_na_rua: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
  lixo_acumulado: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80',
  iluminacao_publica: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80'
};

var defaultComplaints = [
  { id: 1, code: '#001', title: 'Buraco profundo na faixa direita', category: 'buraco_na_rua', severity: 'alta', status: 'em_andamento', address: 'Rua das Flores, 120', neighborhood: 'Jardim das Palmeiras', cityState: 'São Paulo - SP', latitude: -23.55152, longitude: -46.634308, description: 'Buraco danificando pneus de veículos e motocicletas.', reporterName: 'Mariana Souza', supportCount: 14, imageUrl: imageFallbacks.buraco_na_rua, createdAt: '2026-09-17' },
  { id: 2, code: '#002', title: 'Lixo e entulho na calçada', category: 'lixo_acumulado', severity: 'media', status: 'em_analise', address: 'Avenida Brasil, 850', neighborhood: 'Centro Cívico', cityState: 'São Paulo - SP', latitude: -23.5489, longitude: -46.6382, description: 'Grande volume de lixo descartado em calçada pública.', reporterName: 'Carlos Eduardo', supportCount: 8, imageUrl: imageFallbacks.lixo_acumulado, createdAt: '2026-09-16' },
  { id: 3, code: '#003', title: 'Poste com luminária apagada', category: 'iluminacao_publica', severity: 'baixa', status: 'resolvido', address: 'Rua Central, 310', neighborhood: 'Vila Mariana', cityState: 'São Paulo - SP', latitude: -23.5561, longitude: -46.6298, description: 'Trecho escuro durante a noite próximo a ponto de ônibus.', reporterName: 'Fernanda Lima', supportCount: 22, imageUrl: imageFallbacks.iluminacao_publica, createdAt: '2026-09-15' }
];

var defaultOrgs = [
  { id: 1, name: 'EcoAção Urbana', category: 'Meio Ambiente', tagline: 'Gestão de resíduos e mutirões de limpeza.', focusAreas: 'Reciclagem comunitária e revitalização de praças.', activeVolunteers: 45, imageUrl: imageFallbacks.lixo_acumulado },
  { id: 2, name: 'Cidade Verde Coletivo', category: 'Urbanismo', tagline: 'Mapeamento arbóreo e preservação de praças.', focusAreas: 'Plantio de mudas e canteiros.', activeVolunteers: 62, imageUrl: imageFallbacks.iluminacao_publica }
];

function getComplaints() { return getData(DB.complaints, defaultComplaints); }
function getOrgs() { return getData(DB.orgs, defaultOrgs); }
function getProfile() { return getData(DB.profile, { name: 'Cidadão Participativo', email: 'cidadao@cidade.sp.gov.br', neighborhood: 'Vila Mariana, São Paulo', notifications: true, avatarUrl: '' }); }

function complaintCard(item, list) {
  var image = item.imageUrl ? '<img src="' + clean(item.imageUrl) + '" alt="Imagem da denúncia">' : '';
  var buttons = '';
  if (list) {
    buttons = '<div class="card-actions"><span class="meta">♨ ' + (item.supportCount || 0) + ' apoios</span>' +
      '<button class="button outline support" data-id="' + item.id + '">Apoiar</button>' +
      '<select class="status-edit" data-id="' + item.id + '"><option value="em_analise" ' + (item.status === 'em_analise' ? 'selected' : '') + '>Em análise</option><option value="em_andamento" ' + (item.status === 'em_andamento' ? 'selected' : '') + '>Em andamento</option><option value="resolvido" ' + (item.status === 'resolvido' ? 'selected' : '') + '>Resolvido</option></select>' +
      '<button class="button danger delete" data-id="' + item.id + '">Excluir</button></div>';
  }
  return '<article class="complaint-card ' + (list ? 'list' : '') + '">' + image + '<div><div class="card-top"><span class="code">' + clean(item.code) + '</span><span class="badge status-' + clean(item.status) + '">' + statusName(item.status) + '</span></div><h3>' + clean(item.title) + '</h3><p>' + clean(item.description) + '</p><div class="meta">⌖ ' + clean(item.address) + ' • ' + clean(item.neighborhood) + '</div><div class="meta">' + clean(item.cityState) + ' · Gravidade: ' + clean(item.severity) + '</div></div>' + buttons + '</article>';
}

function renderHome() {
  var data = getComplaints();
  var count = function (value) { return data.filter(function (item) { return item.status === value; }).length; };
  $('#stats').innerHTML = '<div class="stat"><small>Total registrado</small><strong>' + data.length + '</strong><span>Demandas comunitárias</span></div><div class="stat"><small>Em andamento</small><strong>' + count('em_andamento') + '</strong><span>Equipes acionadas</span></div><div class="stat"><small>Resolvidos</small><strong>' + count('resolvido') + '</strong><span>Melhorias entregues</span></div><div class="stat"><small>Aguardando triagem</small><strong>' + count('em_analise') + '</strong><span>Em conferência</span></div>';
  data.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  $('#recentComplaints').innerHTML = data.slice(0, 3).map(function (item) { return complaintCard(item, false); }).join('');
}

function renderComplaints() {
  var search = ($('#search').value || '').toLowerCase();
  var status = $('#statusFilter').value;
  var category = $('#categoryFilter').value;
  var data = getComplaints().filter(function (item) {
    var text = (item.code + ' ' + item.title + ' ' + item.address + ' ' + item.description).toLowerCase();
    return (!search || text.indexOf(search) >= 0) && (!status || item.status === status) && (!category || item.category === category);
  });
  $('#complaintsList').innerHTML = data.length ? data.map(function (item) { return complaintCard(item, true); }).join('') : '<div class="panel empty">Nenhuma ocorrência encontrada.</div>';
  bindComplaintButtons();
}

function bindComplaintButtons() {
  all('.support').forEach(function (button) {
    button.onclick = function () {
      var data = getComplaints();
      var item = data.find(function (value) { return value.id == button.dataset.id; });
      if (!item) return;
      item.supportCount = (item.supportCount || 0) + 1;
      saveData(DB.complaints, data);
      renderComplaints();
      renderHome();
      message('Apoio salvo.');
    };
  });
  all('.status-edit').forEach(function (select) {
    select.onchange = function () {
      var data = getComplaints();
      var item = data.find(function (value) { return value.id == select.dataset.id; });
      if (!item) return;
      item.status = select.value;
      saveData(DB.complaints, data);
      renderComplaints();
      renderHome();
      message('Status atualizado.');
    };
  });
  all('.delete').forEach(function (button) {
    button.onclick = function () {
      var data = getComplaints();
      var item = data.find(function (value) { return value.id == button.dataset.id; });
      if (!item || !confirm('Excluir a denúncia ' + item.code + '?')) return;
      saveData(DB.complaints, data.filter(function (value) { return value.id !== item.id; }));
      renderComplaints();
      renderHome();
      message('Denúncia excluída.');
    };
  });
}

function renderMap() {
  if (!window.L) {
    $('#mapStatus').textContent = 'Mapa indisponível: verifique a internet.';
    return;
  }
  if (!map) {
    map = L.map('mapCanvas').setView([defaultLocation.lat, defaultLocation.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  }
  markers.forEach(function (marker) { marker.remove(); });
  markers = [];
  var data = getComplaints();
  data.forEach(function (item) {
    var lat = Number(item.latitude) || defaultLocation.lat;
    var lng = Number(item.longitude) || defaultLocation.lng;
    var marker = L.marker([lat, lng]).addTo(map).bindPopup('<b>' + clean(item.code) + ' — ' + clean(item.title) + '</b><br>' + clean(item.address));
    marker.on('click', function () { showMapDetails(item); });
    markers.push(marker);
  });
  if (markers.length > 1) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));
  if (markers.length === 1) map.setView(markers[0].getLatLng(), 15);
  $('#mapStatus').textContent = markers.length + ' ocorrência(s) localizada(s) no mapa';
  $('#mapCards').innerHTML = data.map(function (item) { return '<button class="complaint-card" data-map-id="' + item.id + '"><span class="code">' + clean(item.code) + '</span><h3>' + clean(item.title) + '</h3><p>⌖ ' + clean(item.address) + '</p></button>'; }).join('');
  all('[data-map-id]').forEach(function (button) {
    button.onclick = function () { showMapDetails(data.find(function (item) { return item.id == button.dataset.mapId; })); };
  });
  setTimeout(function () { map.invalidateSize(); }, 150);
}

function showMapDetails(item) {
  if (!item) return;
  if (map) map.setView([Number(item.latitude), Number(item.longitude)], 17);
  $('#mapDetails').className = 'panel';
  $('#mapDetails').innerHTML = '<span class="code">' + clean(item.code) + '</span><h2>' + clean(item.title) + '</h2><p>' + clean(item.description) + '</p><p><b>Endereço:</b> ' + clean(item.address) + ', ' + clean(item.neighborhood) + '</p><p><b>Cidade:</b> ' + clean(item.cityState) + '</p><p><b>Status:</b> ' + statusName(item.status) + '</p><button class="button primary" id="detailSupport">Apoiar ocorrência</button>';
  $('#detailSupport').onclick = function () {
    var data = getComplaints();
    var saved = data.find(function (value) { return value.id === item.id; });
    saved.supportCount = (saved.supportCount || 0) + 1;
    saveData(DB.complaints, data);
    renderMap();
    message('Apoio salvo.');
  };
}

function renderProfile() {
  var data = getProfile();
  $('#profileName').value = data.name;
  $('#profileEmail').value = data.email;
  $('#profileNeighborhood').value = data.neighborhood;
  $('#notifications').checked = !!data.notifications;
  $('#profileSummary').textContent = data.name;
  $('#profileSummaryEmail').textContent = data.email;
  $('#profileCount').textContent = getComplaints().length;
  $('#avatarPreview').innerHTML = data.avatarUrl ? '<img src="' + clean(data.avatarUrl) + '" alt="Avatar">' : '♙';
}

function renderOrgs() {
  var data = getOrgs();
  $('#orgList').innerHTML = data.map(function (item) {
    var image = item.imageUrl ? '<img src="' + clean(item.imageUrl) + '" alt="Imagem de ' + clean(item.name) + '">' : '';
    return '<article class="org-card">' + image + '<span class="eyebrow muted">' + clean(item.category) + '</span><h3>' + clean(item.name) + '</h3><p>' + clean(item.tagline) + '</p><p>' + clean(item.focusAreas) + '</p><div class="meta">♧ ' + item.activeVolunteers + ' voluntários ativos</div><button class="button danger delete-org" data-id="' + item.id + '">Excluir</button></article>';
  }).join('');
  all('.delete-org').forEach(function (button) {
    button.onclick = function () {
      var item = data.find(function (value) { return value.id == button.dataset.id; });
      if (!item || !confirm('Excluir ' + item.name + '?')) return;
      saveData(DB.orgs, data.filter(function (value) { return value.id !== item.id; }));
      renderOrgs();
      message('ONG excluída.');
    };
  });
}

function readImage(file) {
  return new Promise(function (resolve, reject) {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Selecione uma imagem válida.'));
    if (file.size > 5 * 1024 * 1024) return reject(new Error('A imagem deve ter no máximo 5 MB.'));
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error('Não foi possível ler a imagem.')); };
    reader.readAsDataURL(file);
  });
}

function getGps() {
  return new Promise(function (resolve, reject) {
    if (!navigator.geolocation) return reject(new Error('GPS não disponível.'));
    navigator.geolocation.getCurrentPosition(function (position) { resolve(position.coords); }, function () { reject(new Error('Permita o acesso ao GPS.')); }, { timeout: 10000 });
  });
}

async function locateAddress(address, neighborhood, cityState) {
  var queryBase = [address, neighborhood, cityState, 'Brasil'].filter(Boolean).join(', ');
  var queries = [
    queryBase,
    [address, cityState, 'Brasil'].filter(Boolean).join(', '),
    [neighborhood, cityState, 'Brasil'].filter(Boolean).join(', ')
  ];

  for (var i = 0; i < queries.length; i++) {
    try {
      var photon = await fetch('https://photon.komoot.io/api/?limit=5&q=' + encodeURIComponent(queries[i]), { headers: { 'Accept': 'application/json' } });
      var photonData = await photon.json();
      for (var p = 0; p < (photonData.features || []).length; p++) {
        var feature = photonData.features[p];
        if (feature && feature.geometry) {
          return { lat: Number(feature.geometry.coordinates[1]), lng: Number(feature.geometry.coordinates[0]) };
        }
      }
    } catch (error) {}

    try {
      var osm = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=br&q=' + encodeURIComponent(queries[i]), { headers: { 'Accept-Language': 'pt-BR' } });
      var osmData = await osm.json();
      if (osmData.length) return { lat: Number(osmData[0].lat), lng: Number(osmData[0].lon) };
    } catch (error) {}
  }
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    var response = await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lng), { headers: { 'Accept-Language': 'pt-BR' } });
    var data = await response.json();
    var result = data.address || {};
    var road = result.road || result.pedestrian || result.suburb || '';
    var houseNumber = result.house_number || '';
    var neighborhood = result.suburb || result.neighbourhood || result.district || '';
    var city = result.city || result.town || result.municipality || result.village || '';
    var state = result.state || '';
    if (road) $('#address').value = (road + (houseNumber ? ', ' + houseNumber : '')).trim();
    if (neighborhood) $('#neighborhood').value = neighborhood;
    if (city) $('#cityState').value = city + (state ? ' - ' + state : '');
  } catch (error) {
    // As coordenadas continuam válidas mesmo quando o endereço não puder ser resolvido.
  }
}

function setupForms() {
  $('#loginForm').onsubmit = function (event) {
    event.preventDefault();
    var email = $('#loginEmail').value.trim().toLowerCase();
    var password = btoa($('#loginPassword').value);
    var accounts = getData(DB.accounts, {});
    if (accounts[email] && accounts[email] !== password) return message('Senha incorreta.');
    accounts[email] = password;
    saveData(DB.accounts, accounts);
    saveData(DB.user, { email: email });
    var data = getProfile();
    data.email = email;
    saveData(DB.profile, data);
    message('Login salvo nesta sessão.');
    location.hash = 'perfil';
  };

  $('#complaintImage').onchange = async function (event) {
    try {
      complaintImage = await readImage(event.target.files[0]);
      $('#imageName').textContent = event.target.files[0].name;
    } catch (error) {
      complaintImage = '';
      event.target.value = '';
      message(error.message);
    }
  };

  $('#useGps').onclick = async function () {
    try {
      var coords = await getGps();
      setComplaintLocation(coords.latitude, coords.longitude, true);
      initializeLocationPicker(coords.latitude, coords.longitude);
      $('#locationPickerWrap').hidden = false;
      message('Localização GPS encontrada.');
    } catch (error) { message(error.message); }
  };

  $('#openLocationPicker').onclick = function () {
    var form = $('#complaintForm');
    var lat = Number(form.dataset.lat);
    var lng = Number(form.dataset.lng);
    $('#locationPickerWrap').hidden = false;
    initializeLocationPicker(lat, lng);
  };

  $('#searchLocation').onclick = async function () {
    var query = $('#locationSearch').value.trim();
    if (!query) return message('Digite o endereço que deseja encontrar.');
    try {
      var address = await locateAddress(query, '', 'Brasil');
      if (!address) throw new Error('Local não encontrado. Tente incluir cidade e estado.');
      initializeLocationPicker(address.lat, address.lng);
      setComplaintLocation(address.lat, address.lng, true);
      $('#locationPickerWrap').hidden = false;
      message('Local encontrado no mapa.');
    } catch (error) {
      message(error.message);
    }
  };

  $('#locationSearch').onkeydown = function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      $('#searchLocation').click();
    }
  };

  $('#complaintForm').onsubmit = async function (event) {
    event.preventDefault();
    var form = event.target;
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Localizando endereço...';
    try {
      var address = $('#address').value.trim();
      var neighborhood = $('#neighborhood').value.trim();
      var cityState = $('#cityState').value.trim();
      var lat = Number(form.dataset.lat);
      var lng = Number(form.dataset.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        var point = await locateAddress(address, neighborhood, cityState);
        if (!point) throw new Error('Endereço não encontrado. Informe cidade e estado ou use o GPS.');
        lat = point.lat;
        lng = point.lng;
      }
      var id = Date.now();
      var data = getComplaints();
      data.unshift({ id: id, code: '#' + String(id).slice(-6), title: $('#title').value.trim(), category: $('#category').value, severity: $('#severity').value, status: 'em_analise', address: address, neighborhood: neighborhood, cityState: cityState, latitude: lat, longitude: lng, description: $('#description').value.trim(), reporterName: $('#reporterName').value.trim() || 'Cidadão', reporterEmail: $('#reporterEmail').value.trim(), supportCount: 1, imageUrl: complaintImage, createdAt: new Date().toISOString() });
      saveData(DB.complaints, data);
      form.reset();
      form.dataset.lat = '';
      form.dataset.lng = '';
      complaintImage = '';
      $('#reporterName').value = 'Morador Local';
      $('#reporterEmail').value = 'morador@cidade.org';
      $('#neighborhood').value = 'Jardim Central';
      $('#cityState').value = 'São Paulo - SP';
      $('#coordinates').textContent = 'Nenhuma localização selecionada';
      $('#locationSearch').value = '';
      $('#locationPickerWrap').hidden = true;
      $('#imageName').textContent = 'Nenhuma imagem selecionada';
      message('Denúncia salva no banco da sessão.');
      location.hash = 'denuncias';
    } catch (error) {
      message(error.message);
    }
    button.disabled = false;
    button.textContent = '✓ Salvar denúncia';
  };

  $('#profileForm').onsubmit = function (event) {
    event.preventDefault();
    var data = getProfile();
    data.name = $('#profileName').value.trim();
    data.email = $('#profileEmail').value.trim();
    data.neighborhood = $('#profileNeighborhood').value.trim();
    data.notifications = $('#notifications').checked;
    saveData(DB.profile, data);
    renderProfile();
    message('Perfil salvo.');
  };

  $('#avatarImage').onchange = async function (event) {
    try {
      var data = getProfile();
      data.avatarUrl = await readImage(event.target.files[0]);
      saveData(DB.profile, data);
      renderProfile();
      message('Foto salva.');
    } catch (error) { message(error.message); }
  };

  $('#showOrgForm').onclick = function () { $('#orgForm').hidden = false; };
  $('#cancelOrg').onclick = function () { $('#orgForm').reset(); $('#orgForm').hidden = true; };
  $('#orgImage').onchange = function (event) { $('#orgImageName').textContent = event.target.files[0] ? event.target.files[0].name : 'Nenhuma imagem selecionada'; };
  $('#orgForm').onsubmit = async function (event) {
    event.preventDefault();
    try {
      var file = $('#orgImage').files[0];
      var data = getOrgs();
      var image = file ? await readImage(file) : '';
      data.unshift({ id: Date.now(), name: $('#orgName').value.trim(), category: $('#orgCategory').value.trim(), tagline: $('#orgTagline').value.trim(), focusAreas: $('#orgFocus').value.trim(), activeVolunteers: 10, imageUrl: image });
      saveData(DB.orgs, data);
      event.target.reset();
      event.target.hidden = true;
      renderOrgs();
      message('ONG salva.');
    } catch (error) { message(error.message); }
  };
}

var locationPickerMap = null;
var locationPickerMarker = null;

function setComplaintLocation(lat, lng, showReverseAddress) {
  var form = $('#complaintForm');
  form.dataset.lat = String(lat);
  form.dataset.lng = String(lng);
  $('#coordinates').textContent = 'Localização: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
  if (showReverseAddress) reverseGeocode(lat, lng);
}

function initializeLocationPicker(initialLat, initialLng) {
  if (!window.L) {
    message('O mapa não está disponível. Verifique sua conexão.');
    return;
  }

  var lat = Number(initialLat);
  var lng = Number(initialLng);
  var hasInitialLocation = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
  if (!hasInitialLocation) {
    lat = defaultLocation.lat;
    lng = defaultLocation.lng;
  }

  if (!locationPickerMap) {
    locationPickerMap = L.map('locationPickerMap').setView([lat, lng], Number.isFinite(initialLat) ? 16 : 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(locationPickerMap);
  } else {
    locationPickerMap.setView([lat, lng], 16);
  }

  if (locationPickerMarker) locationPickerMarker.remove();
  locationPickerMarker = L.marker([lat, lng], { draggable: true }).addTo(locationPickerMap);
  locationPickerMarker.on('dragend', function (event) {
    var point = event.target.getLatLng();
    setComplaintLocation(point.lat, point.lng, true);
  });
  locationPickerMap.on('click', function (event) {
    locationPickerMarker.setLatLng(event.latlng);
    setComplaintLocation(event.latlng.lat, event.latlng.lng, true);
  });

  setTimeout(function () { locationPickerMap.invalidateSize(); }, 100);
}

function route() {
  var view = (location.hash.substring(1) || 'inicio').split('?')[0];
  all('.view').forEach(function (element) { element.hidden = element.dataset.view !== view; });
  if (view === 'inicio') renderHome();
  if (view === 'denuncias') renderComplaints();
  if (view === 'mapa') renderMap();
  if (view === 'perfil') renderProfile();
  if (view === 'colaboradores') renderOrgs();
  $('#mainNav').classList.remove('open');
  window.scrollTo(0, 0);
}

$('#search').oninput = renderComplaints;
$('#statusFilter').onchange = renderComplaints;
$('#categoryFilter').onchange = renderComplaints;
$('#menuToggle').onclick = function () { $('#mainNav').classList.toggle('open'); };
$('#mapGps').onclick = async function () {
  try {
    if (!map) renderMap();
    var coords = await getGps();
    map.setView([coords.latitude, coords.longitude], 15);
    message('Mapa centralizado no GPS.');
  } catch (error) { message(error.message); }
};

setupForms();
window.addEventListener('hashchange', route);
route();
