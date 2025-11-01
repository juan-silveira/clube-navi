import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Fazer requisição para o backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8800';
    const response = await fetch(`${backendUrl}/api/whitelabel/companies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Erro na API de listagem de empresas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
