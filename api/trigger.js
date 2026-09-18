export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { pin, targetYml, ytUrl, rtmpKey } = req.body;

    if (pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: 'PIN Akses Salah!' });
    }

    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN;
    const REPO_OWNER = process.env.GH_OWNER;
    const REPO_NAME = process.env.GH_REPO;

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
        return res.status(500).json({ message: 'Environment variables belum lengkap di Vercel!' });
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${targetYml}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: 'main',
                    inputs: {
                        url_stream: ytUrl,
                        stream_key: rtmpKey
                    }
                })
            }
        );

        if (response.status === 204) {
            return res.status(200).json({ message: `Workflow ${targetYml} berhasil dijalankan!` });
        } else {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ message: errorData.message || 'Gagal memicu GitHub Action.' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
