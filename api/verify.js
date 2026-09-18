export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Memastikan req.body ter-parse dengan benar
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const pin = body?.pin;

    // Mengambil PIN murni dari Vercel Environment Variable (WEB_PIN)
    const SERVER_PIN = process.env.WEB_PIN;

    if (!SERVER_PIN) {
        return res.status(500).json({ 
            success: false, 
            message: 'WEB_PIN belum diatur di Vercel Environment Variables.' 
        });
    }

    // Membandingkan PIN sebagai String agar aman dari tipe data yang berbeda
    if (String(pin).trim() === String(SERVER_PIN).trim()) {
        return res.status(200).json({ success: true, message: 'PIN Benar' });
    } else {
        return res.status(401).json({ success: false, message: 'PIN Salah!' });
    }
}
    
