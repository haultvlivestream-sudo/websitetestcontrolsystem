export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const { pin } = req.query;

    if (pin !== process.env.WEB_PIN) {
        return res.status(401).json({ message: 'PIN Akses Salah!' });
    }

    const GITHUB_TOKEN = process.env.GH_PAT_TOKEN;
    const REPO_OWNER = process.env.GH_OWNER;
    const REPO_NAME = process.env.GH_REPO;

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal mengambil riwayat workflow');

        const runs = data.workflow_runs.map(run => ({
            id: run.id,
            name: run.name,
            status: run.status,
            conclusion: run.conclusion,
            created_at: run.created_at
        }));

        return res.status(200).json({ runs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }
