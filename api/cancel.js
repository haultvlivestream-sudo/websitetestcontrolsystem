export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { pin, runId } = body;

        const pinInput = String(pin || '').trim();
        const SERVER_PIN = String(process.env.WEB_PIN || '').trim();
        const GITHUB_TOKEN = String(process.env.GH_PAT_TOKEN || '').trim();

        if (!SERVER_PIN || pinInput !== SERVER_PIN) {
            return res.status(401).json({ message: 'PIN Akses Salah!' });
        }

        const GITHUB_USERNAME = "haultvlivestream-sudo";
        const GITHUB_REPO = "liveyt-denganlogo2026-amanlag";

        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/actions/runs/${runId}/cancel`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.ok || response.status === 202) {
            return res.status(200).json({ success: true, message: "Berhasil menghentikan live." });
        } else {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ message: errData.message || "Gagal membatalkan workflow." });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
                }
            
