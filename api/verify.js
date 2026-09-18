export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { pin } = req.body;
    // Mengambil PIN murni dari Vercel Environment Variable (WEB_PIN)
    const SERVER_PIN = process.env.WEB_PIN;

    if (!SERVER_PIN) {
        return res.status(500).json({ success: false, message: 'WEB_PIN belum diatur di Vercel Secret.' });
    }

    // Cek apakah PIN dari user cocok dengan Secret di Vercel
    if (pin === SERVER_PIN) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: 'PIN Salah!' });
    }
}
