import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileCheck, AlertTriangle, ArrowRight } from 'lucide-react';

const DocumentValidationRequired = () => {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <div className="p-8 text-center">
          {/* Ícone */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <FileCheck className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Validação de Documentos Necessária
          </h2>

          {/* Descrição */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">
            Para garantir a segurança das suas transações, é necessário validar seus documentos antes de realizar saques e transferências.
          </p>

          {/* Requisitos */}
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileCheck size={18} className="text-orange-600 dark:text-orange-400" />
              Documentos Obrigatórios:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                <span><strong>Frente do Documento:</strong> RG, CNH ou Passaporte (frente)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                <span><strong>Verso do Documento:</strong> Verso do mesmo documento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                <span><strong>Selfie com Documento:</strong> Foto sua segurando o documento ao lado do rosto</span>
              </li>
            </ul>
          </div>

          {/* Informação sobre tempo de análise */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <p>⏱️ O processo de análise leva até 2 dias úteis</p>
          </div>

          {/* Botão */}
          <Button
            onClick={() => router.push('/document-validation')}
            className="btn-primary w-full sm:w-auto px-8"
          >
            <div className="flex items-center gap-2">
              <FileCheck size={18} />
              <span>Enviar Documentos</span>
              <ArrowRight size={18} />
            </div>
          </Button>

          {/* Link de ajuda */}
          <div className="mt-6 text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              Precisa de ajuda?{' '}
              <button
                onClick={() => router.push('/support')}
                className="text-primary hover:underline font-medium"
              >
                Entre em contato com o suporte
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentValidationRequired;
