// File: /api/status.js

export default async function handler(req, res) {
    // 1. Ambil PIN dari query parameter (?pin=xxx)
    const { pin } = req.query;

    // 2. VERIFIKASI PIN DENGAN WEB_PIN DARI VERCEL
    if (!pin || pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: "PIN Salah atau Tidak Valid!" });
    }

    // 3. AMBIL VARIABEL SESUAI NAMA DI VERCEL KAMU
    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN; 
    const REPO_OWNER = process.env.GH_OWNER;
    const REPO_NAME = process.env.GH_REPO;

    try {
        // 4. PANGGIL GITHUB API UNTUK AMBIL STATUS
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
                "User-Agent": "Vercel-Api-Request"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ 
                message: "PIN Benar, tapi GitHub menolak koneksi.",
                error: data.message || "Cek izin token atau nama repo."
            });
        }

        // 5. JIKA BERHASIL
        return res.status(200).json({ 
            message: "PIN Valid!",
            runs: data.workflow_runs 
        });

    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan internal pada server Vercel." });
    }
}
