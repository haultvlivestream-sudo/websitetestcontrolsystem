// File: /api/status.js

export default async function handler(req, res) {
    const { pin } = req.query;

    if (!pin || pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: "PIN Salah atau Tidak Valid!" });
    }

    // Gunakan .trim() untuk otomatis menghapus spasi tak sengaja di Vercel
    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN ? process.env.GH_PAT_TOKEN.trim() : ''; 
    const REPO_OWNER = process.env.GH_OWNER ? process.env.GH_OWNER.trim() : '';
    const REPO_NAME = process.env.GH_REPO ? process.env.GH_REPO.trim() : '';

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
        return res.status(500).json({ 
            message: "Variabel GH_PAT_TOKEN, GH_OWNER, atau GH_REPO belum terpasang di Vercel!" 
        });
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
                "User-Agent": "Vercel-Api-App"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            let errorDetails = data.message || "Akses ditolak";
            if (response.status === 401) {
                errorDetails = "Token GitHub (GH_PAT_TOKEN) tidak valid.";
            } else if (response.status === 404) {
                errorDetails = `Repositori '${REPO_OWNER}/${REPO_NAME}' tidak ditemukan / token tidak punya akses ke repo private.`;
            }

            return res.status(response.status).json({ 
                message: `GitHub Menolak (HTTP ${response.status}): ${errorDetails}`
            });
        }

        return res.status(200).json({ 
            message: "PIN Valid!",
            runs: data.workflow_runs 
        });

    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan koneksi server Vercel." });
    }
                }
