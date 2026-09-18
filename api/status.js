// File: api/status.js

export default async function handler(req, res) {
    const { pin } = req.query;

    // 1. VERIFIKASI PIN
    if (!pin || pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: "PIN Salah atau Tidak Valid!" });
    }

    // 2. JIKA PIN BENAR, AMBIL RIWAYAT WORKFLOW DARI GITHUB
    const GITHUB_TOKEN = process.env.GH_TOKEN; // pastikan di Vercel namanya GH_TOKEN atau GITHUB_TOKEN
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ message: "Gagal mengambil data dari GitHub." });
        }

        return res.status(200).json({ runs: data.workflow_runs });
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan server internal." });
    }
}
