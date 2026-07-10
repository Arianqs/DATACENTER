// ==========================================
// 1. INTERFAZ DEL PORTAL SaaS (PAYWALL)
// ==========================================
const SAAS_PORTAL_UI = `
    <div class="saas-portal">
        <div class="saas-header">
            <h1>F1 Telemetry <span>Pro</span></h1>
            <p>Plataforma SaaS de análisis de datos, telemetría y tiempos de la Fórmula 1 en tiempo real. Selecciona tu plan de acceso a nuestra infraestructura Multi-Cloud.</p>
        </div>

        <div class="pricing-grid">
            <!-- Plan Free -->
            <div class="pricing-card">
                <div class="tier-name">Plan Aficionado</div>
                <div class="tier-price">$0<span>/mes</span></div>
                <ul class="tier-features">
                    <li><i class="fa-solid fa-check"></i> Clasificación Mundial Histórica</li>
                    <li><i class="fa-solid fa-check"></i> Catálogo de Circuitos FIA</li>
                    <li style="opacity: 0.4;"><i class="fa-solid fa-xmark" style="color: var(--accent-red);"></i> Telemetría de Carrera</li>
                    <li style="opacity: 0.4;"><i class="fa-solid fa-xmark" style="color: var(--accent-red);"></i> Soporte de Prácticas y Sprint</li>
                </ul>
                <button class="btn-saas" onclick="authenticateUser('Free')">Acceso Básico</button>
            </div>

            <!-- Plan Pro -->
            <div class="pricing-card pro-tier">
                <div class="tier-name">Plan Ingeniero</div>
                <div class="tier-price">$29<span>/mes</span></div>
                <ul class="tier-features">
                    <li><i class="fa-solid fa-check"></i> Acceso Total a Estadísticas</li>
                    <li><i class="fa-solid fa-check"></i> <b>Telemetría Dinámica de Carrera</b></li>
                    <li><i class="fa-solid fa-check"></i> Filtro por Sesiones (FP1, Sprint, Qualy)</li>
                    <li><i class="fa-solid fa-check"></i> Motor Conectado a AWS EC2</li>
                </ul>
                <button class="btn-saas primary" onclick="authenticateUser('Pro')">Iniciar Sesión Pro</button>
            </div>

            <!-- Plan Enterprise -->
            <div class="pricing-card">
                <div class="tier-name">Plan Escudería</div>
                <div class="tier-price">Custom</div>
                <ul class="tier-features">
                    <li><i class="fa-solid fa-check"></i> Todo lo del Plan Ingeniero</li>
                    <li><i class="fa-solid fa-check"></i> Conexión API Directa (JSON)</li>
                    <li><i class="fa-solid fa-check"></i> SLA de 99.9% de Disponibilidad</li>
                    <li><i class="fa-solid fa-check"></i> Autenticación JWT Dedicada</li>
                </ul>
                <button class="btn-saas" onclick="alert('Contactando al departamento de ventas...')">Contactar Ventas</button>
            </div>
        </div>
        <div class="saas-footer">
            <i class="fa-solid fa-lock"></i> Conexión Segura cifrada por SSL. Sistema de Autenticación de Usuario Requerido.
        </div>
    </div>
`;

// ==========================================
// 2. INTERFAZ DEL DASHBOARD CORE (ENCRIPTADA)
// ==========================================
const APP_UI = `
    <div class="dashboard" style="animation: fadeIn 0.5s ease;">
        <header class="main-header">
            <div class="title-area">
                <h1>F1 <span>Telemetry</span> Analytics</h1>
                <p><i class="fa-solid fa-cloud"></i> Producción Multi-Cloud &bull; Frontend: Render &bull; Backend: AWS</p>
            </div>
            <div style="display:flex; gap:15px; align-items:center;">
                <div class="system-status" id="aws-status">
                    <div class="pulse-dot"></div>
                    <span id="aws-status-text">Conectando con AWS...</span>
                </div>
                <button class="btn-saas" style="padding: 10px 15px; width: auto; font-size:12px;" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Salir</button>
            </div>
        </header>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('telemetry-view')"><i class="fa-solid fa-gauge-high"></i> Telemetría de Carrera</button>
            <button class="tab-btn" onclick="switchTab('standings-view')"><i class="fa-solid fa-trophy"></i> Estadísticas Mundiales</button>
            <button class="tab-btn" onclick="switchTab('circuits-view')"><i class="fa-solid fa-map-location-dot"></i> Base de Circuitos</button>
        </div>

        <div id="telemetry-view" class="view-content active">
            <div class="filter-panel">
                <div class="filter-group">
                    <label>Temporada</label>
                    <select id="tel-season" onchange="fetchTelemetryData();">
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Circuito</label>
                    <select id="tel-circuit" onchange="fetchTelemetryData();"></select>
                </div>
                <div class="filter-group">
                    <label>Sesión</label>
                    <select id="tel-session" onchange="fetchTelemetryData();">
                        <option value="race">Gran Premio (Carrera)</option>
                        <option value="qualifying">Clasificatoria</option>
                        <option value="sprint">Sprint Shootout</option>
                        <option value="fp2">Prácticas 2</option>
                        <option value="fp1">Prácticas 1</option>
                    </select>
                </div>
                <div class="info-badge" id="circuit-meta">Estableciendo canal...</div>
            </div>
            <div id="telemetry-table-container" class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th><th>Piloto / Escudería</th><th>Mejor Vuelta</th><th>Vel. Punta</th><th>Neumático</th><th>Pits</th><th>S1</th><th>S2</th><th>S3</th>
                        </tr>
                    </thead>
                    <tbody id="telemetry-table-body"></tbody>
                </table>
            </div>
            <div id="telemetry-future-msg" style="display:none;" class="future-alert"></div>
        </div>

        <div id="standings-view" class="view-content">
            <div class="filter-panel">
                <div class="filter-group">
                    <label>Campeonato Histórico</label>
                    <select id="standings-season" onchange="fetchStandingsData();">
                        <option value="2026">Temporada 2026 (Estado Actual)</option>
                        <option value="2025">Temporada 2025 (Cierre Oficial)</option>
                        <option value="2024">Temporada 2024 (Cierre Oficial)</option>
                        <option value="2023">Temporada 2023 (Cierre Oficial)</option>
                    </select>
                </div>
                <div class="info-badge"><i class="fa-solid fa-chart-line"></i> Core IaaS AWS</div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Rango</th><th>Piloto / Escudería</th><th>Puntos Totales</th><th>Victorias</th><th>Podios</th><th>Vueltas Rápidas</th>
                        </tr>
                    </thead>
                    <tbody id="standings-table-body"></tbody>
                </table>
            </div>
        </div>

        <div id="circuits-view" class="view-content">
            <div class="filter-panel">
                <div class="info-badge" style="margin-left:0; text-align: left;"><i class="fa-solid fa-layer-group"></i> Catálogo Mundial de la FIA (24 Circuitos)</div>
            </div>
            <div class="circuits-grid" id="circuits-grid-container"></div>
        </div>
    </div>
`;

// ==========================================
// 3. LÓGICA DE AUTENTICACIÓN Y NEGOCIO SaaS
// ==========================================
function authenticateUser(plan) {
    if(plan === 'Free') {
        alert("El plan Aficionado no incluye acceso al Dashboard de Telemetría. Por favor inicia sesión con una cuenta Pro.");
        return;
    }
    // Simulamos un inicio de sesión exitoso inyectando el Dashboard
    document.getElementById('app-root').innerHTML = APP_UI;
    
    // Inicializamos las funciones del core
    populateCircuits();
    fetchTelemetryData();
}

function logoutUser() {
    // Destruimos el dashboard y volvemos al paywall
    document.getElementById('app-root').innerHTML = SAAS_PORTAL_UI;
}

// ==========================================
// 4. LÓGICA CORE DE DATOS (AWS)
// ==========================================
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
    if(!circuitSelect) return;
    circuitSelect.innerHTML = "";
    allRaces.forEach(c => { circuitSelect.innerHTML += `<option value="${c.val}">${c.txt}</option>`; });
}

function updateStatus(isOnline) {
    const statusDiv = document.getElementById('aws-status');
    const statusText = document.getElementById('aws-status-text');
    const pulse = document.querySelector('.pulse-dot');
    if(!statusDiv) return;
    
    if(isOnline) {
        statusDiv.style.background = 'rgba(16, 185, 129, 0.08)';
        statusDiv.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        statusDiv.style.color = 'var(--accent-green)';
        pulse.style.backgroundColor = 'var(--accent-green)';
        pulse.style.boxShadow = '0 0 12px var(--accent-green)';
        statusText.innerText = "SaaS Token Activo (AWS)";
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
    
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/telemetry?season=${season}&circuit=${circuit}&session=${session}`);
        if (!res.ok) throw new Error("Fallo de red");
        const data = await res.json();
        
        updateStatus(true);

        if(data.status === "FUTURE") {
            tableDiv.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = `<i class="fa-solid fa-calendar-days"></i> El evento seleccionado se encuentra programado. Datos disponibles al concluir la jornada oficial.`;
            meta.innerHTML = `<i class="fa-solid fa-clock"></i> Próximamente`;
            return;
        }
        if(data.status === "NO_SPRINT") {
            tableDiv.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Formato No Válido: Sin Sprint histórico programado.`;
            meta.innerHTML = `<i class="fa-solid fa-ban"></i> Sin Sprint`;
            return;
        }

        tableDiv.style.display = "block";
        msgDiv.style.display = "none";
        meta.innerHTML = `<i class="fa-solid fa-location-dot"></i> Laps: ${data.laps} &bull; ${data.circuit}`;
        tbody.innerHTML = "";
        
        data.data.forEach(row => {
            let posBadge = row.pos === 1 ? `<span class="rank-gold">P1</span>` : 
                           row.pos === "DNF" ? `<span class="rank-dnf">DNF</span>` : 
                           `<span class="rank-normal">P${row.pos}</span>`;
            let opacityStyle = row.pos === "DNF" ? "opacity: 0.35;" : "";

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
        tbody.innerHTML = `<tr><td colspan="9"><div class="error-alert">Error de sincronización con AWS.</div></td></tr>`;
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
        tbody.innerHTML = `<tr><td colspan="6"><div class="error-alert">Error al procesar ranking.</div></td></tr>`;
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
        grid.innerHTML = `<div class="error-alert" style="grid-column: 1 / -1;">Fallo de AWS.</div>`;
    }
}

// ==========================================
// 5. SEGURIDAD EXTREMA (ANTI-INSPECCIÓN)
// ==========================================
document.addEventListener('contextmenu', e => e.preventDefault()); 
document.onkeydown = function(e) {
    if (e.keyCode === 123) return false; 
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) return false; 
    if (e.ctrlKey && e.keyCode === 85) return false; 
};

// ==========================================
// 6. INICIALIZADOR DEL SISTEMA (PAYWALL PRIMERO)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Al cargar la página, inyectamos primero el portal SaaS en lugar del Dashboard
    document.getElementById('app-root').innerHTML = SAAS_PORTAL_UI;
});