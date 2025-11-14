"use client";

import { useRouter } from "next/navigation";
import usePermissions from "@/hooks/usePermissions";
import Tooltip from "@/components/ui/Tooltip";
import { ArrowLeft } from 'lucide-react';
import NewClubWizard from "@/components/wizards/NewClubWizard";

const NewClubPage = () => {
  const router = useRouter();
  const permissions = usePermissions();

  const handleBack = () => {
    router.push('/system/clubs');
  };

  if (!permissions.canViewSystemSettings) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Tooltip content="Voltar para lista de clubes" placement="bottom">
          <button
            onClick={handleBack}
            className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ArrowLeft size={22} className="text-slate-600 dark:text-slate-300" />
          </button>
        </Tooltip>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Criar Novo Clube
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Configure completamente um novo clube multi-tenant em 4 etapas
          </p>
        </div>
      </div>

      {/* Wizard Component */}
      <NewClubWizard />
    </div>
  );
};

export default NewClubPage;
