// File: /api/trigger.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Tidak Diizinkan (Gunakan POST)" });
    }

    const { pin, targetYml, ytUrl, rtmpKey } = req.body;

    // VERIFIKASI PIN
    if (!pin || pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: "PIN Salah atau Tidak Valid!" });
    }

    if (!targetYml || !ytUrl || !rtmpKey) {
        return res.status(400).json({ message: "Semua kolom input wajib diisi!" });
    }

    // VARIABEL SESUAI NAMANYA DI VERCEL KAMU
    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN;
    const REPO_OWNER = process.env.GH_OWNER;
    const REPO_NAME = process.env.GH_REPO;

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${targetYml}/dispatches`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "User-Agent": "Vercel-Api-Request"
            },
            body: JSON.stringify({
                ref: 'main', // Ganti 'master' jika branch utama Anda bernama master
                inputs: {
                    url: ytUrl,
                    stream_key: rtmpKey
                }
            })
        });

        if (response.status === 204) {
            return res.status(200).json({ 
                message: `Workflow '${targetYml}' berhasil dijalankan!` 
            });
        } else {
            const errorData = await response.json();
            return res.status(500).json({ 
                message: "Gagal memicu GitHub Action.", 
                error: errorData.message 
            });
        }

    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan koneksi pada server Vercel." });
    }
            }
                
