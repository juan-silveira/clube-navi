export default async function handler(req, res) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800';
    const token = req.headers.authorization;

    const response = await fetch(`${backendUrl}/api/admin/withdrawals/pending`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}