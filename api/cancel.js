export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { pin, runId } = req.body;

    if (pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: 'PIN Akses Salah!' });
    }

    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN;
    const REPO_OWNER = process.env.GH_OWNER;
    const REPO_NAME = process.env.GH_REPO;

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/cancel`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.status === 202) {
            return res.status(200).json({ message: 'Permintaan pembatalan berhasil dikirim ke GitHub.' });
        } else {
            const data = await response.json().catch(() => ({}));
            return res.status(response.status).json({ message: data.message || 'Gagal membatalkan workflow.' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
      }
              
