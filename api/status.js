// File: /api/status.js

export default async function handler(req, res) {
    // 1. Ambil PIN dari parameter URL (?pin=xxx)
    const { pin } = req.query;

    // 2. VERIFIKASI PIN DENGAN ENVIRONMENT VARIABLE VERCEL (WEB_PIN)
    if (!pin || pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: "PIN Salah atau Tidak Valid!" });
    }

    // 3. AMBIL DATA DARI ENVIRONMENT VARIABLE VERCEL
    const GITHUB_TOKEN = process.env.GH_TOKEN; // Kunci token GitHub
    const REPO_OWNER = process.env.REPO_OWNER; // Username/Org GitHub
    const REPO_NAME = process.env.REPO_NAME;   // Nama Repositori GitHub

    try {
        // 4. MINTA RIWAYAT WORKFLOW LANGSUNG KE GITHUB API
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ 
                message: "PIN Benar, tapi gagal mengambil status dari GitHub API.",
                error: data.message 
            });
        }

        // 5. JIKA SEMUA BERHASIL, KIRIM DATA WORKFLOW RUNS KE FRONTEND
        return res.status(200).json({ 
            message: "PIN Valid!",
            runs: data.workflow_runs 
        });

    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan internal pada server Vercel." });
    }
    }
