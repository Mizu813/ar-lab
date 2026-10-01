const tools = {
    mikroskop: {
        name: "Mikroskop",
        model: "models/microscope.glb",
        description: "Alat untuk mengamati objek berukuran sangat kecil (mikroskopis).",
        usage: "Letakkan preparat di meja objek, atur fokus dengan pemutar makro/mikro.",
        hotspots: [
            { label: "Lensa objektif", description: "Lensa ini memperbesar bayangan preparat sebelum diteruskan ke lensa okuler.", position: "0m 5m 23m", normal: "0m 1m 0m" },
            { label: "Meja objek", description: "Tempat meletakkan preparat agar tetap stabil selama pengamatan.", position: "0m 1m 13m", normal: "0m 1m 0m" }
        ]
    },
    erlenmeyer: {
        name: "Gelas Erlenmeyer",
        model: "models/erlenmeyer.glb",
        description: "Wadah untuk mencampur, memanaskan, atau menyimpan larutan kimia.",
        usage: "Pegang pada bagian leher saat mengocok larutan agar tidak tumpah.",
        hotspots: [
            { label: "Leher gelas", description: "Bagian ini membantu menuang larutan dengan lebih terarah dan aman.", position: "0m 14m 0m", normal: "0m 1m 0m" },
            { label: "Badan gelas", description: "Badan berbentuk kerucut membantu pencampuran dan mengurangi risiko cipratan.", position: "0m 3m 0m", normal: "0m 1m 0m" }
        ]
    },
    bunsen: {
        name: "Pembakar Bunsen",
        model: "models/bunsen_burner.glb",
        description: "Alat untuk memanaskan atau mensterilkan bahan di laboratorium.",
        usage: "Nyalakan korek api, buka katup gas, dan nyalakan. Atur nyala api.",
        hotspots: [
            { label: "Tabung pembakar", description: "Tabung mengarahkan campuran gas dan udara menuju bagian api.", position: "0.04m 0.12m 0m", normal: "0m 1m 0m" },
            { label: "Pengatur udara", description: "Putar bagian ini untuk mengatur banyaknya udara dan karakter nyala api.", position: "0.04m 0.04m 0m", normal: "0m 1m 0m" }
        ]
    },
    mortar: {
        name: "Mortar dan Alu",
        model: "models/mortar.glb",
        description: "Alat untuk menghaluskan atau menumbuk bahan kimia/sampel.",
        usage: "Masukkan bahan ke mortar, lalu tumbuk dan gerus menggunakan alu.",
        hotspots: [
            { label: "Mortar", description: "Wadah tempat bahan diletakkan dan dihaluskan.", position: "0m 0.18m 0m", normal: "0m 1m 0m" },
            { label: "Alu", description: "Digunakan untuk menumbuk dan menggerus bahan di dalam mortar.", position: "0m 0.42m 0m", normal: "0m 1m 0m" }
        ]
    },
    inkubator: {
        name: "Inkubator",
        model: "models/incubator.glb",
        description: "Alat untuk menjaga suhu optimal pertumbuhan kultur mikroba/sel.",
        usage: "Atur suhu yang diinginkan, masukkan kultur, dan tutup pintu rapat.",
        hotspots: [
            { label: "Ruang inkubasi", description: "Ruang tertutup untuk menjaga kultur pada suhu yang stabil.", position: "0m 0.48m 0m", normal: "0m 1m 0m" },
            { label: "Panel pengatur", description: "Panel digunakan untuk mengatur dan memantau suhu inkubasi.", position: "0m 0.12m 0.2m", normal: "0m 0m 1m" }
        ]
    },
    pipet: {
        name: "Pipet",
        model: "models/pipet.glb",
        description: "Alat untuk mengambil dan memindahkan cairan dalam volume kecil secara terukur.",
        usage: "Pasang tip yang sesuai, atur volume, lalu tekan plunger perlahan saat mengambil dan mengeluarkan cairan.",
        hotspots: [
            { label: "Plunger", description: "Tombol atas untuk mengatur langkah pengambilan dan pengeluaran cairan.", position: "0.03m 0.17m 0.02m", normal: "0m 1m 0m" },
            { label: "Ujung pipet", description: "Ujung pipet dipasangkan dengan tip sekali pakai untuk mengambil cairan.", position: "0.02m 0.02m 0.02m", normal: "0m -1m 0m" }
        ]
    }
};

const params = new URLSearchParams(window.location.search);
const requestedKey = params.get("alat") || "mikroskop";
const keys = Object.keys(tools);
let currentKey = tools[requestedKey] ? requestedKey : "mikroskop";

const viewer = document.getElementById("ar-viewer");
const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");
const arHud = document.getElementById("ar-hud");
const hotspotInfo = document.getElementById("hotspot-info");
const hotspotTitle = document.getElementById("hotspot-title");
const hotspotDescription = document.getElementById("hotspot-description");
const toggleHotspotsButton = document.getElementById("toggle-hotspots");
const switchToolButton = document.getElementById("switch-tool");
const activateArButton = document.getElementById("activate-ar");

let hotspotsVisible = true;

function closeHotspotInfo() {
    hotspotInfo.hidden = true;
    document.querySelectorAll(".hotspot.is-active").forEach((hotspot) => hotspot.classList.remove("is-active"));
}

function showHotspotInfo(hotspot, data) {
    hotspotTitle.textContent = data.label;
    hotspotDescription.textContent = data.description;
    hotspotInfo.hidden = false;
    document.querySelectorAll(".hotspot.is-active").forEach((item) => item.classList.remove("is-active"));
    hotspot.classList.add("is-active");
}

function renderHotspots(tool) {
    viewer.querySelectorAll(".hotspot").forEach((hotspot) => hotspot.remove());
    tool.hotspots.forEach((data, index) => {
        const hotspot = document.createElement("button");
        hotspot.className = "hotspot";
        hotspot.type = "button";
        hotspot.slot = `hotspot-${index + 1}`;
        hotspot.dataset.position = data.position;
        hotspot.dataset.normal = data.normal;
        hotspot.setAttribute("aria-label", `Tampilkan informasi ${data.label}`);
        hotspot.textContent = "i";
        hotspot.addEventListener("click", () => {
            if (!hotspotInfo.hidden && hotspot.classList.contains("is-active")) {
                closeHotspotInfo();
                return;
            }
            showHotspotInfo(hotspot, data);
        });
        viewer.appendChild(hotspot);
    });
    closeHotspotInfo();
    viewer.classList.toggle("hotspots-hidden", !hotspotsVisible);
}

function updateNavigation() {
    const currentIndex = keys.indexOf(currentKey);
    const prevKey = keys[(currentIndex - 1 + keys.length) % keys.length];
    const nextKey = keys[(currentIndex + 1) % keys.length];
    document.getElementById("prev-btn").href = `?alat=${prevKey}`;
    document.getElementById("next-btn").href = `?alat=${nextKey}`;
    document.getElementById("page-indicator").textContent = `${currentIndex + 1} / ${keys.length}`;
}

function loadTool(key) {
    const tool = tools[key] || tools.mikroskop;
    currentKey = tools[key] ? key : "mikroskop";
    document.getElementById("tool-name").textContent = tool.name;
    document.getElementById("tool-desc").textContent = tool.description;
    document.getElementById("tool-usage").textContent = `💡 ${tool.usage}`;
    viewer.alt = `Model 3D ${tool.name}`;
    loadingIndicator.style.display = "block";
    errorMessage.style.display = "none";
    viewer.src = tool.model;
    renderHotspots(tool);
    updateNavigation();
    const nextKey = keys[(keys.indexOf(currentKey) + 1) % keys.length];
    switchToolButton.innerHTML = `<span aria-hidden="true">↔</span> Ganti ke ${tools[nextKey].name}`;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("alat", currentKey);
    window.history.replaceState({}, "", nextUrl);
}

function setArHudVisible(isVisible) {
    document.body.classList.toggle("ar-active", isVisible);
    arHud.removeAttribute("aria-hidden");
}

// Loading & Error Handling
viewer.addEventListener("load", () => {
    loadingIndicator.style.display = "none";
    errorMessage.style.display = "none";
});

viewer.addEventListener("error", (event) => {
    loadingIndicator.style.display = "none";
    errorMessage.style.display = "block";
    errorMessage.querySelector(".error-detail").textContent = event.detail?.message || "Model tidak dapat dimuat";
});

viewer.addEventListener("ar-status", (event) => {
    const status = event.detail?.status;
    setArHudVisible(status === "session-started");
});

toggleHotspotsButton.addEventListener("click", () => {
    hotspotsVisible = !hotspotsVisible;
    viewer.classList.toggle("hotspots-hidden", !hotspotsVisible);
    toggleHotspotsButton.setAttribute("aria-pressed", String(hotspotsVisible));
    toggleHotspotsButton.innerHTML = `<span aria-hidden="true">ⓘ</span> ${hotspotsVisible ? "Sembunyikan info" : "Tampilkan info"}`;
    if (!hotspotsVisible) closeHotspotInfo();
});

document.getElementById("close-hotspot").addEventListener("click", closeHotspotInfo);

switchToolButton.addEventListener("click", () => {
    const nextKey = keys[(keys.indexOf(currentKey) + 1) % keys.length];
    loadTool(nextKey);
});

activateArButton.addEventListener("click", async () => {
    if (!viewer.canActivateAR) {
        errorMessage.style.display = "block";
        errorMessage.querySelector(".error-detail").textContent = "Mode AR tidak tersedia di browser atau perangkat ini.";
        return;
    }
    try {
        await viewer.activateAR();
    } catch (error) {
        errorMessage.style.display = "block";
        errorMessage.querySelector(".error-detail").textContent = error.message || "Mode AR tidak dapat dimulai.";
    }
});

setArHudVisible(false);
loadTool(currentKey);
