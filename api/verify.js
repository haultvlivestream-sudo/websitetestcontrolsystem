export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const pin = body?.pin;
    const SERVER_PIN = process.env.WEB_PIN;

    if (!SERVER_PIN) {
        return res.status(500).json({ success: false, message: 'WEB_PIN belum diatur di Vercel.' });
    }

    if (String(pin).trim() === String(SERVER_PIN).trim()) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: 'PIN Salah!' });
    }
}
    
