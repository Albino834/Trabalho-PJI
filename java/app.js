const KEYS = {
  complaints: "vivacidade.complaints",
  profile: "vivacidade.profile",
  orgs: "vivacidade.orgs",
};
const imageFallbacks = {
  buraco_na_rua:
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
  lixo_acumulado:
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
  iluminacao_publica:
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
  alagamento:
    "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80",
};
const seedComplaints = [
  {
    id: 1,
    code: "#001",
    title: "Buraco profundo na faixa direita",
    category: "buraco_na_rua",
    severity: "alta",
    status: "em_andamento",
    address: "Rua das Flores, 120",
    neighborhood: "Jardim das Palmeiras",
    latitude: "-23.551520",
    longitude: "-46.634308",
    description:
      "Buraco danificando pneus de veículos e motocicletas na altura do número 120.",
    reporterName: "Mariana Souza",
    supportCount: 14,
    imageUrl: imageFallbacks.buraco_na_rua,
    createdAt: "2026-09-17T10:00:00Z",
  },
  {
    id: 2,
    code: "#002",
    title: "Lixo e entulho descartados na calçada",
    category: "lixo_acumulado",
    severity: "media",
    status: "em_analise",
    address: "Avenida Brasil, 850",
    neighborhood: "Centro Cívico",
    latitude: "-23.548900",
    longitude: "-46.638200",
    description: "Grande volume de lixo descartado em calçada pública.",
    reporterName: "Carlos Eduardo",
    supportCount: 8,
    imageUrl: imageFallbacks.lixo_acumulado,
    createdAt: "2026-09-16T10:00:00Z",
  },
  {
    id: 3,
    code: "#003",
    title: "Poste com luminária apagada",
    category: "iluminacao_publica",
    severity: "baixa",
    status: "resolvido",
    address: "Rua Central, 310",
    neighborhood: "Vila Mariana",
    latitude: "-23.556100",
    longitude: "-46.629800",
    description: "Trecho escuro durante a noite próximo a ponto de ônibus.",
    reporterName: "Fernanda Lima",
    supportCount: 22,
    imageUrl: imageFallbacks.iluminacao_publica,
    createdAt: "2026-09-15T10:00:00Z",
  },
];
const seedOrgs = [
  {
    id: 1,
    name: "EcoAção Urbana",
    category: "Meio Ambiente & Limpeza",
    tagline: "Gestão inteligente de resíduos e mutirões de limpeza.",
    focusAreas: "Reciclagem comunitária e revitalização de praças.",
    activeVolunteers: 45,
    imageUrl: imageFallbacks.lixo_acumulado,
  },
  {
    id: 2,
    name: "Cidade Verde Coletivo",
    category: "Urbanismo & Vegetação",
    tagline: "Mapeamento arbóreo e preservação de praças públicas.",
    focusAreas: "Plantio de mudas, poda preventiva e canteiros.",
    activeVolunteers: 62,
    imageUrl: imageFallbacks.iluminacao_publica,
  },
];
const defaultProfile = {
  name: "Cidadão Participativo",
  email: "cidadao@cidade.sp.gov.br",
  neighborhood: "Vila Mariana, São Paulo",
  notifications: true,
  avatarUrl: "",
};
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function complaints() {
  let data = load(KEYS.complaints, null);
  if (!data) {
    data = seedComplaints;
    save(KEYS.complaints, data);
  }
  return data;
}
function orgs() {
  let data = load(KEYS.orgs, null);
  if (!data) {
    data = seedOrgs;
    save(KEYS.orgs, data);
  }
  return data;
}
function profile() {
  let data = load(KEYS.profile, null);
  if (!data) {
    data = defaultProfile;
    save(KEYS.profile, data);
  }
  return data;
}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}
function esc(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}
function statusLabel(status) {
  return status === "em_andamento"
    ? "Em andamento"
    : status === "resolvido"
      ? "Resolvido"
      : "Em análise";
}
function categoryLabel(c) {
  return (
    {
      buraco_na_rua: "Buraco na rua",
      lixo_acumulado: "Lixo acumulado",
      iluminacao_publica: "Iluminação pública",
      alagamento: "Alagamento",
      calcada_danificada: "Calçada danificada",
      outro: "Outro problema",
    }[c] || c
  );
}
function complaintCard(c, list = false) {
  return `<article class="complaint-card ${list ? "list" : ""}">${c.imageUrl ? `<img src="${esc(c.imageUrl)}" alt="Imagem de ${esc(c.title)}">` : ""}<div><div class="card-top"><span class="code">${esc(c.code)}</span><span class="badge status-${esc(c.status)}">${statusLabel(c.status)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><div class="meta-row"><span>⌖ ${esc(c.address)} • ${esc(c.neighborhood || "")}</span><span>Gravidade: <b>${esc(c.severity)}</b></span></div><div class="meta-row"><span>Registrado por <b>${esc(c.reporterName || "Cidadão Anônimo")}</b></span><span>${new Date(c.createdAt).toLocaleDateString("pt-BR")}</span></div></div>${list ? `<div class="card-actions"><span class="meta-row">♨ ${c.supportCount || 0} apoios</span><button class="button button-outline support" data-id="${c.id}">Apoiar</button><select class="status-edit" data-id="${c.id}"><option value="em_analise" ${c.status === "em_analise" ? "selected" : ""}>Em análise</option><option value="em_andamento" ${c.status === "em_andamento" ? "selected" : ""}>Em andamento</option><option value="resolvido" ${c.status === "resolvido" ? "selected" : ""}>Resolvido</option></select></div>` : ""}</article>`;
}
function renderHome() {
  const data = complaints();
  const counts = {
    all: data.length,
    andamento: data.filter((c) => c.status === "em_andamento").length,
    resolvido: data.filter((c) => c.status === "resolvido").length,
    analise: data.filter((c) => c.status === "em_analise").length,
  };
  $("#stats").innerHTML =
    `<div class="stat"><small>Total registrado</small><strong>${counts.all}</strong><span>Demandas comunitárias</span></div><div class="stat"><small>Em andamento</small><strong>${counts.andamento}</strong><span>Equipes acionadas</span></div><div class="stat"><small>Resolvidos</small><strong>${counts.resolvido}</strong><span>Melhorias entregues</span></div><div class="stat"><small>Aguardando triagem</small><strong>${counts.analise}</strong><span>Em conferência</span></div>`;
  $("#recentComplaints").innerHTML = data
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map((c) => complaintCard(c))
    .join("");
}
function renderComplaints() {
  let data = complaints();
  const search = ($("#search")?.value || "").toLowerCase();
  const status = $("#statusFilter")?.value || "";
  const category = $("#categoryFilter")?.value || "";
  data = data.filter(
    (c) =>
      (!search ||
        `${c.code} ${c.title} ${c.address} ${c.description}`
          .toLowerCase()
          .includes(search)) &&
      (!status || c.status === status) &&
      (!category || c.category === category),
  );
  $("#complaintsList").innerHTML = data.length
    ? data.map((c) => complaintCard(c, true)).join("")
    : '<div class="panel empty-state">Nenhuma ocorrência encontrada com esses filtros.</div>';
  $$(".support").forEach(
    (btn) =>
      (btn.onclick = () => {
        const item = complaints().find((c) => c.id == btn.dataset.id);
        if (item) {
          item.supportCount = (item.supportCount || 0) + 1;
          save(KEYS.complaints, complaints());
          renderComplaints();
          toast("Apoio registrado e salvo.");
        }
      }),
  );
  $$(".status-edit").forEach(
    (select) =>
      (select.onchange = () => {
        const item = complaints().find((c) => c.id == select.dataset.id);
        if (item) {
          item.status = select.value;
          save(KEYS.complaints, complaints());
          renderComplaints();
          toast("Status atualizado no banco local.");
        }
      }),
  );
}
function updateMap(lat = -23.55052, lng = -46.633308) {
  const delta = 0.035;
  $("#mapFrame").src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  $("#mapStatus").textContent =
    `Mapa centrado em ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}
function renderMap() {
  const data = complaints();
  $("#mapCards").innerHTML = data
    .map(
      (c) =>
        `<button class="complaint-card" data-map-id="${c.id}"><span class="code">${esc(c.code)}</span><h3>${esc(c.title)}</h3><p>⌖ ${esc(c.address)}</p></button>`,
    )
    .join("");
  $$("[data-map-id]").forEach(
    (card) =>
      (card.onclick = () => {
        const c = data.find((x) => x.id == card.dataset.mapId);
        if (!c) return;
        updateMap(Number(c.latitude), Number(c.longitude));
        $("#mapDetails").innerHTML =
          `${c.imageUrl ? `<img src="${esc(c.imageUrl)}" alt="" class="detail-image">` : ""}<span class="code">${esc(c.code)}</span><h2>${esc(c.title)}</h2><p>${esc(c.description)}</p><p><b>Endereço:</b> ${esc(c.address)}, ${esc(c.neighborhood || "")}</p><p><b>Status:</b> ${statusLabel(c.status)}</p><button class="button button-primary support" data-id="${c.id}">Apoiar ocorrência</button>`;
        $("#mapDetails .support").onclick = () => {
          c.supportCount = (c.supportCount || 0) + 1;
          save(KEYS.complaints, data);
          toast("Apoio salvo no navegador.");
        };
      }),
  );
  updateMap();
}
function renderProfile() {
  const p = profile();
  $("#profileName").value = p.name;
  $("#profileEmail").value = p.email;
  $("#profileNeighborhood").value = p.neighborhood;
  $("#notifications").checked = !!p.notifications;
  $("#profileSummary").textContent = p.name;
  $("#profileSummaryEmail").textContent = p.email;
  $("#profileCount").textContent = complaints().length;
  $("#avatarPreview").innerHTML = p.avatarUrl
    ? `<img src="${esc(p.avatarUrl)}" alt="Avatar">`
    : "♙";
}
function renderOrgs() {
  const data = orgs();
  $("#orgList").innerHTML = data
    .map(
      (o) =>
        `<article class="org-card">${o.imageUrl ? `<img src="${esc(o.imageUrl)}" alt="Imagem de ${esc(o.name)}">` : ""}<span class="eyebrow muted">${esc(o.category)}</span><h3>${esc(o.name)}</h3><p>${esc(o.tagline)}</p><p>${esc(o.focusAreas)}</p><div class="meta-row">♧ ${o.activeVolunteers} voluntários ativos</div></article>`,
    )
    .join("");
}
function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/"))
      return reject(new Error("Selecione uma imagem válida."));
    if (file.size > 8 * 1024 * 1024)
      return reject(new Error("A imagem deve ter no máximo 8 MB."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}
async function geocode(address, neighborhood) {
  try {
    const query = encodeURIComponent(`${address}, ${neighborhood}, Brasil`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`,
      { headers: { Accept: "application/json" } },
    );
    const result = await response.json();
    return result[0]
      ? { lat: Number(result[0].lat), lng: Number(result[0].lon) }
      : null;
  } catch {
    return null;
  }
}
function getGps() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("GPS não disponível."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error("Permita o acesso ao GPS.")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
function setupForms() {
  ["latitude", "longitude"].forEach((id) => {
    if (!document.getElementById(id)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.id = id;
      $("#complaintForm").appendChild(input);
    }
  });
  let pendingComplaintImage = "";
  $("#complaintImage").onchange = async (e) => {
    try {
      pendingComplaintImage = await fileAsDataUrl(e.target.files[0]);
      $("#imageName").textContent = e.target.files[0].name;
    } catch (err) {
      toast(err.message);
    }
  };
  $("#useGps").onclick = async () => {
    try {
      const pos = await getGps();
      $("#latitude").value = pos.lat;
      $("#longitude").value = pos.lng;
      $("#coordinates").textContent =
        `Coordenadas GPS: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
      toast("GPS real encontrado.");
    } catch (err) {
      toast(err.message);
    }
  };
  $("#complaintForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "Salvando...";
    try {
      const address = $("#address").value.trim(),
        neighborhood = $("#neighborhood").value.trim();
      let lat = Number($("#latitude")?.value || 0),
        lng = Number($("#longitude")?.value || 0);
      if (!lat || !lng || (!pendingComplaintImage && false)) {
        const point = await geocode(address, neighborhood);
        if (point) {
          lat = point.lat;
          lng = point.lng;
        }
      }
      const data = complaints();
      const id = Date.now();
      const complaint = {
        id,
        code: `#${String(id).slice(-10)}`,
        title: $("#title").value.trim(),
        category: $("#category").value,
        severity: $("#severity").value,
        status: "em_analise",
        address,
        neighborhood,
        latitude: String(lat || -23.55052),
        longitude: String(lng || -46.633308),
        description: $("#description").value.trim(),
        reporterName: $("#reporterName").value.trim() || "Cidadão Anônimo",
        reporterEmail: $("#reporterEmail").value.trim(),
        supportCount: 1,
        imageUrl: pendingComplaintImage,
        createdAt: new Date().toISOString(),
      };
      data.unshift(complaint);
      save(KEYS.complaints, data);
      pendingComplaintImage = "";
      e.target.reset();
      $("#reporterName").value = "Morador Local";
      $("#reporterEmail").value = "morador@cidade.org";
      toast(`Denúncia ${complaint.code} salva com sucesso.`);
      location.hash = "denuncias";
    } catch (err) {
      toast(err.message || "Não foi possível salvar.");
    } finally {
      btn.disabled = false;
      btn.textContent = "✓ Salvar denúncia";
    }
  };
  $("#profileForm").onsubmit = async (e) => {
    e.preventDefault();
    const p = profile();
    p.name = $("#profileName").value.trim();
    p.email = $("#profileEmail").value.trim();
    p.neighborhood = $("#profileNeighborhood").value.trim();
    p.notifications = $("#notifications").checked;
    save(KEYS.profile, p);
    renderProfile();
    toast("Perfil salvo neste navegador.");
  };
  $("#avatarImage").onchange = async (e) => {
    try {
      const p = profile();
      p.avatarUrl = await fileAsDataUrl(e.target.files[0]);
      save(KEYS.profile, p);
      renderProfile();
      toast("Foto do perfil salva.");
    } catch (err) {
      toast(err.message);
    }
  };
  $("#orgImage").onchange = (e) => {
    const file = e.target.files[0];
    if (file) $("#orgImageName").textContent = file.name;
  };
  $("#showOrgForm").onclick = () => ($("#orgForm").hidden = false);
  $("#cancelOrg").onclick = () => ($("#orgForm").hidden = true);
  $("#orgForm").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const file = $("#orgImage").files[0];
      const imageUrl = file ? await fileAsDataUrl(file) : "";
      const data = orgs();
      data.unshift({
        id: Date.now(),
        name: $("#orgName").value.trim(),
        category: $("#orgCategory").value.trim(),
        tagline: $("#orgTagline").value.trim(),
        focusAreas: $("#orgFocus").value.trim(),
        activeVolunteers: 10,
        imageUrl,
      });
      save(KEYS.orgs, data);
      e.target.reset();
      $("#orgForm").hidden = true;
      renderOrgs();
      toast("Organização salva com sucesso.");
    } catch (err) {
      toast(err.message);
    }
  };
}
function route() {
  const view = (location.hash.replace("#", "") || "inicio").split("?")[0];
  $$(".view").forEach((el) => (el.hidden = el.dataset.view !== view));
  if (view === "inicio") renderHome();
  if (view === "denuncias") renderComplaints();
  if (view === "mapa") renderMap();
  if (view === "perfil") renderProfile();
  if (view === "colaboradores") renderOrgs();
  $("#mainNav").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("#search").oninput = () => renderComplaints();
$("#statusFilter").onchange = () => renderComplaints();
$("#categoryFilter").onchange = () => renderComplaints();
$("#mapGps").onclick = async () => {
  try {
    const p = await getGps();
    updateMap(p.lat, p.lng);
    toast("Mapa centralizado no seu GPS.");
  } catch (err) {
    toast(err.message);
  }
};
$("#menuToggle").onclick = () => $("#mainNav").classList.toggle("open");
window.addEventListener("hashchange", route);
setupForms();
route();
