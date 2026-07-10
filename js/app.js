// ==========================================
// ESTADO DE LA APLICACIÓN Y SESIÓN
// ==========================================
let currentUserTier = sessionStorage.getItem('f1_tier') || null; 
let currentUserName = sessionStorage.getItem('f1_name') || "";
let currentUserEmail = sessionStorage.getItem('f1_email') || ""; 
const SECURE_AWS_URL = "https://telemetria-f1.duckdns.org"; 

let inactivityTimer;
function resetTimer() {
    clearTimeout(inactivityTimer);
    if (currentUserTier) {
        inactivityTimer = setTimeout(() => { logout(); }, 5 * 60 * 1000); 
    }
}
window.onload = resetTimer; document.onmousemove = resetTimer; document.onkeypress = resetTimer; document.ontouchstart = resetTimer;

// ==========================================
// VISTAS HTML PRINCIPALES
// ==========================================
const UI_LANDING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()"><img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"> <span>Telemetry</span></div>
        <div class="nav-links">
            <a class="nav-link" onclick="renderPricing()">Paquetes</a>
            <button class="btn btn-outline" style="padding: 8px 16px;" onclick="openAuthModal('login')">Ingresar</button>
            <button class="btn btn-primary" style="padding: 8px 16px;" onclick="openAuthModal('register')">Registrarse</button>
        </div>
    </nav>
    <main class="hero-section">
        <h1>Domina la pista con datos precisos</h1>
        <p>La suite definitiva para analistas de Fórmula 1. Accede a datos en tiempo real, compara rendimientos por sector y domina la estrategia de carrera con información directa de la pista.</p>
        <button class="btn btn-primary" style="font-size: 16px; padding: 15px 30px;" onclick="openAuthModal('register')">Comenzar Gratis</button>
        <div class="hero-features">
            <div class="feature-item"><i class="fa-solid fa-chart-line"></i><h3>Análisis Histórico</h3><p>Accede a todos los campeonatos y clasificaciones desde la temporada 2023 en adelante.</p></div>
            <div class="feature-item"><i class="fa-solid fa-stopwatch"></i><h3>Tiempos por Sector</h3><p>Desglose milimétrico de sectores S1, S2, S3 y comparativas de velocidad punta.</p></div>
            <div class="feature-item"><i class="fa-solid fa-flag-checkered"></i><h3>Estrategia de Carrera</h3><p>Monitoreo detallado de paradas en pits, selección de compuestos (neumáticos) y ventajas tácticas.</p></div>
        </div>
    </main>

    <section>
        <h2 class="section-title">Pilotos <span>Destacados 2026</span></h2>
        <div class="drivers-grid">
            <div class="driver-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Max_Verstappen_2017_Malaysia_3.jpg/400px-Max_Verstappen_2017_Malaysia_3.jpg" class="driver-img" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="driver-info"><h3>Max Verstappen</h3><p>Red Bull Racing</p></div></div>
            <div class="driver-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Charles_Leclerc_2019_Test.jpg/400px-Charles_Leclerc_2019_Test.jpg" class="driver-img" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="driver-info"><h3>Charles Leclerc</h3><p>Scuderia Ferrari</p></div></div>
            <div class="driver-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Lando_Norris_2019_Test.jpg/400px-Lando_Norris_2019_Test.jpg" class="driver-img" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="driver-info"><h3>Lando Norris</h3><p>McLaren F1 Team</p></div></div>
            <div class="driver-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/George_Russell_2019_Test.jpg/400px-George_Russell_2019_Test.jpg" class="driver-img" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="driver-info"><h3>George Russell</h3><p>Mercedes AMG</p></div></div>
        </div>
    </section>

    <section style="margin-top: 50px;">
        <h2 class="section-title">Circuitos <span>Emblemáticos</span></h2>
        <div class="circuits-preview">
            <!-- FOTOS PANORÁMICAS GARANTIZADAS Y DE ALTA CALIDAD -->
            <div class="circuit-item"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Monaco_Grand_Prix_2010.jpg/800px-Monaco_Grand_Prix_2010.jpg" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="circuit-overlay"><h4>GP Mónaco</h4></div></div>
            <div class="circuit-item"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Monza_start_2003.jpg/800px-Monza_start_2003.jpg" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="circuit-overlay"><h4>GP Monza</h4></div></div>
            <div class="circuit-item"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/F1_2013_Spa_start.jpg/800px-F1_2013_Spa_start.jpg" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="circuit-overlay"><h4>GP Spa-Francorchamps</h4></div></div>
            <div class="circuit-item"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Singapore_Grand_Prix_2011.jpg/800px-Singapore_Grand_Prix_2011.jpg" crossorigin="anonymous" referrerpolicy="no-referrer"><div class="circuit-overlay"><h4>GP Singapur (Nocturno)</h4></div></div>
        </div>
    </section>

    <footer class="full-footer">
        <div class="footer-grid">
            <div class="footer-col"><div class="brand-logo" style="margin-bottom:15px;"><img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"> <span>Telemetry</span></div><p style="color:var(--text-muted); font-size:13px; line-height:1.6;">Plataforma líder en análisis de datos y tiempos por sector de la máxima categoría del automovilismo.</p></div>
            <div class="footer-col"><h4>Plataforma</h4><ul><li><a onclick="renderPricing()">Precios y Planes</a></li><li><a onclick="openAuthModal('register')">Crear Cuenta Gratis</a></li><li><a onclick="openAuthModal('login')">Ingresar al Sistema</a></li></ul></div>
            <div class="footer-col"><h4>Soporte Técnico</h4><ul><li><a>Documentación API</a></li><li><a>Estado del Servidor (AWS)</a></li><li><a>Contacto Ingeniería</a></li></ul></div>
            <div class="footer-col"><h4>Legal</h4><ul><li><a>Términos de Servicio</a></li><li><a>Política de Privacidad</a></li><li><a>Uso de Cookies</a></li></ul></div>
        </div>
        <div class="footer-bottom">&copy; 2026 F1 Telemetry Analytics. Proyecto Académico Multi-Cloud.</div>
    </footer>
`;

const UI_PRICING = `
    <nav class="landing-navbar">
        <div class="brand-logo" onclick="renderLanding()"><img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"> <span>Telemetry</span></div>
        <button class="btn btn-outline" onclick="currentUserTier ? loadDashboard() : openAuthModal('login')">${currentUserTier ? 'Ir al Dashboard' : 'Ingresar'}</button>
    </nav>
    <main class="hero-section" style="padding-top: 120px; min-height: 80vh; background:none;">
        <h1 style="font-size: 36px;">Paquetes de Suscripción</h1>
        <div class="grid-container" style="max-width: 900px; margin: 0 auto; text-align:left;">
            <div class="pricing-card">
                <h3>Aficionado</h3><div class="price">$0<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Temporada Actual (2026)</li>
                    <li><i class="fa-solid fa-check"></i> Parrilla Limitada (Top 5)</li>
                    <li><i class="fa-solid fa-xmark" style="color:var(--f1-red)"></i> Sin Análisis Histórico</li>
                    <li><i class="fa-solid fa-xmark" style="color:var(--f1-red)"></i> Funciones de Perfil Bloqueadas</li>
                </ul>
            </div>
            <div class="pricing-card pro">
                <div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); background:var(--f1-red); color:#fff; font-size:11px; font-weight:700; padding:5px 15px; border-radius:20px;">MÁS ELEGIDO</div>
                <h3>PRO</h3><div class="price">$15<span>/mes</span></div>
                <ul>
                    <li><i class="fa-solid fa-check"></i> Todo lo gratuito</li>
                    <li><i class="fa-solid fa-check"></i> Parrilla Completa (20 Pilotos)</li>
                    <li><i class="fa-solid fa-check"></i> Telemetría S1, S2, S3</li>
                    <li><i class="fa-solid fa-check"></i> Viaje en el tiempo (2023-2026)</li>
                </ul>
                <button class="btn btn-primary" style="width: 100%;" onclick="processUpgrade()">Adquirir Plan PRO</button>
            </div>
        </div>
    </main>
`;

const UI_DASHBOARD = `
    <nav class="landing-navbar">
        <div class="brand-logo"><img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"> <span>Telemetry</span></div>
        <div class="dash-controls">
            <div class="status-badge" id="aws-status"><div class="dot"></div><span id="aws-status-text">Conectando...</span></div>
            <div id="tier-badge" style="font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--bg-dark); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);"></div>
            <div id="upgrade-btn-container"></div>
            <!-- BOTÓN DE AJUSTES MOVIDO ARRIBA -->
            <button class="btn btn-outline" style="padding: 8px 15px;" onclick="openSettingsModal()" title="Ajustes de Perfil"><i class="fa-solid fa-gear"></i></button>
            <button class="btn btn-outline" style="padding: 8px 15px;" onclick="logout()" title="Salir"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
    </nav>
    <div class="dashboard-wrapper">
        <header class="dash-header" style="margin-top:20px;">
            <div class="dash-title"><h2>F1 <span>Dashboard</span></h2><p>Sesión activa: <span id="user-name-display" style="color:var(--text-main); font-weight:bold;"></span></p></div>
        </header>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('telemetry-view')"><i class="fa-solid fa-gauge-high"></i> Telemetría</button>
            <button class="tab-btn" onclick="switchTab('standings-view')"><i class="fa-solid fa-trophy"></i> Mundial</button>
            <button class="tab-btn" onclick="switchTab('circuits-view')"><i class="fa-solid fa-map"></i> Circuitos</button>
        </div>

        <div id="telemetry-view" class="view-content active">
            <div class="filters">
                <i class="fa-solid fa-filter" style="color:var(--text-muted); margin-right:5px;"></i>
                <select id="tel-season" onchange="if(checkProAccess(this)) fetchTelemetryData();"></select>
                <select id="tel-circuit" onchange="fetchTelemetryData();" class="circuits-dropdown"></select>
                <select id="tel-session" onchange="fetchTelemetryData();">
                    <option value="race">🏁 Carrera</option>
                    <option value="qualifying">⏱️ Clasificación</option>
                    <option value="sprint">⚡ Sprint</option>
                    <option value="fp2">🔧 Prácticas 2</option>
                    <option value="fp1">🔧 Prácticas 1</option>
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
                <i class="fa-solid fa-filter" style="color:var(--text-muted); margin-right:5px;"></i>
                <select id="standings-season" onchange="if(checkProAccess(this)) fetchStandingsData();"></select>
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
// SISTEMA DE MODALES Y AJUSTES SAAS
// ==========================================
const appRoot = () => document.getElementById('app-root');

function renderLanding() { appRoot().innerHTML = UI_LANDING; }
function renderPricing() { appRoot().innerHTML = UI_PRICING; }

function openAuthModal(type) {
    closeModal(); 
    const modalHtml = `<div id="dynamic-modal" class="modal-overlay" onclick="closeModalOnOutside(event)"><div class="modal-box"><i class="fa-solid fa-xmark modal-close" onclick="closeModal()"></i>${type === 'login' ? getLoginForm() : getRegisterForm()}</div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// PANEL DE AJUSTES INTERACTIVO Y LIMITADO
function openSettingsModal() {
    closeModal();
    let isPro = currentUserTier === 'Pro';
    let lockAttr = isPro ? "" : "disabled title='Función exclusiva del Plan PRO'";
    let lockIcon = isPro ? "" : `<i class="fa-solid fa-lock" style="color:var(--f1-red); font-size:10px; margin-left:5px;"></i>`;
    
    let subInfo = isPro 
        ? `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(225,6,0,0.1); border:1px solid rgba(225,6,0,0.3); padding:15px; border-radius:8px; margin-top:20px;">
            <div><strong style="color:var(--f1-red);"><i class="fa-solid fa-crown"></i> Licencia PRO</strong><br><span style="font-size:12px; color:var(--text-muted);">Renovación automática activada</span></div>
            <button class="btn btn-outline" style="color:var(--f1-red); border-color:var(--f1-red); padding:8px 12px; font-size:12px;" onclick="cancelProPlan()">Cancelar Plan</button>
           </div>`
        : `<div style="text-align:center; background:rgba(255,255,255,0.05); padding:20px; border-radius:8px; margin-top:20px;">
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:15px;">Estás en el plan gratuito limitado.</p>
            <button class="btn btn-primary" style="width:100%;" onclick="closeModal(); renderPricing()"><i class="fa-solid fa-crown"></i> Mejorar a PRO</button>
           </div>`;

    const modalHtml = `
        <div id="dynamic-modal" class="modal-overlay" onclick="closeModalOnOutside(event)">
            <div class="modal-box settings-modal">
                <i class="fa-solid fa-xmark modal-close" onclick="closeModal()"></i>
                <h2><i class="fa-solid fa-user-gear"></i> Ajustes de Perfil</h2>
                <form onsubmit="saveSettings(event)">
                    <div class="two-col">
                        <div class="form-group"><label>Nombre</label><input type="text" id="set-name" value="${currentUserName}" required></div>
                        <div class="form-group"><label>Apellido</label><input type="text" value="Usuario"></div>
                    </div>
                    <div class="two-col">
                        <div class="form-group"><label>Nombre de Usuario ${lockIcon}</label><input type="text" value="@${currentUserName.toLowerCase()}" ${lockAttr}></div>
                        <div class="form-group"><label>Celular ${lockIcon}</label><input type="tel" placeholder="+51 999 999 999" ${lockAttr}></div>
                    </div>
                    <div class="form-group"><label>Correo Electrónico (No editable)</label><input type="email" value="${currentUserEmail}" disabled></div>
                    <div class="form-group"><label>Nueva Contraseña</label><input type="password" placeholder="Dejar en blanco para no cambiar"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Guardar Cambios</button>
                </form>
                ${subInfo}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function saveSettings(e) {
    e.preventDefault();
    let newName = document.getElementById('set-name').value;
    currentUserName = newName; sessionStorage.setItem('f1_name', currentUserName);
    showCustomAlert("¡Guardado!", "Tus datos han sido actualizados.", "success");
    loadDashboard();
}

function getLoginForm() { return `<h2>Iniciar Sesión</h2><p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">Ingresa a tu panel</p><form onsubmit="handleLogin(event)"><div class="form-group"><label>Correo</label><input type="email" id="log-email" required></div><div class="form-group"><label>Contraseña</label><input type="password" id="log-pass" required></div><div id="auth-error" style="color:var(--f1-red); font-size:12px; margin-bottom:10px; display:none;"></div><button type="submit" class="btn btn-primary" style="width:100%;">Ingresar</button></form><p style="text-align:center; font-size:12px; margin-top:15px;">¿Nuevo? <a href="#" style="color:var(--accent-blue);" onclick="openAuthModal('register')">Regístrate</a></p>`; }
function getRegisterForm() { return `<h2>Crear Cuenta</h2><p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">Únete a la plataforma</p><form onsubmit="handleRegister(event)"><div style="display:flex; gap:10px;"><div class="form-group" style="width:50%;"><label>Nombre</label><input type="text" id="reg-nombre" required></div><div class="form-group" style="width:50%;"><label>Apellido</label><input type="text" id="reg-apellido" required></div></div><div class="form-group"><label>Correo</label><input type="email" id="reg-email" required></div><div class="form-group"><label>Contraseña</label><input type="password" id="reg-pass" required></div><div id="auth-error" style="font-size:12px; margin-bottom:10px; display:none;"></div><button type="submit" class="btn btn-primary" style="width:100%;">Registrarse</button></form><p style="text-align:center; font-size:12px; margin-top:15px;">¿Ya tienes cuenta? <a href="#" style="color:var(--accent-blue);" onclick="openAuthModal('login')">Ingresa aquí</a></p>`; }

function closeModal() { const m = document.getElementById('dynamic-modal'); if(m) m.remove(); }
function closeModalOnOutside(e) { if(e.target.id === 'dynamic-modal') closeModal(); }
function showCustomAlert(title, message, type="error") {
    closeModal();
    let icon = type === "error" ? "fa-circle-xmark" : "fa-circle-check";
    let iconColor = type === "error" ? "var(--f1-red)" : "var(--accent-green)";
    const modalHtml = `<div id="dynamic-modal" class="modal-overlay" onclick="closeModalOnOutside(event)"><div class="modal-box custom-alert"><i class="fa-solid fa-xmark modal-close" onclick="closeModal()"></i><i class="fa-solid ${icon}" style="color:${iconColor}"></i><h2>${title}</h2><p>${message}</p><button class="btn btn-primary" style="width:100%;" onclick="closeModal()">Aceptar</button></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ==========================================
// LÓGICA DE AUTENTICACIÓN Y AWS
// ==========================================
async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button'); const msg = document.getElementById('auth-error'); btn.innerText = "Procesando...";
    const payload = { nombre: document.getElementById('reg-nombre').value, apellido: document.getElementById('reg-apellido').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-pass').value };
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        const data = await res.json(); msg.style.display = "block";
        if(data.status === 'success') {
            msg.style.color = "var(--accent-green)"; msg.innerText = "¡Cuenta creada! Entrando...";
            setTimeout(() => { currentUserName = payload.nombre; currentUserEmail = payload.email; currentUserTier = "Free"; sessionStorage.setItem('f1_name', currentUserName); sessionStorage.setItem('f1_email', currentUserEmail); sessionStorage.setItem('f1_tier', currentUserTier); closeModal(); loadDashboard(); }, 1000);
        } else { msg.style.color = "var(--f1-red)"; msg.innerText = data.message; btn.innerText = "Registrarse"; }
    } catch(err) { msg.style.display = "block"; msg.style.color = "var(--f1-red)"; msg.innerText = "Error AWS DB."; btn.innerText = "Registrarse"; }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button'); const errBox = document.getElementById('auth-error'); btn.innerText = "Validando...";
    const payload = { email: document.getElementById('log-email').value, password: document.getElementById('log-pass').value };
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        const data = await res.json();
        if(data.status === 'success') { 
            currentUserName = data.nombre; currentUserEmail = payload.email; currentUserTier = data.tier; 
            sessionStorage.setItem('f1_name', currentUserName); sessionStorage.setItem('f1_email', currentUserEmail); sessionStorage.setItem('f1_tier', currentUserTier);
            closeModal(); loadDashboard(); 
        } else { errBox.style.display = "block"; errBox.style.color = "var(--f1-red)"; errBox.innerText = data.message; btn.innerText = "Ingresar"; }
    } catch(err) { errBox.style.display = "block"; errBox.style.color = "var(--f1-red)"; errBox.innerText = "Servidor AWS inalcanzable."; btn.innerText = "Ingresar"; }
}

function loadDashboard() {
    resetTimer(); appRoot().innerHTML = UI_DASHBOARD;
    document.getElementById('user-name-display').innerText = currentUserName;
    
    // Si eres gratis sale "(PRO)", si eres PRO desaparece.
    let tag = currentUserTier === 'Free' ? " (PRO)" : "";
    let dynHtml = `<option value="2026">📅 Mundial 2026</option><option value="2025">📅 Mundial 2025${tag}</option><option value="2024">📅 Mundial 2024${tag}</option><option value="2023">📅 Mundial 2023${tag}</option>`;
    document.getElementById('tel-season').innerHTML = dynHtml;
    document.getElementById('standings-season').innerHTML = dynHtml;

    const badge = document.getElementById('tier-badge');
    const upgrade = document.getElementById('upgrade-btn-container');

    if (currentUserTier === 'Free') {
        badge.innerHTML = 'Plan Gratuito'; upgrade.innerHTML = `<button class="btn-upgrade" onclick="renderPricing()">Mejorar a PRO</button>`;
    } else {
        badge.innerHTML = '<i class="fa-solid fa-crown" style="color:var(--f1-red)"></i> Plan PRO'; upgrade.innerHTML = '';
    }
    
    const select = document.querySelector('.circuits-dropdown');
    const allRaces = [
        {val: "bahrain", txt: "Bahrain GP"}, {val: "saudi", txt: "Saudi Arabian GP"}, {val: "australia", txt: "Australian GP"}, {val: "japan", txt: "Japanese GP"},
        {val: "china", txt: "Chinese GP"}, {val: "miami", txt: "Miami GP"}, {val: "imola", txt: "Emilia Romagna GP"}, {val: "monaco", txt: "Monaco GP"},
        {val: "canada", txt: "Canadian GP"}, {val: "spain", txt: "Spanish GP"}, {val: "austria", txt: "Austrian GP"}, {val: "silverstone", txt: "British GP"},
        {val: "hungary", txt: "Hungarian GP"}, {val: "spa", txt: "Belgian GP"}, {val: "netherlands", txt: "Dutch GP"}, {val: "monza", txt: "Italian GP"},
        {val: "azerbaijan", txt: "Baku City Circuit"}, {val: "singapore", txt: "Singapore GP"}, {val: "usa", txt: "United States GP"}, {val: "mexico", txt: "Mexico City GP"},
        {val: "interlagos", txt: "São Paulo GP"}, {val: "vegas", txt: "Las Vegas GP"}, {val: "qatar", txt: "Qatar GP"}, {val: "abudhabi", txt: "Abu Dhabi GP"}
    ];
    select.innerHTML = ""; allRaces.forEach(c => select.innerHTML += `<option value="${c.val}">📍 ${c.txt}</option>`);

    fetchTelemetryData();
}

async function processUpgrade() {
    if(!currentUserTier) { openAuthModal('login'); return; }
    if(currentUserTier === 'Free') { 
        try {
            const res = await fetch(`${SECURE_AWS_URL}/api/upgrade`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: currentUserEmail}) });
            const data = await res.json();
            if(data.status === 'success') {
                showCustomAlert("¡Plan Mejorado!", "Tu cuenta es ahora PRO en la Base de Datos AWS.", "success");
                currentUserTier = 'Pro'; sessionStorage.setItem('f1_tier', 'Pro'); setTimeout(() => { loadDashboard(); }, 2000);
            } else { showCustomAlert("Error", "Fallo al procesar el pago.", "error"); }
        } catch(err) { showCustomAlert("Error AWS", "No se pudo contactar con el servidor.", "error"); }
    } 
}

async function cancelProPlan() {
    if(confirm("¿Seguro que deseas cancelar tu suscripción PRO y perder el acceso al historial y la parrilla completa?")) {
        try {
            const res = await fetch(`${SECURE_AWS_URL}/api/cancel`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: currentUserEmail}) });
            const data = await res.json();
            if(data.status === 'success') {
                showCustomAlert("Plan Cancelado", "Has vuelto a la versión Gratuita.", "success");
                currentUserTier = 'Free'; sessionStorage.setItem('f1_tier', 'Free'); setTimeout(() => { loadDashboard(); }, 2000);
            }
        } catch(err) { showCustomAlert("Error de Red", "AWS no responde.", "error"); }
    }
}

function logout() { 
    currentUserTier = null; currentUserName = ""; currentUserEmail = "";
    sessionStorage.removeItem('f1_tier'); sessionStorage.removeItem('f1_name'); sessionStorage.removeItem('f1_email');
    clearTimeout(inactivityTimer); renderLanding(); 
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

function checkProAccess(selectElement) {
    if (currentUserTier === 'Free' && selectElement.value !== '2026') {
        showCustomAlert("Función Bloqueada", "El análisis histórico (2023-2025) es exclusivo del Plan PRO.", "error");
        selectElement.value = '2026'; return false;
    } return true;
}

function handleNetError(isError) {
    const badge = document.getElementById('aws-status'); const text = document.getElementById('aws-status-text'); const dot = badge ? badge.querySelector('.dot') : null;
    if(!badge || !text) return;
    if (isError) {
        badge.style.color = "var(--f1-red)"; badge.style.background = "rgba(225, 6, 0, 0.1)"; badge.style.borderColor = "rgba(225, 6, 0, 0.2)";
        if(dot) { dot.style.background = "var(--f1-red)"; dot.style.boxShadow = "0 0 8px var(--f1-red)"; }
        text.innerText = "Error AWS";
    } else {
        badge.style.color = "var(--accent-green)"; badge.style.background = "rgba(16,185,129,0.1)"; badge.style.borderColor = "rgba(16,185,129,0.2)";
        if(dot) { dot.style.background = "var(--accent-green)"; dot.style.boxShadow = "0 0 8px var(--accent-green)"; }
        text.innerText = "Conectado AWS";
    }
}

// TABLAS LIMITADAS PARA USUARIOS FREE (Solo Top 5)
async function fetchTelemetryData() {
    const tbody = document.getElementById('telemetry-table-body');
    const tableContainer = document.querySelector('.table-container'); const msgDiv = document.getElementById('telemetry-msg');
    const season = document.getElementById('tel-season').value; const circuit = document.getElementById('tel-circuit').value; const session = document.getElementById('tel-session').value;
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/telemetry?season=${season}&circuit=${circuit}&session=${session}`);
        const data = await res.json(); handleNetError(false);
        if(data.status === "FUTURE" || data.status === "NO_SPRINT") {
            tableContainer.style.display = "none"; msgDiv.style.display = "block";
            msgDiv.innerHTML = `<i class="fa-solid fa-calendar-xmark" style="font-size:30px; margin-bottom:15px; color:var(--text-muted)"></i><br>Evento no disponible.`; return;
        }
        tableContainer.style.display = "block"; msgDiv.style.display = "none"; tbody.innerHTML = "";
        
        let limit = (currentUserTier === 'Free') ? 5 : data.data.length;
        let displayData = data.data.slice(0, limit);

        displayData.forEach(row => {
            let pb = row.pos === 1 ? `<span class="rank-gold">1</span>` : `<span class="rank-normal">${row.pos}</span>`;
            tbody.innerHTML += `<tr><td>${pb}</td><td><span class="driver-name">${row.driver}</span><span class="team-name">${row.team}</span></td><td class="mono" style="color:var(--text-main); font-weight:700;">${row.best_lap}</td><td class="mono">${row.pits}</td><td>${row.tyre}</td><td class="mono">${row.top_speed}</td><td class="mono">${row.s1}</td><td class="mono">${row.s2}</td><td class="mono">${row.s3}</td></tr>`;
        });
        
        if(currentUserTier === 'Free') {
            tbody.innerHTML += `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--f1-red); font-weight:bold; cursor:pointer; background:rgba(225,6,0,0.05);" onclick="renderPricing()"><i class="fa-solid fa-lock"></i> Hazte PRO para ver la telemetría de los 20 pilotos</td></tr>`;
        }
    } catch (err) { handleNetError(true); }
}

async function fetchStandingsData() {
    const tbody = document.getElementById('standings-table-body');
    const season = document.getElementById('standings-season').value;
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/standings?season=${season}`);
        const data = await res.json(); handleNetError(false); tbody.innerHTML = "";
        
        let limit = (currentUserTier === 'Free') ? 5 : data.standings.length;
        let displayData = data.standings.slice(0, limit);

        displayData.forEach(row => {
            let r = row.rank === 1 ? `<span class="rank-gold"><i class="fa-solid fa-trophy"></i></span>` : `<span class="rank-normal">${row.rank}</span>`;
            tbody.innerHTML += `<tr><td>${r}</td><td><span class="driver-name">${row.driver}</span></td><td class="mono">${row.points}</td><td class="mono">${row.wins}</td><td class="mono">${row.podiums}</td><td class="mono">${row.fast_laps}</td></tr>`;
        });
        
        if(currentUserTier === 'Free') {
            tbody.innerHTML += `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--f1-red); font-weight:bold; cursor:pointer; background:rgba(225,6,0,0.05);" onclick="renderPricing()"><i class="fa-solid fa-lock"></i> Hazte PRO para ver la clasificación completa</td></tr>`;
        }
    } catch (err) { handleNetError(true); }
}

async function fetchCircuitsData() {
    const grid = document.getElementById('circuits-grid-container');
    try {
        const res = await fetch(`${SECURE_AWS_URL}/api/circuits`);
        let data = await res.json(); handleNetError(false);
        if (currentUserTier === 'Free') { data = data.slice(0, 3); }
        grid.innerHTML = "";
        data.forEach(c => { grid.innerHTML += `<div class="card"><img src="${c.image}" style="object-fit:contain; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;"><h3>${c.name}</h3><p>${c.location}</p></div>`; });
        if (currentUserTier === 'Free') {
            grid.innerHTML += `<div class="card" style="display:flex; flex-direction:column; justify-content:center; border-color:var(--f1-red); background:rgba(225,6,0,0.05); cursor:pointer;" onclick="renderPricing()"><i class="fa-solid fa-lock" style="font-size:30px; color:var(--f1-red); margin-bottom:15px;"></i><h3 style="color:var(--f1-red);">21 Circuitos Ocultos</h3><p style="font-size:12px; color:var(--text-muted);">Disponibles en el Plan PRO.</p><button class="btn btn-primary">Desbloquear</button></div>`;
        }
    } catch (err) { handleNetError(true); }
}

document.addEventListener('contextmenu', e => e.preventDefault()); 
document.onkeydown = function(e) { if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey) || (e.ctrlKey && e.keyCode === 85)) return false; };
document.addEventListener('DOMContentLoaded', () => { if (currentUserTier && currentUserName) { loadDashboard(); } else { renderLanding(); } });