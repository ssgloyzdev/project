// --- 1. INISIALISASI & UI INTERAKTIF ---
document.addEventListener("DOMContentLoaded", () => {
    // A. Efek Kursor Kupu-Kupu 
    createCustomCursor();

    // B. Inisialisasi Partikel Background Tema Hu Tao
    if (document.getElementById("particles-js")) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 55, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#ff3b47", "#e5a93c", "#a8232b"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.6, "random": true },
                "size": { "value": 4, "random": true },
                "line_linked": { "enable": false },
                "move": { "enable": true, "speed": 1.5, "direction": "top", "random": true, "straight": false, "out_mode": "out" }
            },
            "interactivity": {
                "events": { "onhover": { "enable": true, "mode": "bubble" } },
                "modes": { "bubble": { "distance": 200, "size": 6, "duration": 2, "opacity": 0.8 } }
            }
        });
    }

    // C. Jika Berada di Halaman Content, Cek Status Admin & Muat Data
    if (window.location.pathname.includes("source.html")) {
        checkAdminStatus();
        fetchProjects();
    }
});

// Ekor Kursor Mengikuti Gerakan Mouse
function createCustomCursor() {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    cursor.innerHTML = "";
    document.body.appendChild(cursor);

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });

    document.querySelectorAll("button, a, input, textarea").forEach(elem => {
        elem.addEventListener("mouseenter", () => cursor.style.transform = "translate(-50%, -50%) scale(1.6)");
        elem.addEventListener("mouseleave", () => cursor.style.transform = "translate(-50%, -50%) scale(1)");
    });
}

// --- 2. AUTHENTICATION & CHECK ROLE SUPABASE ---
async function loginWithGithub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin + '/content/source.html'
        }
    });

    if (error) {
        alert("Gagal autentikasi GitHub: " + error.message);
    }
}

// Validasi Role Admin dari Metadata Supabase
function isUserAdmin(session) {
    if (!session || !session.user) return false;
    const userRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
    return userRole === 'admin';
}

async function checkAdminStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = isUserAdmin(session);

    if (isAdmin) {
        if (document.getElementById('admin-indicator')) document.getElementById('admin-indicator').style.display = 'block';
        if (document.getElementById('admin-panel')) document.getElementById('admin-panel').style.display = 'block';
    } else {
        if (document.getElementById('admin-indicator')) document.getElementById('admin-indicator').style.display = 'none';
        if (document.getElementById('admin-panel')) document.getElementById('admin-panel').style.display = 'none';
    }
}

// --- 3. CRUD KARYA STATIS ---
async function fetchProjects() {
    const listContainer = document.getElementById('projects-list');
    const { data: projects, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (error) {
        listContainer.innerHTML = `<p>Gagal memuat data karya.</p>`;
        return;
    }

    if (projects.length === 0) {
        listContainer.innerHTML = `<p>Belum ada karya yang dipublikasikan.</p>`;
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = isUserAdmin(session);

    listContainer.innerHTML = projects.map(p => `
        <div class="card-item">
            <h4>${escapeHtml(p.title)}</h4>
            <div class="card-actions">
                <button onclick="renderProject(${p.id})" class="btn-hutao sm">Lihat Karya</button>
                ${isAdmin ? `
                    <button onclick="editProject(${p.id}, '${escapeHtml(p.title)}', \`${escapeBacktick(p.html_content)}\`)" class="btn-secondary sm">Edit</button>
                    <button onclick="deleteProject(${p.id})" class="btn-secondary sm" style="border-color:var(--bright-red); color:var(--bright-red);">Hapus</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function saveProject() {
    const id = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value;
    const html_content = document.getElementById('project-html').value;

    if (!title || !html_content) return alert("Judul dan Konten HTML/JS tidak boleh kosong!");

    if (id) {
        const { error } = await supabase.from('projects').update({ title, html_content }).eq('id', id);
        if (error) alert("Akses Ditolak / Gagal Update: " + error.message);
    } else {
        const { error } = await supabase.from('projects').insert([{ title, html_content }]);
        if (error) alert("Akses Ditolak / Gagal Simpan: " + error.message);
    }

    resetForm();
    fetchProjects();
}

function editProject(id, title, html_content) {
    document.getElementById('project-id').value = id;
    document.getElementById('project-title').value = title;
    document.getElementById('project-html').value = html_content;
    document.getElementById('form-title').innerText = "Edit Karya";
}

async function deleteProject(id) {
    if (confirm("Apakah kamu yakin ingin menghapus karya ini?")) {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) alert("Akses Ditolak / Gagal Hapus: " + error.message);
        fetchProjects();
    }
}

async function renderProject(id) {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single();
    if (!project) return;

    const renderArea = document.getElementById('render-area');
    renderArea.innerHTML = project.html_content;

    // Evaluasi dan jalankan skrip JavaScript yang di-inject jika ada
    const scripts = renderArea.querySelectorAll("script");
    scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    document.getElementById('render-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('render-modal').style.display = 'none';
    document.getElementById('render-area').innerHTML = '';
}

function resetForm() {
    document.getElementById('project-id').value = '';
    document.getElementById('project-title').value = '';
    document.getElementById('project-html').value = '';
    document.getElementById('form-title').innerText = "Tambah Karya Baru";
}

// Helpers untuk Keamanan String
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeBacktick(str) {
    return str.replace(/`/g, "\\`").replace(/\$/g, "\\$");
}
