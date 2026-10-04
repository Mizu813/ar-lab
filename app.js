const tools = {
    mikroskop: {
        name: "Mikroskop",
        model: "models/microscope.glb",
        description: "Alat untuk mengamati objek berukuran sangat kecil (mikroskopis).",
        usage: "Letakkan preparat di meja objek, atur fokus dengan pemutar makro/mikro.",
        hotspots: [
            { label: "Lensa objektif", description: "Lensa ini memperbesar bayangan preparat sebelum diteruskan ke lensa okuler.", position: "0.04m 0.13m 0.07m", normal: "0.04m 0.13m 0.07m" },
            { label: "Meja objek", description: "Tempat meletakkan preparat agar tetap stabil selama pengamatan.", position: "0m 0.1m 0.03m", normal: "0m 0.1m 0.03m" }
        ]
    },
    erlenmeyer: {
        name: "Gelas Erlenmeyer",
        model: "models/erlenmeyer.glb",
        description: "Wadah untuk mencampur, memanaskan, atau menyimpan larutan kimia.",
        usage: "Pegang pada bagian leher saat mengocok larutan agar tidak tumpah.",
        hotspots: [
            { label: "Leher gelas", description: "Bagian ini membantu menuang larutan dengan lebih terarah dan aman.", position: "0m 0.3m 0m", normal: "0m 0.3m 0m" },
            { label: "Badan gelas", description: "Badan berbentuk kerucut membantu pencampuran dan mengurangi risiko cipratan.", position: "0.02m 0.14m 0m", normal: "0.02m 0.14m 0m" }
        ]
    },
    bunsen: {
        name: "Pembakar Bunsen",
        model: "models/bunsen_burner.glb",
        description: "Alat untuk memanaskan atau mensterilkan bahan di laboratorium.",
        usage: "Nyalakan korek api, buka katup gas, dan nyalakan. Atur nyala api.",
        hotspots: [
            { label: "Tabung pembakar", description: "Tabung mengarahkan campuran gas dan udara menuju bagian api.", position: "0m 0.24m 0m", normal: "0m 0.24m 0m" },
            { label: "Pengatur udara", description: "Putar bagian ini untuk mengatur banyaknya udara dan karakter nyala api.", position: "0.08m 0.04m 0m", normal: "0.08m 0.04m 0m" }
        ]
    },
    mortar: {
        name: "Mortar dan Alu",
        model: "models/mortar.glb",
        description: "Alat untuk menghaluskan atau menumbuk bahan kimia/sampel.",
        usage: "Masukkan bahan ke mortar, lalu tumbuk dan gerus menggunakan alu.",
        hotspots: [
            { label: "Mortar", description: "Wadah tempat bahan diletakkan dan dihaluskan.", position: "0.15m 0.18m 0m", normal: "0.15m 0.18m 0m" },
            { label: "Alu", description: "Digunakan untuk menumbuk dan menggerus bahan di dalam mortar.", position: "0m 0.38m -0.135m", normal: "0m 0.38m -0.135m" }
        ]
    },
    inkubator: {
        name: "Inkubator",
        model: "models/incubator.glb",
        description: "Alat untuk menjaga suhu optimal pertumbuhan kultur mikroba/sel.",
        usage: "Atur suhu yang diinginkan, masukkan kultur, dan tutup pintu rapat.",
        hotspots: [
            { label: "Ruang inkubasi", description: "Ruang tertutup untuk menjaga kultur pada suhu yang stabil.", position: "0m 0.225 0m", normal: "0m 0.225 0m" },
            { label: "Panel pengatur", description: "Panel digunakan untuk mengatur dan memantau suhu inkubasi.", position: "0m 0.165m 0.06m", normal: "0m 0.165m 0.06m" }
        ]
    },
    pipet: {
        name: "Pipet",
        model: "models/pipet.glb",
        description: "Alat untuk mengambil dan memindahkan cairan dalam volume kecil secara terukur.",
        usage: "Pasang tip yang sesuai, atur volume, lalu tekan plunger perlahan saat mengambil dan mengeluarkan cairan.",
        hotspots: [
            { label: "Plunger", description: "Tombol atas untuk mengatur langkah pengambilan dan pengeluaran cairan.", position: "0.06m 0.34m 0.04m", normal: "0.06m 0.34m 0.04m" },
            { label: "Ujung pipet", description: "Ujung pipet dipasangkan dengan tip sekali pakai untuk mengambil cairan.", position: "0.18m 0.04m -0.04m", normal: "0.18m 0.04m -0.04m" }
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
const activateArButton = document.getElementById("activate-ar");

// Ambil elemen hotspot navigasi
const switchToolHotspot = document.querySelector(".nav-hotspot");
const switchTooltip = document.getElementById("switch-tooltip");

let hotspotsVisible = true;

function closeAllHotspots() {
    document.querySelectorAll(".hotspot.is-active").forEach((hotspot) => {
        hotspot.classList.remove("is-active");
    });
}

function renderHotspots(tool) {
    // Hapus hanya hotspot info (jangan hapus nav-hotspot)
    viewer.querySelectorAll(".hotspot:not(.nav-hotspot)").forEach((hotspot) => hotspot.remove());
    
    tool.hotspots.forEach((data, index) => {
        const hotspot = document.createElement("button");
        hotspot.className = "hotspot";
        hotspot.type = "button";
        hotspot.slot = `hotspot-${index + 1}`;
        
        hotspot.setAttribute("data-position", data.position);
        hotspot.setAttribute("data-normal", data.normal);
        hotspot.setAttribute("aria-label", `Tampilkan informasi ${data.label}`);
        hotspot.textContent = "i";

        const tooltip = document.createElement("div");
        tooltip.className = "hotspot-tooltip";
        tooltip.innerHTML = `<strong>${data.label}</strong><p>${data.description}</p>`;
        hotspot.appendChild(tooltip);

        hotspot.addEventListener("click", () => {
            const isActive = hotspot.classList.contains("is-active");
            closeAllHotspots(); 
            if (!isActive) {
                hotspot.classList.add("is-active");
            }
        });

        viewer.appendChild(hotspot);
    });
    
    closeAllHotspots();
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
    
    // Perbarui tooltip pada hotspot switch
    const nextKey = keys[(keys.indexOf(currentKey) + 1) % keys.length];
    switchTooltip.innerHTML = `<strong>Ganti Alat</strong><p>Beralih ke ${tools[nextKey].name}</p>`;
    
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("alat", currentKey);
    window.history.replaceState({}, "", nextUrl);
}

viewer.addEventListener("load", () => {
    loadingIndicator.style.display = "none";
    errorMessage.style.display = "none";
});

viewer.addEventListener("error", (event) => {
    loadingIndicator.style.display = "none";
    errorMessage.style.display = "block";
    errorMessage.querySelector(".error-detail").textContent = event.detail?.message || "Model tidak dapat dimuat";
});

// Event listener untuk hotspot switch
switchToolHotspot.addEventListener("click", () => {
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

loadTool(currentKey);