// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
let currentUserTier = null; 
let currentUserName = "";
// IMPORTANTE: Si Render bloquea tu IP por HTTPS, cambia temporalmente tu url a HTTP para la presentación local, o asegúrate de tener un SSL en Nginx en AWS.
const SECURE_AWS_URL = "http://telemetria-f1.duckdns.org:5000"; 

// ==========================================
// VISTAS HTML
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
        <p>Plataforma de análisis SaaS para ingenieros y fanáticos. Telemetría directa, tiempos por sector y estadísticas históricas de la FIA, procesadas en la nube.</p>
        <button class="btn btn-primary" style="font-size: 16px; padding: 15px 30px; margin-bottom: 50px;" onclick="renderAuth('register')">Comenzar Gratis</button>
        
        <div style="max-width: 1000px; margin: 0 auto; padding-top: 40px; border-top: 1px solid var(--border-color);">
            <h2 style="font-size: 28px; margin-bottom: 40px;">Arquitectura de Grado Empresarial</h2>
            <div class="hero-features">
                <div class="feature-item">
                    <i class="fa-solid fa-chart-line"></i>
                    <h3>Análisis Histórico</h3>
                    <p>Accede a todos los campeonatos y clasificaciones desde la temporada 2023 en adelante.</p>
                </div>
                <div class="feature-item">
                    <i class="fa-solid fa-stopwatch"></i>
                    <h3>Tiempos por Sector</h3>
                    <p>Desglose milimétrico de sectores (S1, S2, S3) y métricas de velocidad punta exclusivas.</p>
                </div>
                <div class="feature-item">
                    <i class="fa-solid fa-server"></i>
                    <h3>Core AWS Integrado</h3>
                    <p>Bases de datos relacionales alojadas en EC2 para alta disponibilidad y baja latencia.</p>
                </div>
            </div>
        </div>
    </main>
    <footer style="text-align:center; padding: 40px; border-top: 1px solid var(--border-color); color: var(--text-muted); font-size: 12px;">
        &copy; 2026 F1 Telemetry Analytics. Sistema de Información Multi-Cloud. Todos los derechos reservados.
    </footer>
`;

const UI_AUTH_LOGIN = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderLanding()">Volver al Inicio</button>
    </nav>
    <div class="auth-container">
        <div class="auth-box">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa a tu panel de control</p>
            <form id="login-form" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="log-email" placeholder="usuario@correo.com" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="log-pass" placeholder="••••••••" required>
                </div>
                <div id="login-error" style="color: var(--f1-red); font-size: 12px; margin-bottom: 10px; display:none;"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Ingresar al Sistema</button>
            </form>
            <p style="text-align:center; margin-top: 20px; font-size:12px;">¿No tienes cuenta? <a href="#" style="color:var(--accent-blue);" onclick="renderAuth('register')">Regístrate aquí</a></p>
        </div>
    </div>
`;

const UI_AUTH_REGISTER = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="renderLanding()">Volver al Inicio</button>
    </nav>
    <div class="auth-container">
        <div class="auth-box">
            <h2>Crear Cuenta</h2>
            <p>Únete a la plataforma de telemetría</p>
            <form id="register-form" onsubmit="handleRegister(event)">
                <div style="display:flex; gap:10px;">
                    <div class="form-group" style="width:50%;">
                        <label>Nombre</label>
                        <input type="text" id="reg-nombre" placeholder="Ej. Carlos" required>
                    </div>
                    <div class="form-group" style="width:50%;">
                        <label>Apellido</label>
                        <input type="text" id="reg-apellido" placeholder="Ej. Sainz" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="reg-email" placeholder="usuario@correo.com" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="reg-pass" placeholder="Mínimo 6 caracteres" required>
                </div>
                <div id="reg-msg" style="font-size: 12px; margin-bottom: 10px;"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Registrarse</button>
            </form>
            <p style="text-align:center; margin-top: 20px; font-size:12px;">¿Ya tienes cuenta? <a href="#" style="color:var(--accent-blue);" onclick="renderAuth('login')">Inicia sesión</a></p>
        </div>
    </div>
`;

const UI_PRICING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()">F1 <span>Telemetry</span></div>
        <div class="nav-links">
            <button class="btn btn-outline" style="padding: 8px 16px;" onclick="currentUserTier ? loadDashboard() : renderAuth('login')">
                ${currentUserTier ? 'Volver al Dashboard' : 'Ingresar'}
            </button>
        </div>
    </nav>
    <main class="hero-section" style="padding-top: 60px;">
        <h1 style="font-size: 36px;">Paquetes de Suscripción</h1>
        <p>Potencia tu análisis con datos desbloqueados.</p>
        
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
                <button class="btn btn-outline" style="width: 100%;" onclick="renderAuth('register')">Obtener Gratis</button>
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
                    <div class="dot"></div>
                    <span id="aws-status-text">Conectando...</span>
                </div>
                <div id="tier-badge" style="font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--bg-dark); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);"></div>
                
                <div id="upgrade-btn-container"></div>
                
                <button class="btn btn-outline" style="padding: 8px 15px;" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</button>
            </div>
        </header>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('telemetry-view')"><i class="fa-solid fa-gauge-high"></i> Telemetría de Carrera</button>
            <button class="tab-btn" onclick="switchTab('standings-view')"><i class="fa-solid fa-trophy"></i> Mundial de Pilotos</button>
            <button class="tab-btn" onclick="switchTab('circuits-view')"><i class="fa-solid fa-map"></i> Circuitos FIA</button>
        </div>

        <div id="telemetry-view" class="view-content active">
            <div class="filters">
                <select id="tel-season" onchange="fetchTelemetryData();">
                    <option value="2026">Temporada 2026</option>
                    <option value="2025">Temporada 2025</option>
                </select>
                <select id="tel-circuit" onchange="fetchTelemetryData();">
                    <option value="bahrain">Bahrain GP</option>
                    <option value="miami">Miami GP</option>
                </select>
                <select id="tel-session" onchange="fetchTelemetryData();">
                    <option value="race">Carrera (Race)</option>
                    <option value="qualifying">Clasificación (Q)</option>
                </select>
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

        <div id="standings-view" class="view-content">
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

        <div id="circuits-view" class="view-content">
            <div class="grid-container" id="circuits-grid-container"></div>
        </div>
    </div>
`;

// ==========================================
// FUNCIONES DE CONTROL
// ==========================================
const appRoot = () => document.getElementById('app-root');

function renderLanding() { appRoot().innerHTML = UI_LANDING; }
function renderPricing() { appRoot().innerHTML = UI_PRICING; }

function renderAuth(type) {
    if (type === 'login') appRoot().innerHTML = UI_AUTH_LOGIN;
    else appRoot().innerHTML = UI_AUTH_REGISTER;
}

// LÓGICA CONEXIÓN BASE DE DATOS
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
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            msg.style.color = "var(--accent-green)";
            msg.innerText = "Cuenta creada exitosamente. Iniciando sesión...";
            setTimeout(() => {
                currentUserName = payload.nombre;
                currentUserTier = "Free";
                loadDashboard();
            }, 1500);
        } else {
            msg.style.color = "var(--f1-red)";
            msg.innerText = data.message;
            btn.innerText = "Registrarse";
        }
    } catch(err) {
        msg.style.color = "var(--f1-red)";
        msg.innerText = "Error de conexión con AWS DB.";
        btn.innerText = "Registrarse";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const errBox = document.getElementById('login-error');
    btn.innerText = "Validando...";
    
    const payload = {
        email: document.getElementById('log-email').value,
        password: document.getElementById('log-pass').value
    };

    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            currentUserName = data.nombre;
            currentUserTier = data.tier;
            loadDashboard();
        } else {
            errBox.style.display = "block";
            errBox.innerText = data.message;
            btn.innerText = "Ingresar al Sistema";
        }
    } catch(err) {
        errBox.style.display = "block";
        errBox.innerText = "Error al contactar el servidor AWS.";
        btn.innerText = "Ingresar al Sistema";
    }
}

function loadDashboard() {
    appRoot().innerHTML = UI_DASHBOARD;
    document.getElementById('user-name-display').innerText = currentUserName;
    
    const badge = document.getElementById('tier-badge');
    const upgradeContainer = document.getElementById('upgrade-btn-container');

    if (currentUserTier === 'Free') {
        badge.innerHTML = 'Plan Aficionado (Gratis)';
        upgradeContainer.innerHTML = `<button class="btn-upgrade" onclick="renderPricing()"><i class="fa-solid fa-rocket"></i> Mejorar Plan</button>`;
    } else {
        badge.innerHTML = '<i class="fa-solid fa-crown" style="color:var(--f1-red)"></i> Plan Director (PRO)';
        upgradeContainer.innerHTML = '';
    }

    fetchTelemetryData();
}

function upgradeToPro() {
    if(currentUserTier === 'Free') {
        alert("Pago procesado. Tu cuenta es ahora PRO.");
        currentUserTier = 'Pro';
        loadDashboard();
    } else {
        renderAuth('register');
    }
}

function logout() {
    currentUserTier = null;
    currentUserName = "";
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

function handleNetError(isError) {
    const statusText = document.getElementById('aws-status-text');
    const badge = document.getElementById('aws-status');
    const dot = badge.querySelector('.dot');
    if(!badge) return;
    
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
            msgDiv.innerHTML = `<i class="fa-solid fa-calendar-xmark" style="font-size:30px; margin-bottom:15px; color:var(--text-muted)"></i><br>Evento no disponible.`;
            return;
        }

        tableContainer.style.display = "block";
        msgDiv.style.display = "none";
        tbody.innerHTML = "";
        
        const isFree = currentUserTier === 'Free';
        const lockHtml = `<span class="locked-cell" title="Mejora a PRO"><i class="fa-solid fa-lock"></i> PRO</span>`;

        data.data.forEach(row => {
            let posBadge = row.pos === 1 ? `<span class="rank-gold">1</span>` : `<span class="rank-normal">${row.pos}</span>`;
            tbody.innerHTML += `
                <tr>
                    <td>${posBadge}</td>
                    <td><span class="driver-name">${row.driver}</span><span class="team-name">${row.team}</span></td>
                    <td class="mono" style="color:var(--text-main); font-weight:700;">${row.best_lap}</td>
                    <td class="mono">${row.pits}</td>
                    <td>${row.tyre}</td>
                    <!-- Si es cuenta gratuita, solo la celda se bloquea -->
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
    const tbody = document.getElementById('standings-table-body');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/standings`);
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
    }
}

async function fetchCircuitsData() {
    const grid = document.getElementById('circuits-grid-container');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/circuits`);
        const data = await res.json();
        handleNetError(false);
        grid.innerHTML = "";
        data.forEach(circuit => {
            grid.innerHTML += `
                <div class="card">
                    <img src="${circuit.image}" alt="${circuit.name}">
                    <h3>${circuit.name}</h3>
                    <p style="margin:5px 0 15px 0; font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${circuit.location}</p>
                    <div style="background:rgba(0,0,0,0.5); padding:10px; border-radius:8px;">
                        <span style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Longitud</span>
                        <span class="mono" style="font-size:13px; font-weight:700; margin-left:5px;">${circuit.length}</span>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        handleNetError(true);
    }
}

// ANTI-INSPECCIÓN
document.addEventListener('contextmenu', e => e.preventDefault()); 
document.onkeydown = function(e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey) || (e.ctrlKey && e.keyCode === 85)) return false; 
};

// INICIALIZADOR
document.addEventListener('DOMContentLoaded', () => {
    renderLanding();
});