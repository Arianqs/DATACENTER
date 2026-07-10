// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
let currentUserTier = null; // null (no logueado), 'Free' (limitado), 'Pro' (full)
const SECURE_AWS_URL = "https://telemetria-f1.duckdns.org";

// ==========================================
// CONSTRUCTORES DE VISTAS (HTML Inyectado)
// ==========================================

const UI_LANDING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <div class="nav-links">
            <a class="nav-link" onclick="renderPricing()">Precios</a>
            <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderAuth('login')">Ingresar</button>
            <button class="btn btn-primary" style="padding: 8px 16px;" onclick="renderAuth('register')">Registrarse</button>
        </div>
    </nav>
    <main class="hero-section">
        <h1>Domina la pista con datos en tiempo real</h1>
        <p>La plataforma definitiva de análisis para ingenieros y fanáticos. Telemetría directa, tiempos por sector y estadísticas históricas de la FIA.</p>
        <button class="btn btn-primary" style="font-size: 16px; padding: 15px 30px;" onclick="renderAuth('register')">Comenzar Gratis</button>
        
        <div class="hero-features">
            <div class="feature-item">
                <i class="fa-solid fa-chart-line"></i>
                <h3>Análisis Histórico</h3>
                <p>Accede a todos los campeonatos y clasificaciones desde 2023.</p>
            </div>
            <div class="feature-item">
                <i class="fa-solid fa-stopwatch"></i>
                <h3>Tiempos por Sector</h3>
                <p>Desglose milimétrico de S1, S2, S3 y velocidades puntas.</p>
            </div>
            <div class="feature-item">
                <i class="fa-solid fa-server"></i>
                <h3>Infraestructura AWS</h3>
                <p>Datos procesados en la nube con alta disponibilidad y precisión.</p>
            </div>
        </div>
    </main>
`;

const UI_AUTH = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderLanding()">Volver al Inicio</button>
    </nav>
    <div class="auth-container">
        <div class="auth-box">
            <h2 id="auth-title">Iniciar Sesión</h2>
            <p id="auth-subtitle">Ingresa a tu panel de control</p>
            
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" placeholder="ingeniero@escuderia.com">
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••">
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="simulateLogin('Free')">Ingresar (Cuenta Gratuita)</button>
            <button class="btn btn-outline" style="width: 100%; margin-top: 10px;" onclick="simulateLogin('Pro')">Ingresar (Cuenta Pro)</button>
        </div>
    </div>
`;

const UI_PRICING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <div class="nav-links">
            <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderAuth('login')">Ingresar</button>
        </div>
    </nav>
    <main class="hero-section" style="padding-top: 60px;">
        <h1 style="font-size: 36px;">Elige tu telemetría</h1>
        <p>Actualiza tu plan en cualquier momento. Sin compromisos.</p>
        
        <div class="grid-container" style="max-width: 900px; margin: 0 auto; text-align:left;">
            <div class="pricing-card">
                <h3>Plan Aficionado</h3>
                <div class="price">$0<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Clasificación Mundial Completa</li>
                    <li><i class="fa-solid fa-check"></i> Catálogo de Circuitos</li>
                    <li><i class="fa-solid fa-check"></i> Tiempos de Vuelta Final</li>
                    <li><i class="fa-solid fa-xmark"></i> Sin Tiempos por Sector</li>
                    <li><i class="fa-solid fa-xmark"></i> Sin Velocidad Punta</li>
                </ul>
                <button class="btn btn-outline" style="width: 100%;" onclick="renderAuth('register')">Crear Cuenta Gratis</button>
            </div>
            <div class="pricing-card pro">
                <div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); background:var(--f1-red); color:#fff; font-size:11px; font-weight:700; padding:5px 15px; border-radius:20px;">MÁS ELEGIDO</div>
                <h3>Director de Carrera (PRO)</h3>
                <div class="price">$15<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Todo lo del Plan Aficionado</li>
                    <li><i class="fa-solid fa-check"></i> <b>Telemetría por Sectores (S1, S2, S3)</b></li>
                    <li><i class="fa-solid fa-check"></i> Velocidades Puntas Exactas</li>
                    <li><i class="fa-solid fa-check"></i> Filtro Prácticas y Sprint</li>
                </ul>
                <!-- Si el usuario ya está logueado como gratis, este botón lo "mejora" -->
                <button class="btn btn-primary" style="width: 100%;" onclick="upgradeToPro()">Adquirir Plan PRO</button>
            </div>
        </div>
    </main>
`;

const UI_DASHBOARD = `
    <div class="dashboard-wrapper">
        <header class="dash-header">
            <div class="dash-title">
                <h2>F1 <span>Dashboard</span></h2>
                <p>Plataforma de Análisis de Datos</p>
            </div>
            <div class="dash-controls">
                <div class="status-badge" id="aws-status">
                    <div class="dot"></div>
                    <span>Conectado al Servidor AWS</span>
                </div>
                <div id="tier-badge" style="font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--bg-dark); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);"></div>
                
                <!-- Botón de Mejorar Plan (Se inyecta por JS si es Free) -->
                <div id="upgrade-btn-container"></div>
                
                <button class="btn btn-outline" style="padding: 8px 15px;" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Salir</button>
            </div>
        </header>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('telemetry-view')"><i class="fa-solid fa-gauge-high"></i> Telemetría de Carrera</button>
            <button class="tab-btn" onclick="switchTab('standings-view')"><i class="fa-solid fa-trophy"></i> Mundial de Pilotos</button>
            <button class="tab-btn" onclick="switchTab('circuits-view')"><i class="fa-solid fa-map"></i> Circuitos FIA</button>
        </div>

        <!-- VISTA: TELEMETRÍA -->
        <div id="telemetry-view" class="view-content active">
            <div class="filters">
                <select id="tel-season" onchange="fetchTelemetryData();">
                    <option value="2026">Temporada 2026</option>
                    <option value="2025">Temporada 2025</option>
                    <option value="2024">Temporada 2024</option>
                    <option value="2023">Temporada 2023</option>
                </select>
                <select id="tel-circuit" onchange="fetchTelemetryData();"></select>
                <select id="tel-session" onchange="fetchTelemetryData();">
                    <option value="race">Carrera (Race)</option>
                    <option value="qualifying">Clasificación (Q)</option>
                    <option value="sprint">Sprint</option>
                    <option value="fp2">Prácticas 2</option>
                    <option value="fp1">Prácticas 1</option>
                </select>
                
                <!-- Alerta para Free Users -->
                <div id="free-warning" style="display:none; align-items:center; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 0 15px; border-radius: 6px; font-size:13px; font-weight:600; border: 1px solid rgba(251, 191, 36, 0.2);">
                    <i class="fa-solid fa-circle-exclamation" style="margin-right: 8px;"></i> Visualización Limitada
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th><th>Piloto / Escudería</th><th>Mejor Vuelta</th><th>Pits</th><th>Neumático</th><th>Vel. Punta</th><th>S1</th><th>S2</th><th>S3</th>
                        </tr>
                    </thead>
                    <tbody id="telemetry-table-body"></tbody>
                </table>
            </div>
            <div id="telemetry-msg" style="display:none; text-align:center; padding: 40px; color: var(--text-muted);"></div>
        </div>

        <!-- VISTA: ESTADÍSTICAS -->
        <div id="standings-view" class="view-content">
            <div class="filters">
                <select id="standings-season" onchange="fetchStandingsData();">
                    <option value="2026">Mundial 2026</option>
                    <option value="2025">Mundial 2025</option>
                    <option value="2024">Mundial 2024</option>
                    <option value="2023">Mundial 2023</option>
                </select>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th><th>Piloto / Escudería</th><th>Puntos</th><th>Victorias</th><th>Podios</th><th>Vueltas Rápidas</th>
                        </tr>
                    </thead>
                    <tbody id="standings-table-body"></tbody>
                </table>
            </div>
        </div>

        <!-- VISTA: CIRCUITOS -->
        <div id="circuits-view" class="view-content">
            <div class="grid-container" id="circuits-grid-container"></div>
        </div>
    </div>
`;


// ==========================================
// FUNCIONES DE CONTROL DE VISTAS (ENRUTADOR)
// ==========================================
const appRoot = () => document.getElementById('app-root');

function renderLanding() { appRoot().innerHTML = UI_LANDING; }
function renderPricing() { appRoot().innerHTML = UI_PRICING; }

function renderAuth(type) {
    appRoot().innerHTML = UI_AUTH;
    if (type === 'register') {
        document.getElementById('auth-title').innerText = "Crear Cuenta";
        document.getElementById('auth-subtitle').innerText = "Regístrate para acceder a los datos";
    }
}

function simulateLogin(tier) {
    currentUserTier = tier;
    appRoot().innerHTML = UI_DASHBOARD;
    
    // Configurar Dashboard según el plan
    const badge = document.getElementById('tier-badge');
    const upgradeContainer = document.getElementById('upgrade-btn-container');
    const freeWarning = document.getElementById('free-warning');

    if (tier === 'Free') {
        badge.innerHTML = 'Plan Aficionado (Gratis)';
        upgradeContainer.innerHTML = `<button class="btn-upgrade" onclick="renderPricing()"><i class="fa-solid fa-rocket"></i> Mejorar Plan</button>`;
        freeWarning.style.display = 'flex';
    } else {
        badge.innerHTML = '<i class="fa-solid fa-crown" style="color:var(--f1-red)"></i> Plan Director (PRO)';
        upgradeContainer.innerHTML = '';
        freeWarning.style.display = 'none';
    }

    populateCircuits();
    fetchTelemetryData();
}

function upgradeToPro() {
    if(currentUserTier === 'Free') {
        alert("¡Pago simulado exitoso! Tu cuenta ha sido mejorada a PRO.");
        simulateLogin('Pro');
    } else {
        renderAuth('register');
    }
}

function logout() {
    currentUserTier = null;
    renderLanding();
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

// ==========================================
// LÓGICA DE DATOS Y API (AWS EC2)
// ==========================================
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

function handleNetError(isError) {
    const statusText = document.getElementById('aws-status-text');
    const badge = document.getElementById('aws-status');
    const dot = badge.querySelector('.dot');
    
    if (isError) {
        badge.style.color = "var(--f1-red)";
        badge.style.background = "rgba(225, 6, 0, 0.1)";
        badge.style.borderColor = "rgba(225, 6, 0, 0.2)";
        dot.style.background = "var(--f1-red)";
        dot.style.boxShadow = "0 0 8px var(--f1-red)";
        statusText.innerText = "Error Servidor AWS";
    } else {
        badge.style.color = "var(--accent-green)";
        badge.style.background = "rgba(16,185,129,0.1)";
        badge.style.borderColor = "rgba(16,185,129,0.2)";
        dot.style.background = "var(--accent-green)";
        dot.style.boxShadow = "0 0 8px var(--accent-green)";
        statusText.innerText = "Conectado al Servidor AWS";
    }
}

async function fetchTelemetryData() {
    const season = document.getElementById('tel-season').value;
    const circuit = document.getElementById('tel-circuit').value;
    const session = document.getElementById('tel-session').value;
    const tbody = document.getElementById('telemetry-table-body');
    const tableContainer = document.querySelector('.table-container');
    const msgDiv = document.getElementById('telemetry-msg');
    
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/telemetry?season=${season}&circuit=${circuit}&session=${session}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        handleNetError(false);

        if(data.status === "FUTURE" || data.status === "NO_SPRINT") {
            tableContainer.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = data.status === "FUTURE" 
                ? `<i class="fa-solid fa-calendar-xmark" style="font-size:30px; margin-bottom:15px; color:var(--text-muted)"></i><br>Evento futuro. Datos no disponibles.`
                : `<i class="fa-solid fa-ban" style="font-size:30px; margin-bottom:15px; color:var(--f1-red)"></i><br>No hubo formato Sprint en este Gran Premio.`;
            return;
        }

        tableContainer.style.display = "block";
        msgDiv.style.display = "none";
        tbody.innerHTML = "";
        
        const isFree = currentUserTier === 'Free';
        const lockHtml = `<span class="locked-cell" title="Mejora a PRO para desbloquear"><i class="fa-solid fa-lock"></i> PRO</span>`;

        data.data.forEach(row => {
            let posBadge = row.pos === 1 ? `<span class="rank-gold">1</span>` : (row.pos === "DNF" ? `<span class="rank-dnf">DNF</span>` : `<span class="rank-normal">${row.pos}</span>`);
            let opacityStyle = row.pos === "DNF" ? "opacity: 0.4;" : "";

            tbody.innerHTML += `
                <tr style="${opacityStyle}">
                    <td>${posBadge}</td>
                    <td><span class="driver-name">${row.driver}</span><span class="team-name">${row.team}</span></td>
                    <td class="mono" style="color:var(--text-main); font-weight:700;">${row.best_lap}</td>
                    <td class="mono">${row.pits}</td>
                    <td>${row.tyre}</td>
                    <!-- LÓGICA DE BLOQUEO GRATUITO -->
                    <td class="mono">${isFree ? lockHtml : row.top_speed}</td>
                    <td class="mono">${isFree ? lockHtml : row.s1}</td>
                    <td class="mono">${isFree ? lockHtml : row.s2}</td>
                    <td class="mono">${isFree ? lockHtml : row.s3}</td>
                </tr>
            `;
        });
    } catch (err) {
        handleNetError(true);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--f1-red);">Fallo de conexión con AWS EC2.</td></tr>`;
    }
}

async function fetchStandingsData() {
    const season = document.getElementById('standings-season').value;
    const tbody = document.getElementById('standings-table-body');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/standings?season=${season}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        handleNetError(false);
        tbody.innerHTML = "";
        data.standings.forEach(row => {
            const rankBadge = row.rank === 1 ? `<span class="rank-gold"><i class="fa-solid fa-trophy"></i></span>` : `<span class="rank-normal">${row.rank}</span>`;
            tbody.innerHTML += `
                <tr>
                    <td>${rankBadge}</td>
                    <td><span class="driver-name">${row.driver}</span><span class="team-name">${row.team}</span></td>
                    <td class="mono" style="color:#fff; font-weight:900; font-size:15px;">${row.points}</td>
                    <td class="mono" style="color:var(--accent-green);">${row.wins}</td>
                    <td class="mono">${row.podiums}</td>
                    <td class="mono" style="color:var(--accent-blue);">${row.fast_laps}</td>
                </tr>
            `;
        });
    } catch (err) {
        handleNetError(true);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px;">Error al obtener tabla.</td></tr>`;
    }
}

async function fetchCircuitsData() {
    const grid = document.getElementById('circuits-grid-container');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/circuits`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        handleNetError(false);
        grid.innerHTML = "";
        data.forEach(circuit => {
            grid.innerHTML += `
                <div class="card">
                    <img src="${circuit.image}" alt="${circuit.name}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Formula_1_logo.svg/1024px-Formula_1_logo.svg.png'">
                    <h3>${circuit.name}</h3>
                    <p style="margin:5px 0 15px 0; font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${circuit.location}</p>
                    <div style="display:flex; justify-content:space-around; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px;">
                        <div>
                            <span style="display:block; font-size:10px; color:var(--text-muted); text-transform:uppercase;">Longitud</span>
                            <span class="mono" style="font-size:13px; font-weight:700;">${circuit.length}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        handleNetError(true);
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--f1-red);">Error al obtener circuitos.</div>`;
    }
}

// ==========================================
// SEGURIDAD EXTREMA (ANTI-INSPECCIÓN)
// ==========================================
document.addEventListener('contextmenu', e => e.preventDefault()); 
document.onkeydown = function(e) {
    if (e.keyCode === 123) return false; 
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) return false; 
    if (e.ctrlKey && e.keyCode === 85) return false; 
};

// ==========================================
// INICIALIZADOR: Cargar Landing al iniciar
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderLanding();
});