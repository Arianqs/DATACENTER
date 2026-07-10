const SECURE_AWS_URL = "https://telemetria-f1.duckdns.org";

const allRaces = [
    {val: "bahrain", txt: "Bahrain GP"}, {val: "saudi", txt: "Saudi Arabian GP"},
    {val: "australia", txt: "Australian GP"}, {val: "japan", txt: "Japanese GP"},
    {val: "china", txt: "Chinese GP"}, {val: "miami", txt: "Miami GP"},
    {val: "imola", txt: "Emilia Romagna GP"}, {val: "monaco", txt: "Monaco GP"},
    {val: "canada", txt: "Canadian GP"}, {val: "spain", txt: "Spanish GP"},
    {val: "austria", txt: "Austrian GP"}, {val: "silverstone", txt: "British GP"},
    {val: "hungary", txt: "Hungarian GP"}, {val: "spa", txt: "Belgian GP"},
    {val: "netherlands", txt: "Dutch GP"}, {val: "monza", txt: "Italian GP"},
    {val: "azerbaijan", txt: "Azerbaijan GP"}, {val: "singapore", txt: "Singapore GP"},
    {val: "usa", txt: "United States GP"}, {val: "mexico", txt: "Mexico City GP"},
    {val: "interlagos", txt: "São Paulo GP"}, {val: "vegas", txt: "Las Vegas GP"},
    {val: "qatar", txt: "Qatar GP"}, {val: "abudhabi", txt: "Abu Dhabi GP"}
];

function populateCircuits() {
    const circuitSelect = document.getElementById('tel-circuit');
    circuitSelect.innerHTML = "";
    allRaces.forEach(c => { circuitSelect.innerHTML += `<option value="${c.val}">${c.txt}</option>`; });
}

function updateStatus(isOnline) {
    const statusDiv = document.getElementById('aws-status');
    const statusText = document.getElementById('aws-status-text');
    const pulse = statusDiv.querySelector('.pulse-dot');
    
    if(isOnline) {
        statusDiv.style.background = 'rgba(16, 185, 129, 0.08)';
        statusDiv.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        statusDiv.style.color = 'var(--accent-green)';
        pulse.style.backgroundColor = 'var(--accent-green)';
        pulse.style.boxShadow = '0 0 12px var(--accent-green)';
        statusText.innerText = "Conectado al Servidor AWS";
    } else {
        statusDiv.style.background = 'rgba(244, 63, 94, 0.08)';
        statusDiv.style.borderColor = 'rgba(244, 63, 94, 0.2)';
        statusDiv.style.color = 'var(--accent-red)';
        pulse.style.backgroundColor = 'var(--accent-red)';
        pulse.style.boxShadow = '0 0 12px var(--accent-red)';
        statusText.innerText = "Desconectado (Error: 0)";
    }
}

function switchTab(viewId) {
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    event.currentTarget.classList.add('active');
    if(viewId === 'telemetry-view') fetchTelemetryData();
    if(viewId === 'standings-view') fetchStandingsData();
    if(viewId === 'circuits-view') fetchCircuitsData();
}

async function fetchTelemetryData() {
    const season = document.getElementById('tel-season').value;
    const circuit = document.getElementById('tel-circuit').value;
    const session = document.getElementById('tel-session').value;
    const tbody = document.getElementById('telemetry-table-body');
    const meta = document.getElementById('circuit-meta');
    const tableDiv = document.getElementById('telemetry-table-container');
    const msgDiv = document.getElementById('telemetry-future-msg');
    if(!circuit) return;

    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/telemetry?season=${season}&circuit=${circuit}&session=${session}`);
        if (!res.ok) throw new Error("Fallo de red");
        const data = await res.json();
        
        updateStatus(true);

        // Control dinámico de respuestas lógicas
        if(data.status === "FUTURE") {
            tableDiv.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = `<i class="fa-solid fa-calendar-days"></i> El evento seleccionado se encuentra programado para el calendario oficial 2026. Los datos por sesión se habilitarán al concluir las jornadas de pista oficiales.`;
            meta.innerHTML = `<i class="fa-solid fa-clock"></i> Próximamente`;
            return;
        }
        if(data.status === "NO_SPRINT") {
            tableDiv.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Formato No Válido: La FIA no programó fines de semana con formato Sprint para este circuito en la temporada histórica seleccionada.`;
            meta.innerHTML = `<i class="fa-solid fa-ban"></i> Sin Sprint`;
            return;
        }

        tableDiv.style.display = "block";
        msgDiv.style.display = "none";
        meta.innerHTML = `<i class="fa-solid fa-location-dot"></i> Laps: ${data.laps} &bull; ${data.circuit}`;
        tbody.innerHTML = "";
        
        data.data.forEach(row => {
            let posBadge;
            let opacityStyle = "";
            
            if (row.pos === 1) posBadge = `<span class="rank-gold">P1</span>`;
            else if (row.pos === "DNF") { 
                posBadge = `<span class="rank-dnf">DNF</span>`; 
                opacityStyle = "opacity: 0.35;"; 
            }
            else posBadge = `<span class="rank-normal">P${row.pos}</span>`;

            tbody.innerHTML += `
                <tr style="${opacityStyle}">
                    <td>${posBadge}</td>
                    <td><span class="driver-name">${row.driver}</span><span class="team-cell">${row.team}</span></td>
                    <td class="mono-cell" style="color:var(--accent-blue); font-weight:bold;">${row.best_lap}</td>
                    <td class="mono-cell">${row.top_speed}</td>
                    <td>${row.tyre}</td>
                    <td class="mono-cell">${row.pits}</td>
                    <td class="mono-cell" style="color:rgba(255,255,255,0.4);">${row.s1}</td>
                    <td class="mono-cell" style="color:rgba(255,255,255,0.4);">${row.s2}</td>
                    <td class="mono-cell" style="color:rgba(255,255,255,0.4);">${row.s3}</td>
                </tr>
            `;
        });
    } catch (err) {
        updateStatus(false);
        tbody.innerHTML = `<tr><td colspan="9"><div class="error-alert">Error de sincronización con el Core de AWS.</div></td></tr>`;
    }
}

async function fetchStandingsData() {
    const season = document.getElementById('standings-season').value;
    const tbody = document.getElementById('standings-table-body');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/standings?season=${season}`);
        if (!res.ok) throw new Error("Fallo de red");
        const data = await res.json();
        
        updateStatus(true);
        tbody.innerHTML = "";
        data.standings.forEach(row => {
            const rankBadge = row.rank === 1 ? `<span class="rank-gold">Mundial</span>` : `<span class="rank-normal">#${row.rank}</span>`;
            tbody.innerHTML += `
                <tr>
                    <td>${rankBadge}</td>
                    <td><span class="driver-name">${row.driver}</span><span class="team-cell">${row.team}</span></td>
                    <td class="mono-cell" style="color:var(--accent-blue); font-weight:bold; font-size:16px;">${row.points} pts</td>
                    <td class="mono-cell" style="color:var(--accent-green); font-weight:bold;">${row.wins}</td>
                    <td class="mono-cell">${row.podiums}</td>
                    <td class="mono-cell" style="color:var(--accent-red);">${row.fast_laps}</td>
                </tr>
            `;
        });
    } catch (err) {
        updateStatus(false);
        tbody.innerHTML = `<tr><td colspan="6"><div class="error-alert">Error al procesar el ranking histórico.</div></td></tr>`;
    }
}

async function fetchCircuitsData() {
    const grid = document.getElementById('circuits-grid-container');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/circuits`);
        if (!res.ok) throw new Error("Fallo de red");
        const data = await res.json();
        
        updateStatus(true);
        grid.innerHTML = "";
        data.forEach(circuit => {
            grid.innerHTML += `
                <div class="circuit-card">
                    <img src="${circuit.image}" alt="${circuit.name}" class="circuit-image" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Formula_1_logo.svg/1024px-Formula_1_logo.svg.png'">
                    <h3>${circuit.name}</h3>
                    <p><i class="fa-solid fa-map-pin"></i> ${circuit.location}</p>
                    <div class="circuit-stats">
                        <div class="stat-item"><span>Longitud</span><strong>${circuit.length}</strong></div>
                        <div class="stat-item"><span>Récord</span><strong>${circuit.record}</strong></div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        updateStatus(false);
        grid.innerHTML = `<div class="error-alert" style="grid-column: 1 / -1;">Fallo al cargar la base de circuitos. AWS Inaccesible.</div>`;
    }
}

// Inicialización de la aplicación
populateCircuits();
fetchTelemetryData();
// 1. Bloquear el Clic Derecho (Menú contextual)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 2. Bloquear atajos de teclado para herramientas de desarrollador
document.onkeydown = function(e) {
    // Bloquear F12
    if (e.keyCode === 123) {
        return false;
    }
    // Bloquear Ctrl + Shift + I (Abrir DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        return false;
    }
    // Bloquear Ctrl + Shift + C (Inspeccionar Elemento)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        return false;
    }
    // Bloquear Ctrl + Shift + J (Consola)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        return false;
    }
    // Bloquear Ctrl + U (Ver código fuente)
    if (e.ctrlKey && e.keyCode === 85) {
        return false;
    }
};