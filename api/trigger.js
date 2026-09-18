// File: /api/trigger.js

export default async function handler(req, res) {
    // 1. PASTIKAN METHOD MENGGUNAKAN POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Tidak Diizinkan (Gunakan POST)" });
    }

    const { pin, targetYml, ytUrl, rtmpKey } = req.body;

    // 2. VERIFIKASI PIN DENGAN WEB_PIN DI ENVIRONMENT VERCEL
    if (!pin || pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: "PIN Salah atau Tidak Valid!" });
    }

    // 3. VALIDASI INPUTAN FORM
    if (!targetYml || !ytUrl || !rtmpKey) {
        return res.status(400).json({ message: "Semua kolom input wajib diisi!" });
    }

    // 4. AMBIL KONFIGURASI DARI ENVIRONMENT VARIABLES
    const GITHUB_TOKEN = process.env.GH_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;

    try {
        // 5. MENGIRIM PERMINTAAN TRIGGER (repository_dispatch / workflow_dispatch) KE GITHUB
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${targetYml}/dispatches`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ref: 'main', // Branch utama repositori Anda (ganti ke 'master' jika repositori menggunakan nama master)
                inputs: {
                    url: ytUrl,
                    stream_key: rtmpKey
                }
            })
        });

        if (response.status === 204) {
            // HTTP Status 204 No Content menandakan GitHub Action sukses ditrigger
            return res.status(200).json({ 
                message: `Workflow '${targetYml}' berhasil dijalankan di GitHub!` 
            });
        } else {
            const errorData = await response.json();
            return res.status(500).json({ 
                message: "Gagal memicu GitHub Action.", 
                error: errorData.message || "Pastikan nama file .yml dan variabel 'inputs' di GitHub Action cocok."
            });
        }

    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan koneksi pada server Vercel." });
    }
}
