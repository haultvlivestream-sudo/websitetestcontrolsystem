export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { pin } = req.body;
    const SERVER_PIN = process.env.WEB_PIN;
    if (!SERVER_PIN || pin !== SERVER_PIN) {
        return res.status(401).json({ message: 'PIN Akses Salah!' });
    }

    const GITHUB_USERNAME = "haultvlivestream-sudo";
    const GITHUB_REPO = "liveyt-denganlogo2026-amanlag";
    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN;

    try {
        // Ambil 15 workflow runs terakhir dari repository
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/actions/runs?per_page=15`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: "Gagal mengambil riwayat dari GitHub." });
        }

        const data = await response.json();
        
        // Transformasikan data agar mudah ditampilkan di frontend
        const history = data.workflow_runs.map(run => {
            const dateObj = new Date(run.created_at);
            const wibTime = dateObj.toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace('.', ':') + " WIB";

            const ymlPath = run.path.split('/').pop();

            return {
                runId: run.id,
                title: run.display_title || `Untitled - ${wibTime}`,
                yml: ymlPath,
                time: wibTime,
                status: run.status, // queued, in_progress, completed
                conclusion: run.conclusion // success, cancelled, failure, dll
            };
        });

        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan koneksi server.' });
    }
              }
          
