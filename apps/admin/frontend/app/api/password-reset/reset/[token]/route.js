import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { token } = params;
    const body = await request.json();
    const { newPassword } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: 'Nova senha é obrigatória' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Fazer requisição para o backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8800';
    const response = await fetch(`${backendUrl}/api/password-reset/reset/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Erro na API de reset de senha:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}