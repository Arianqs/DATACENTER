// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
let currentUserTier = null; 
let currentUserName = "";
// URL RESTAURADA A TU DUCKDNS SEGURO ORIGINAL
const SECURE_AWS_URL = "https://telemetria-f1.duckdns.org"; 

// ==========================================
// VISTAS HTML INYECTADAS
// ==========================================
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
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="log-email" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="log-pass" required>
                </div>
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
                    <div class="form-group" style="width:50%;">
                        <label>Nombre</label><input type="text" id="reg-nombre" required>
                    </div>
                    <div class="form-group" style="width:50%;">
                        <label>Apellido</label><input type="text" id="reg-apellido" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Correo</label><input type="email" id="reg-email" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label><input type="password" id="reg-pass" required>
                </div>
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
                    <li><i class="fa-solid fa-check"></i> Clasificación Mundial</li>
                    <li><i class="fa-solid fa-xmark"></i> Sin Telemetría por Sectores</li>
                </ul>
            </div>
            <div class="pricing-card pro">
                <h3>PRO</h3>
                <div class="price">$15<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Todo lo gratuito</li>
                    <li><i class="fa-solid fa-check"></i> Telemetría S1, S2, S3</li>
                    <li><i class="fa-solid fa-check"></i> Velocidades Puntas</li>
                </ul>
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
                <p>Bienvenido, <span id="user-name-display" style="color:var(--text-main); font-weight:bold;"></span></p>
            </div>
            <div class="dash-controls">
                <div class="status-badge" id="aws-status">
                    <div class="dot"></div><span id="aws-status-text">Conectando...</span>
                </div>
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
                <select id="tel-season" onchange="fetchTelemetryData();">
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                </select>
                <select id="tel-circuit" onchange="fetchTelemetryData();">
                    <option value="bahrain">Bahrain GP</option>
                    <option value="miami">Miami GP</option>
                </select>
                <select id="tel-session" onchange="fetchTelemetryData();">
                    <option value="race">Carrera</option>
                    <option value="qualifying">Clasificación</option>
                </select>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>Pos</th><th>Piloto</th><th>Mejor Vuelta</th><th>Pits</th><th>Goma</th><th>Vel. Punta</th><th>S1</th><th>S2</th><th>S3</th></tr>
                    </thead>
                    <tbody id="telemetry-table-body"></tbody>
                </table>
            </div>
            <div id="telemetry-msg" style="display:none; text-align:center; padding:40px; color:var(--text-muted);"></div>
        </div>

        <div id="standings-view" class="view-content">
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
// FUNCIONES LÓGICAS
// ==========================================
const appRoot = () => document.getElementById('app-root');

function renderLanding() { appRoot().innerHTML = UI_LANDING; }
function renderPricing() { appRoot().innerHTML = UI_PRICING; }
function renderAuth(type) {
    if (type === 'login') appRoot().innerHTML = UI_AUTH_LOGIN;
    else appRoot().innerHTML = UI_AUTH_REGISTER;
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('reg-msg');
    btn.innerText = "Procesando...";
    
    const payload = {
        nombre: document.getElementById('reg-nombre').value,
        apellido: document.getElementById('reg-apellido').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-pass').value
    };

    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/register`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.status === 'success') {
            msg.style.color = "var(--accent-green)";
            msg.innerText = "¡Cuenta creada! Entrando...";
            setTimeout(() => {
                currentUserName = payload.nombre;
                currentUserTier = "Free";
                loadDashboard();
            }, 1000);
        } else {
            msg.style.color = "var(--f1-red)";
            msg.innerText = data.message;
            btn.innerText = "Registrarse";
        }
    } catch(err) {
        msg.style.color = "var(--f1-red)";
        msg.innerText = "Error AWS DB.";
        btn.innerText = "Registrarse";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const errBox = document.getElementById('login-error');
    btn.innerText = "Validando...";
    
    const payload = { email: document.getElementById('log-email').value, password: document.getElementById('log-pass').value };

    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/login`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.status === 'success') {
            currentUserName = data.nombre;
            currentUserTier = data.tier;
            loadDashboard();
        } else {
            errBox.style.display = "block";
            errBox.innerText = data.message;
            btn.innerText = "Ingresar";
        }
    } catch(err) {
        errBox.style.display = "block";
        errBox.innerText = "Servidor AWS inalcanzable.";
        btn.innerText = "Ingresar";
    }
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
    fetchTelemetryData();
}

function upgradeToPro() {
    if(currentUserTier === 'Free') {
        alert("¡Plan mejorado a PRO en base de datos!");
        currentUserTier = 'Pro';
        loadDashboard();
    } else renderAuth('register');
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

async function fetchTelemetryData() {
    const tbody = document.getElementById('telemetry-table-body');
    const season = document.getElementById('tel-season').value;
    const circuit = document.getElementById('tel-circuit').value;
    const session = document.getElementById('tel-session').value;
    
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/telemetry?season=${season}&circuit=${circuit}&session=${session}`);
        const data = await res.json();
        
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
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--f1-red);">Fallo EC2</td></tr>`;
    }
}

async function fetchStandingsData() {
    const tbody = document.getElementById('standings-table-body');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/standings`);
        const data = await res.json();
        tbody.innerHTML = "";
        data.standings.forEach(row => {
            let r = row.rank === 1 ? `<span class="rank-gold"><i class="fa-solid fa-trophy"></i></span>` : `<span class="rank-normal">${row.rank}</span>`;
            tbody.innerHTML += `<tr><td>${r}</td><td><span class="driver-name">${row.driver}</span></td><td class="mono">${row.points}</td><td class="mono">${row.wins}</td><td class="mono">${row.podiums}</td><td class="mono">${row.fast_laps}</td></tr>`;
        });
    } catch (err) {}
}

async function fetchCircuitsData() {
    const grid = document.getElementById('circuits-grid-container');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/circuits`);
        const data = await res.json();
        grid.innerHTML = "";
        data.forEach(c => {
            grid.innerHTML += `<div class="card"><img src="${c.image}"><h3>${c.name}</h3><p>${c.location}</p></div>`;
        });
    } catch (err) {}
}

document.addEventListener('contextmenu', e => e.preventDefault()); 
document.onkeydown = function(e) { if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey) || (e.ctrlKey && e.keyCode === 85)) return false; };
document.addEventListener('DOMContentLoaded', () => { renderLanding(); });