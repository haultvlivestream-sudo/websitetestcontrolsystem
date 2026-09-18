export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { pin, targetYml, liveName, ytUrl, rtmpKey } = body;

    const SERVER_PIN = process.env.WEB_PIN;
    if (!SERVER_PIN || String(pin).trim() !== String(SERVER_PIN).trim()) {
        return res.status(401).json({ message: 'PIN Akses Salah!' });
    }

    const GITHUB_USERNAME = "haultvlivestream-sudo";
    const GITHUB_REPO = "liveyt-denganlogo2026-amanlag";
    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN;

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ message: 'Token GH_PAT_TOKEN belum diatur di Vercel.' });
    }

    const nowWib = new Date().toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace('.', ':');

    const finalTitle = (liveName && liveName.trim() !== '') 
        ? liveName.trim() 
        : `Untitled - ${nowWib} WIB`;

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/actions/workflows/${targetYml}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    link_youtube: ytUrl,
                    kunci_rtmp: rtmpKey,
                    live_title: finalTitle
                }
            })
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ 
                success: true, 
                message: `Live "${finalTitle}" berhasil dijalankan!` 
            });
        } else {
            const errData = await response.json();
            return res.status(response.status).json({ message: errData.message || "Gagal memicu GitHub Action." });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan koneksi server.' });
    }
                }
