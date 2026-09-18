export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const userPin = String(body?.pin || '').trim();
        const serverPin = String(process.env.WEB_PIN || '').trim();

        if (!serverPin) {
            return res.status(500).json({ success: false, message: 'WEB_PIN belum diatur di Vercel.' });
        }

        if (userPin === serverPin) {
            return res.status(200).json({ success: true, message: 'Akses Diterima' });
        } else {
            return res.status(401).json({ success: false, message: 'PIN Salah!' });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: 'Format data request tidak valid.' });
    }
    }
    
