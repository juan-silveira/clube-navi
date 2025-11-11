"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import api from "@/services/api";
import { Shield } from "lucide-react";
import useDarkMode from "@/hooks/useDarkMode";

const TwoFactorVerification = ({ isOpen, onClose, onVerified, title = "Verificação 2FA" }) => {
  const [isDark] = useDarkMode();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    const expectedLength = useBackupCode ? 8 : 6;

    if (!code || code.length !== expectedLength) {
      setError(`Digite o código de ${expectedLength} ${useBackupCode ? 'caracteres' : 'dígitos'}`);
      return;
    }

    // Não verificar aqui - apenas passar o código para ser verificado na operação real
    // O backend irá verificar quando a transferência/withdraw for executada
    onVerified(code);
    handleClose();
  };

  const handleClose = () => {
    setCode("");
    setError("");
    setUseBackupCode(false);
    onClose();
  };

  const toggleBackupMode = () => {
    setUseBackupCode(!useBackupCode);
    setCode("");
    setError("");
  };

  return (
    <Modal
      title={title}
      activeModal={isOpen}
      onClose={handleClose}
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Ícone de segurança com gradiente */}
        <div className="flex items-center justify-center">
          <div className={`p-6 bg-gradient-to-br rounded-2xl border ${
            isDark
              ? 'from-primary-500/10 to-primary-600/10 border-primary-500/20'
              : 'from-primary-500/20 to-primary-600/20 border-primary-500/30'
          }`}>
            <Shield className={`w-16 h-16 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
          </div>
        </div>

        {/* Texto descritivo com melhor contraste */}
        <div className="text-center space-y-2">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Verificação de Segurança
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {useBackupCode
              ? 'Digite um dos seus códigos de backup de 8 caracteres'
              : 'Para sua segurança, digite o código do seu aplicativo autenticador'
            }
          </p>
        </div>

        {/* Input do código com melhor visual */}
        <div className="space-y-2">
          <Textinput
            label={useBackupCode ? "Código de Backup" : "Código 2FA"}
            value={code}
            onChange={(e) => {
              const maxLength = useBackupCode ? 8 : 6;
              // Para backup code, aceita A-F e 0-9 (hexadecimal)
              // Para TOTP, aceita apenas dígitos
              const cleanValue = useBackupCode
                ? e.target.value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase().slice(0, maxLength)
                : e.target.value.replace(/\D/g, "").slice(0, maxLength);
              setCode(cleanValue);
              setError("");
            }}
            placeholder={useBackupCode ? "A3F2B8C1" : "000000"}
            maxLength={useBackupCode ? 8 : 6}
            autoFocus
            error={error}
            className={`text-center text-2xl tracking-[0.5em] font-mono font-bold ${
              isDark
                ? 'bg-slate-700/50 border-slate-600'
                : 'bg-slate-50 border-slate-300'
            }`}
          />
          {error && (
            <p className={`text-sm text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          )}
        </div>

        {/* Link para alternar modo de backup code */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleBackupMode}
            className={`text-sm font-medium transition-colors ${
              isDark
                ? 'text-primary-400 hover:text-primary-300'
                : 'text-primary-600 hover:text-primary-700'
            }`}
            disabled={isVerifying}
          >
            {useBackupCode
              ? '← Voltar para código do autenticador'
              : 'Usar código de backup 2FA →'
            }
          </button>
        </div>

        {/* Botões com melhor contraste */}
        <div className="flex gap-3 pt-2">
          <Button
            text="Cancelar"
            className={`flex-1 border ${
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            onClick={handleClose}
            disabled={isVerifying}
          />
          <Button
            text={isVerifying ? "Verificando..." : "Verificar"}
            className={`flex-1 text-white ${
              isDark
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
            onClick={handleVerify}
            disabled={isVerifying || code.length !== (useBackupCode ? 8 : 6)}
            isLoading={isVerifying}
          />
        </div>

        {/* Link de suporte */}
        <p className={`text-xs text-center pt-2 border-t ${
          isDark
            ? 'text-slate-400 border-slate-700'
            : 'text-slate-500 border-slate-200'
        }`}>
          Não consegue acessar? Entre em contato com o suporte
        </p>
      </div>
    </Modal>
  );
};

export default TwoFactorVerification;
