const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Rahasia
const SYSTEM_PIN = process.env.SYSTEM_PIN || "123456"; // Ganti dengan PIN Anda atau atur di Environment Variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // GitHub Personal Access Token (PAT)
const GITHUB_OWNER = "NAMA_USER_GITHUB"; // Ganti dengan username GitHub Anda
const GITHUB_REPO = "NAMA_REPOSITORY";   // Ganti dengan nama repository Anda

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Menyajikan file HTML statis

// 1. API VERIFIKASI PIN
app.post('/api/verify', (req, res) => {
    const { pin } = req.body;
    if (pin === SYSTEM_PIN) {
        return res.status(200).json({ message: 'PIN Benar' });
    }
    return res.status(401).json({ message: 'PIN Salah!' });
});

// 2. API TRIGGER GITHUB ACTION (JALANKAN LIVE)
app.post('/api/trigger', async (req, res) => {
    const { pin, targetYml, ytUrl, rtmpKey, name } = req.body;

    if (pin !== SYSTEM_PIN) {
        return res.status(401).json({ message: 'Akses Ditolak! PIN tidak valid.' });
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${targetYml}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: 'main', // Atau branch utama Anda (misal: 'master')
                    inputs: {
                        url: ytUrl,
                        key: rtmpKey,
                        title: name || 'Untitled Name'
                    }
                })
            }
        );

        if (response.status === 204) {
            return res.json({ message: `Live '${name}' berhasil dijalankan di ${targetYml}!` });
        } else {
            const errorData = await response.json();
            return res.status(response.status).json({ message: errorData.message || 'Gagal memicu GitHub Action.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan koneksi server.' });
    }
});

// 3. API CANCEL WORKFLOW (BERHENTI LIVE)
app.post('/api/cancel', async (req, res) => {
    const { pin, targetYml } = req.body;

    if (pin !== SYSTEM_PIN) {
        return res.status(401).json({ message: 'Akses Ditolak! PIN tidak valid.' });
    }

    try {
        // Ambil daftar run yang sedang aktif (in_progress)
        const runsResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${targetYml}/runs?status=in_progress`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github+json'
                }
            }
        );

        const runsData = await runsResponse.json();

        if (!runsData.workflow_runs || runsData.workflow_runs.length === 0) {
            return res.status(404).json({ message: 'Tidak ada live yang sedang berjalan untuk workflow ini.' });
        }

        // Hentikan semua workflow yang sedang aktif untuk file yml tersebut
        let stoppedCount = 0;
        for (const run of runsData.workflow_runs) {
            await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${run.id}/cancel`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github+json'
                    }
                }
            );
            stoppedCount++;
        }

        return res.json({ message: `Berhasil menghentikan ${stoppedCount} proses live!` });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan server saat membatalkan live.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
  
