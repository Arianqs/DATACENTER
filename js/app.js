let currentUserTier = null; 
let currentUserName = "";
const SECURE_AWS_URL = "https://telemetria-f1.duckdns.org"; 

const UI_LANDING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <div class="nav-links">
            <a class="nav-link" onclick="renderPricing()">Paquetes</a>
            <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderAuth('login')">Ingresar</button>
            <button class="btn btn-primary" style="padding: 8px 16px;" onclick="renderAuth('register')">Registrarse</button>
        </div>
    </nav>
    <main class="hero-section">
        <h1>Domina la pista con datos en tiempo real</h1>
        <p>Plataforma SaaS para ingenieros. Telemetría directa, tiempos por sector y estadísticas de la FIA en la nube AWS.</p>
        <button class="btn btn-primary" style="font-size: 16px; padding: 15px 30px;" onclick="renderAuth('register')">Comenzar Gratis</button>
    </main>
`;

const UI_AUTH_LOGIN = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderLanding()">Inicio</button>
    </nav>
    <div class="auth-container">
        <div class="auth-box">
            <h2>Iniciar Sesión</h2>
            <form onsubmit="handleLogin(event)">
                <div class="form-group"><label>Correo Electrónico</label><input type="email" id="log-email" required></div>
                <div class="form-group"><label>Contraseña</label><input type="password" id="log-pass" required></div>
                <div id="login-error" style="color:var(--f1-red); font-size:12px; margin-bottom:10px; display:none;"></div>
                <button type="submit" class="btn btn-primary" style="width:100%;">Ingresar</button>
            </form>
            <p style="text-align:center; font-size:12px; margin-top:15px;">¿Nuevo? <a href="#" style="color:var(--accent-blue);" onclick="renderAuth('register')">Regístrate</a></p>
        </div>
    </div>
`;

const UI_AUTH_REGISTER = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderLanding()">Inicio</button>
    </nav>
    <div class="auth-container">
        <div class="auth-box">
            <h2>Crear Cuenta</h2>
            <form onsubmit="handleRegister(event)">
                <div style="display:flex; gap:10px;">
                    <div class="form-group" style="width:50%;"><label>Nombre</label><input type="text" id="reg-nombre" required></div>
                    <div class="form-group" style="width:50%;"><label>Apellido</label><input type="text" id="reg-apellido" required></div>
                </div>
                <div class="form-group"><label>Correo</label><input type="email" id="reg-email" required></div>
                <div class="form-group"><label>Contraseña</label><input type="password" id="reg-pass" required></div>
                <div id="reg-msg" style="font-size:12px; margin-bottom:10px;"></div>
                <button type="submit" class="btn btn-primary" style="width:100%;">Registrarse</button>
            </form>
            <p style="text-align:center; font-size:12px; margin-top:15px;">¿Ya tienes cuenta? <a href="#" style="color:var(--accent-blue);" onclick="renderAuth('login')">Ingresa aquí</a></p>
        </div>
    </div>
`;

const UI_PRICING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="currentUserTier ? loadDashboard() : renderAuth('login')">
            ${currentUserTier ? 'Ir al Dashboard' : 'Ingresar'}
        </button>
    </nav>
    <main class="hero-section" style="padding-top: 60px;">
        <h1 style="font-size: 36px;">Paquetes</h1>
        <div class="grid-container" style="max-width: 900px; margin: 0 auto; text-align:left;">
            <div class="pricing-card">
                <h3>Aficionado</h3>
                <div class="price">$0<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Temporada Actual (2026)</li>
                    <li><i class="fa-solid fa-check"></i> Muestra de Circuitos (3)</li>
                    <li><i class="fa-solid fa-xmark"></i> Sin Análisis Histórico</li>
                    <li><i class="fa-solid fa-xmark"></i> Sin Telemetría por Sectores</li>
                </ul>
            </div>
            <div class="pricing-card pro">
                <h3>PRO</h3>
                <div class="price">$15<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Todo lo gratuito</li>
                    <li><i class="fa-solid fa-check"></i> Catálogo Completo (24 Circuitos)</li>
                    <li><i class="fa-solid fa-check"></i> Telemetría S1, S2, S3</li>
                    <li><i class="fa-solid fa-check"></i> Viaje en el tiempo (2023-2026)</li>
                </ul>
                <button class="btn btn-primary" style="width: 100%;" onclick="upgradeToPro()">Adquirir Plan PRO</button>
            </div>
        </div>
    </main>
`;

const UI_DASHBOARD = `
    <div class="dashboard-wrapper">
        <header class="dash-header">
            <div class="dash-title"><h2>F1 <span>Dashboard</span></h2><p>Bienvenido, <span id="user-name-display" style="color:var(--text-main); font-weight:bold;"></span></p></div>
            <div class="dash-controls">
                <div class="status-badge" id="aws-status"><div class="dot"></div><span id="aws-status-text">Conectando...</span></div>
                <div id="tier-badge" style="font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--bg-dark); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);"></div>
                <div id="upgrade-btn-container"></div>
                <button class="btn btn-outline" style="padding: 8px 15px;" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Salir</button>
            </div>
        </header>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('telemetry-view')"><i class="fa-solid fa-gauge-high"></i> Telemetría</button>
            <button class="tab-btn" onclick="switchTab('standings-view')"><i class="fa-solid fa-trophy"></i> Mundial</button>
            <button class="tab-btn" onclick="switchTab('circuits-view')"><i class="fa-solid fa-map"></i> Circuitos</button>
        </div>

        <div id="telemetry-view" class="view-content active">
            <div class="filters">
                <select id="tel-season" onchange="if(checkProAccess(this)) fetchTelemetryData();">
                    <option value="2026">Temporada 2026</option>
                    <option value="2025">Temporada 2025 (PRO)</option>
                    <option value="2024">Temporada 2024 (PRO)</option>
                    <option value="2023">Temporada 2023 (PRO)</option>
                </select>
                <select id="tel-circuit" onchange="fetchTelemetryData();" class="circuits-dropdown"></select>
                <select id="tel-session" onchange="fetchTelemetryData();">
                    <option value="race">Carrera</option><option value="qualifying">Clasificación</option><option value="sprint">Sprint</option><option value="fp2">Prácticas 2</option><option value="fp1">Prácticas 1</option>
                </select>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Pos</th><th>Piloto</th><th>Mejor Vuelta</th><th>Pits</th><th>Goma</th><th>Vel. Punta</th><th>S1</th><th>S2</th><th>S3</th></tr></thead>
                    <tbody id="telemetry-table-body"></tbody>
                </table>
            </div>
            <div id="telemetry-msg" style="display:none; text-align:center; padding:40px; color:var(--text-muted);"></div>
        </div>

        <div id="standings-view" class="view-content">
            <div class="filters">
                <select id="standings-season" onchange="if(checkProAccess(this)) fetchStandingsData();">
                    <option value="2026">Mundial 2026</option>
                    <option value="2025">Mundial 2025 (PRO)</option>
                    <option value="2024">Mundial 2024 (PRO)</option>
                    <option value="2023">Mundial 2023 (PRO)</option>
                </select>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Pos</th><th>Piloto</th><th>Puntos</th><th>Victorias</th><th>Podios</th><th>V. Rápidas</th></tr></thead>
                    <tbody id="standings-table-body"></tbody>
                </table>
            </div>
        </div>
        <div id="circuits-view" class="view-content"><div class="grid-container" id="circuits-grid-container"></div></div>
    </div>
`;

// ==========================================
// CONTROL DE VISTAS Y AUTENTICACIÓN
// ==========================================
const appRoot = () => document.getElementById('app-root');
function renderLanding() { appRoot().innerHTML = UI_LANDING; }
function renderPricing() { appRoot().innerHTML = UI_PRICING; }
function renderAuth(type) { appRoot().innerHTML = (type === 'login' ? UI_AUTH_LOGIN : UI_AUTH_REGISTER); }

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('reg-msg');
    btn.innerText = "Procesando...";
    const payload = { nombre: document.getElementById('reg-nombre').value, apellido: document.getElementById('reg-apellido').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-pass').value };
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        const data = await res.json();
        if(data.status === 'success') {
            msg.style.color = "var(--accent-green)"; msg.innerText = "¡Cuenta creada! Entrando...";
            setTimeout(() => { currentUserName = payload.nombre; currentUserTier = "Free"; loadDashboard(); }, 1000);
        } else { msg.style.color = "var(--f1-red)"; msg.innerText = data.message; btn.innerText = "Registrarse"; }
    } catch(err) { msg.style.color = "var(--f1-red)"; msg.innerText = "Error AWS DB."; btn.innerText = "Registrarse"; }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const errBox = document.getElementById('login-error');
    btn.innerText = "Validando...";
    const payload = { email: document.getElementById('log-email').value, password: document.getElementById('log-pass').value };
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        const data = await res.json();
        if(data.status === 'success') { currentUserName = data.nombre; currentUserTier = data.tier; loadDashboard(); } 
        else { errBox.style.display = "block"; errBox.innerText = data.message; btn.innerText = "Ingresar"; }
    } catch(err) { errBox.style.display = "block"; errBox.innerText = "Servidor AWS inalcanzable."; btn.innerText = "Ingresar"; }
}

function loadDashboard() {
    appRoot().innerHTML = UI_DASHBOARD;
    document.getElementById('user-name-display').innerText = currentUserName;
    
    const badge = document.getElementById('tier-badge');
    const upgrade = document.getElementById('upgrade-btn-container');

    if (currentUserTier === 'Free') {
        badge.innerHTML = 'Plan Gratuito';
        upgrade.innerHTML = `<button class="btn-upgrade" onclick="renderPricing()">Mejorar a PRO</button>`;
    } else {
        badge.innerHTML = '<i class="fa-solid fa-crown" style="color:var(--f1-red)"></i> Plan PRO';
        upgrade.innerHTML = '';
    }
    
    // Inyectar circuitos completos en el select
    const select = document.querySelector('.circuits-dropdown');
    const allRaces = [
        {val: "bahrain", txt: "Bahrain GP"}, {val: "saudi", txt: "Saudi Arabian GP"}, {val: "australia", txt: "Australian GP"}, {val: "japan", txt: "Japanese GP"},
        {val: "china", txt: "Chinese GP"}, {val: "miami", txt: "Miami GP"}, {val: "imola", txt: "Emilia Romagna GP"}, {val: "monaco", txt: "Monaco GP"},
        {val: "canada", txt: "Canadian GP"}, {val: "spain", txt: "Spanish GP"}, {val: "austria", txt: "Austrian GP"}, {val: "silverstone", txt: "British GP"},
        {val: "hungary", txt: "Hungarian GP"}, {val: "spa", txt: "Belgian GP"}, {val: "netherlands", txt: "Dutch GP"}, {val: "monza", txt: "Italian GP"},
        {val: "azerbaijan", txt: "Azerbaijan GP"}, {val: "singapore", txt: "Singapore GP"}, {val: "usa", txt: "United States GP"}, {val: "mexico", txt: "Mexico City GP"},
        {val: "interlagos", txt: "São Paulo GP"}, {val: "vegas", txt: "Las Vegas GP"}, {val: "qatar", txt: "Qatar GP"}, {val: "abudhabi", txt: "Abu Dhabi GP"}
    ];
    select.innerHTML = "";
    allRaces.forEach(c => select.innerHTML += `<option value="${c.val}">${c.txt}</option>`);

    fetchTelemetryData();
}

function upgradeToPro() {
    if(currentUserTier === 'Free') { alert("¡Plan mejorado a PRO en base de datos!"); currentUserTier = 'Pro'; loadDashboard(); } 
    else renderAuth('register');
}
function logout() { currentUserTier = null; currentUserName = ""; renderLanding(); }
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
// LÓGICA DE NEGOCIO Y PETICIONES A AWS
// ==========================================
function checkProAccess(selectElement) {
    if (currentUserTier === 'Free' && selectElement.value !== '2026') {
        alert("El análisis histórico (2023-2025) es exclusivo del Plan PRO. Mejora tu cuenta para viajar en el tiempo.");
        selectElement.value = '2026';
        return false;
    }
    return true;
}

function handleNetError(isError) {
    const badge = document.getElementById('aws-status');
    const text = document.getElementById('aws-status-text');
    const dot = badge ? badge.querySelector('.dot') : null;
    if(!badge || !text) return;
    
    if (isError) {
        badge.style.color = "var(--f1-red)"; badge.style.background = "rgba(225, 6, 0, 0.1)"; badge.style.borderColor = "rgba(225, 6, 0, 0.2)";
        if(dot) { dot.style.background = "var(--f1-red)"; dot.style.boxShadow = "0 0 8px var(--f1-red)"; }
        text.innerText = "Error Servidor AWS";
    } else {
        badge.style.color = "var(--accent-green)"; badge.style.background = "rgba(16,185,129,0.1)"; badge.style.borderColor = "rgba(16,185,129,0.2)";
        if(dot) { dot.style.background = "var(--accent-green)"; dot.style.boxShadow = "0 0 8px var(--accent-green)"; }
        text.innerText = "Conectado AWS";
    }
}

async function fetchTelemetryData() {
    const tbody = document.getElementById('telemetry-table-body');
    const tableContainer = document.querySelector('.table-container');
    const msgDiv = document.getElementById('telemetry-msg');
    const season = document.getElementById('tel-season').value;
    const circuit = document.getElementById('tel-circuit').value;
    const session = document.getElementById('tel-session').value;
    
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/telemetry?season=${season}&circuit=${circuit}&session=${session}`);
        const data = await res.json();
        handleNetError(false);

        if(data.status === "FUTURE" || data.status === "NO_SPRINT") {
            tableContainer.style.display = "none"; msgDiv.style.display = "block";
            msgDiv.innerHTML = `<i class="fa-solid fa-calendar-xmark" style="font-size:30px; margin-bottom:15px; color:var(--text-muted)"></i><br>Evento no disponible o formato inválido.`;
            return;
        }

        tableContainer.style.display = "block"; msgDiv.style.display = "none";
        tbody.innerHTML = "";
        
        const isFree = (currentUserTier === 'Free');
        const lock = `<span style="color:var(--f1-red); font-size:11px;"><i class="fa-solid fa-lock"></i> PRO</span>`;

        data.data.forEach(row => {
            let pb = row.pos === 1 ? `<span class="rank-gold">1</span>` : `<span class="rank-normal">${row.pos}</span>`;
            tbody.innerHTML += `
                <tr>
                    <td>${pb}</td>
                    <td><span class="driver-name">${row.driver}</span><span class="team-name">${row.team}</span></td>
                    <td class="mono" style="color:var(--text-main); font-weight:700;">${row.best_lap}</td>
                    <td class="mono">${row.pits}</td>
                    <td>${row.tyre}</td>
                    <td class="mono">${isFree ? lock : row.top_speed}</td>
                    <td class="mono">${isFree ? lock : row.s1}</td>
                    <td class="mono">${isFree ? lock : row.s2}</td>
                    <td class="mono">${isFree ? lock : row.s3}</td>
                </tr>
            `;
        });
    } catch (err) {
        handleNetError(true);
        tableContainer.style.display = "block"; msgDiv.style.display = "none";
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--f1-red);">Fallo EC2</td></tr>`;
    }
}

async function fetchStandingsData() {
    const tbody = document.getElementById('standings-table-body');
    const season = document.getElementById('standings-season').value;
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/standings?season=${season}`);
        const data = await res.json();
        handleNetError(false);
        tbody.innerHTML = "";
        data.standings.forEach(row => {
            let r = row.rank === 1 ? `<span class="rank-gold"><i class="fa-solid fa-trophy"></i></span>` : `<span class="rank-normal">${row.rank}</span>`;
            tbody.innerHTML += `<tr><td>${r}</td><td><span class="driver-name">${row.driver}</span></td><td class="mono">${row.points}</td><td class="mono">${row.wins}</td><td class="mono">${row.podiums}</td><td class="mono">${row.fast_laps}</td></tr>`;
        });
    } catch (err) { handleNetError(true); }
}

async function fetchCircuitsData() {
    const grid = document.getElementById('circuits-grid-container');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/circuits`);
        let data = await res.json();
        handleNetError(false);
        
        // RESTRICCIÓN COMERCIAL: El usuario Gratis solo ve los primeros 3 circuitos
        if (currentUserTier === 'Free') {
            data = data.slice(0, 3);
        }

        grid.innerHTML = "";
        data.forEach(c => {
            grid.innerHTML += `<div class="card"><img src="${c.image}"><h3>${c.name}</h3><p>${c.location}</p></div>`;
        });

        // Inyectamos la tarjeta de promoción si es Gratis
        if (currentUserTier === 'Free') {
            grid.innerHTML += `
                <div class="card" style="display:flex; flex-direction:column; justify-content:center; border-color:var(--f1-red); background:rgba(225,6,0,0.05);">
                    <i class="fa-solid fa-lock" style="font-size:30px; color:var(--f1-red); margin-bottom:15px;"></i>
                    <h3 style="color:var(--f1-red);">21 Circuitos Restantes</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin-bottom:15px;">Disponibles en el Catálogo Histórico del Plan PRO.</p>
                    <button class="btn btn-primary" onclick="renderPricing()">Desbloquear PRO</button>
                </div>
            `;
        }

    } catch (err) { handleNetError(true); }
}

document.addEventListener('contextmenu', e => e.preventDefault()); 
document.onkeydown = function(e) { if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey) || (e.ctrlKey && e.keyCode === 85)) return false; };
document.addEventListener('DOMContentLoaded', () => { renderLanding(); });