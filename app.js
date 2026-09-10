const tools = {
    mikroskop: {
        name: "Mikroskop",
        model: "models/microscope.glb",
        description: "Alat untuk mengamati objek berukuran sangat kecil (mikroskopis).",
        usage: "Letakkan preparat di meja objek, atur fokus dengan pemutar makro/mikro."
    },
    erlenmeyer: {
        name: "Gelas Erlenmeyer",
        model: "models/erlenmeyer.glb",
        description: "Wadah untuk mencampur, memanaskan, atau menyimpan larutan kimia.",
        usage: "Pegang pada bagian leher saat mengocok larutan agar tidak tumpah."
    },
    bunsen: {
        name: "Pembakar Bunsen",
        model: "models/bunsen_burner.glb",
        description: "Alat untuk memanaskan atau mensterilkan bahan di laboratorium.",
        usage: "Nyalakan korek api, buka katup gas, dan nyalakan. Atur nyala api."
    },
    mortar: {
        name: "Mortar dan Alu",
        model: "models/mortar.glb",
        description: "Alat untuk menghaluskan atau menumbuk bahan kimia/sampel.",
        usage: "Masukkan bahan ke mortar, lalu tumbuk dan gerus menggunakan alu."
    },
    inkubator: {
        name: "Inkubator",
        model: "models/incubator.glb",
        description: "Alat untuk menjaga suhu optimal pertumbuhan kultur mikroba/sel.",
        usage: "Atur suhu yang diinginkan, masukkan kultur, dan tutup pintu rapat."
    }
};

const params = new URLSearchParams(window.location.search);
const alatKey = params.get("alat") || "mikroskop";
const currentTool = tools[alatKey] || tools["mikroskop"];
const keys = Object.keys(tools);
const currentIndex = keys.indexOf(alatKey);

const viewer = document.getElementById("ar-viewer");
const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");

// Update UI
document.getElementById("tool-name").textContent = currentTool.name;
document.getElementById("tool-desc").textContent = currentTool.description;
document.getElementById("tool-usage").textContent = `💡 ${currentTool.usage}`;
viewer.src = currentTool.model;

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

// Navigation
const prevKey = keys[(currentIndex - 1 + keys.length) % keys.length];
const nextKey = keys[(currentIndex + 1) % keys.length];

document.getElementById("prev-btn").href = `?alat=${prevKey}`;
document.getElementById("next-btn").href = `?alat=${nextKey}`;
document.getElementById("page-indicator").textContent = `${currentIndex + 1} / ${keys.length}`;