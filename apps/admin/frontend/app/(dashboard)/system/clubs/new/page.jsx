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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Tooltip content="Voltar" placement="bottom">
          <button
            onClick={handleBack}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </Tooltip>
      </div>

      {/* Wizard Component */}
      <NewClubWizard />
    </div>
  );
};

export default NewClubPage;
