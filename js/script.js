// ==========================================
// 0. GLOBAL ERROR CATCHER & OVERLAY (UNTUK MOBILE/HP DEBUG)
// ==========================================
window.addEventListener('error', function (e) {
    showErrorOverlay(`Uncaught Error:\n${e.message}\n\nFile: ${e.filename}\nLine: ${e.lineno}:${e.colno}`);
});

window.addEventListener('unhandledrejection', function (e) {
    const reason = e.reason ? (e.reason.message || JSON.stringify(e.reason)) : 'Unknown rejection';
    showErrorOverlay(`Unhandled Promise Rejection:\n${reason}`);
});

function showErrorOverlay(msg) {
    let btn = document.getElementById('debug-err-btn');
    let modal = document.getElementById('debug-err-modal');

    if (!btn) {
        // Buat Tombol Floating "!"
        btn = document.createElement('button');
        btn.id = 'debug-err-btn';
        btn.innerHTML = '!';
        btn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 999999;
            width: 50px; height: 50px; border-radius: 50%;
            background: #ff3b47; color: #fff; font-size: 24px; font-weight: bold;
            border: 2px solid #e5a93c; box-shadow: 0 0 15px rgba(255, 59, 71, 0.8);
            cursor: pointer;
        `;
        
        // Buat Overlay Modal Pesan Error
        modal = document.createElement('div');
        modal.id = 'debug-err-modal';
        modal.style.cssText = `
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.92); z-index: 1000000; padding: 20px; box-sizing: border-box;
            overflow-y: auto; color: #ff3b47; font-family: monospace; font-size: 13px;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a141c; border: 1px solid #a8232b; padding: 15px; border-radius: 8px; max-width: 600px; margin: 40px auto; position: relative;">
                <span id="close-debug-modal" style="position: absolute; right: 15px; top: 10px; color: #fff; font-size: 24px; cursor: pointer;">&times;</span>
                <h3 style="color: #e5a93c; margin-top: 0;">⚠️ System Error Detected</h3>
                <pre id="debug-err-text" style="white-space: pre-wrap; word-break: break-all; color: #f0e6d2; background: #0d0d11; padding: 10px; border-radius: 5px; margin-top: 10px;"></pre>
            </div>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(modal);

        btn.onclick = () => { modal.style.display = 'block'; };
        document.body.addEventListener('click', function(evt) {
            if (evt.target && evt.target.id === 'close-debug-modal') {
                modal.style.display = 'none';
            }
        });
    }

    const content = document.getElementById('debug-err-text');
    if (content) {
        content.innerText += (content.innerText ? '\n\n-------------------\n\n' : '') + msg;
    }
    btn.style.display = 'block';
}

// ==========================================
// 1. INISIALISASI & UI INTERAKTIF
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    createCustomCursor();

    if (document.getElementById("particles-js")) {
        if (typeof particlesJS !== 'undefined') {
            particlesJS("particles-js", {
                "particles": {
                    "number": { "value": 45, "density": { "enable": true, "value_area": 800 } },
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
    }

    if (window.location.pathname.toLowerCase().includes("source.html")) {
        checkAdminStatus();
        fetchProjects();
    }
});

function createCustomCursor() {
    // Matikan kursor kustom di HP/layar sentuh agar navigasi sentuh tidak terganggu
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    cursor.innerHTML = "🦋";
    document.body.appendChild(cursor);

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });
}

// ==========================================
// 2. AUTHENTICATION & ROLE CHECKING
// ==========================================
async function loginWithGithub() {
    try {
        const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : supabase;

        if (!client || !client.auth) {
            throw new Error("Library Supabase JS belum siap dari CDN. Coba muat ulang halaman (refresh) HP kamu.");
        }

        const redirectUri = window.location.origin + window.location.pathname.replace('/login/register.html', '/content/source.html');
        
        const { data, error } = await client.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: redirectUri
            }
        });

        if (error) throw error;
    } catch (err) {
        showErrorOverlay(`OAuth Login Error:\n${err.message || JSON.stringify(err)}`);
    }
}

function isUserAdmin(session) {
    if (!session || !session.user) return false;
    const userRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
    return userRole === 'admin';
}

async function checkAdminStatus() {
    try {
        const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : supabase;
        if (!client || !client.auth) return;

        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;

        const isAdmin = isUserAdmin(session);

        if (isAdmin) {
            if (document.getElementById('admin-indicator')) document.getElementById('admin-indicator').style.display = 'block';
            if (document.getElementById('admin-panel')) document.getElementById('admin-panel').style.display = 'block';
        } else {
            if (document.getElementById('admin-indicator')) document.getElementById('admin-indicator').style.display = 'none';
            if (document.getElementById('admin-panel')) document.getElementById('admin-panel').style.display = 'none';
        }
    } catch (err) {
        showErrorOverlay(`Check Admin Status Error:\n${err.message}`);
    }
}

// ==========================================
// 3. CRUD KARYA STATIS
// ==========================================
async function fetchProjects() {
    const listContainer = document.getElementById('projects-list');
    if (!listContainer) return;

    try {
        const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : supabase;
        if (!client) throw new Error("Supabase Client gagal dimuat.");

        const { data: projects, error } = await client.from('projects').select('*').order('created_at', { ascending: false });

        if (error) throw error;

        if (!projects || projects.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color:var(--text-dim);">Belum ada karya yang dipublikasikan.</p>`;
            return;
        }

        const { data: { session } } = await client.auth.getSession();
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
    } catch (err) {
        listContainer.innerHTML = `<p style="color:var(--bright-red); text-align:center;">Gagal memuat data karya.</p>`;
        showErrorOverlay(`Fetch Projects Error:\n${err.message}`);
    }
}

async function saveProject() {
    try {
        const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : supabase;
        if (!client) throw new Error("Supabase Client tidak tersedia.");

        const id = document.getElementById('project-id').value;
        const title = document.getElementById('project-title').value;
        const html_content = document.getElementById('project-html').value;

        if (!title || !html_content) {
            alert("Judul dan Konten HTML/JS tidak boleh kosong!");
            return;
        }

        if (id) {
            const { error } = await client.from('projects').update({ title, html_content }).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await client.from('projects').insert([{ title, html_content }]);
            if (error) throw error;
        }

        resetForm();
        fetchProjects();
    } catch (err) {
        showErrorOverlay(`Save Project Error:\n${err.message}`);
    }
}

function editProject(id, title, html_content) {
    document.getElementById('project-id').value = id;
    document.getElementById('project-title').value = title;
    document.getElementById('project-html').value = html_content;
    document.getElementById('form-title').innerText = "Edit Karya";
}

async function deleteProject(id) {
    if (confirm("Apakah kamu yakin ingin menghapus karya ini?")) {
        try {
            const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : supabase;
            if (!client) throw new Error("Supabase Client tidak tersedia.");

            const { error } = await client.from('projects').delete().eq('id', id);
            if (error) throw error;
            fetchProjects();
        } catch (err) {
            showErrorOverlay(`Delete Project Error:\n${err.message}`);
        }
    }
}

async function renderProject(id) {
    try {
        const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : supabase;
        if (!client) throw new Error("Supabase Client tidak tersedia.");

        const { data: project, error } = await client.from('projects').select('*').eq('id', id).single();
        if (error) throw error;

        const renderArea = document.getElementById('render-area');
        renderArea.innerHTML = project.html_content;

        const scripts = renderArea.querySelectorAll("script");
        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        document.getElementById('render-modal').style.display = 'block';
    } catch (err) {
        showErrorOverlay(`Render Project Error:\n${err.message}`);
    }
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

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeBacktick(str) {
    return str.replace(/`/g, "\\`").replace(/\$/g, "\\$");
}
