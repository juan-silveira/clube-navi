"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import PortfolioDonutChart from "@/components/partials/widget/chart/portfolio-donut-chart";
import PortfolioSummary from "@/components/partials/widget/PortfolioSummary";
import Link from "next/link";
import SimpleBar from "simplebar-react";
import Earnings from "@/components/partials/widget/Earnings";
import CompanyTable from "@/components/partials/table/company-table";
import EarningsChart from "@/components/partials/widget/chart/earnings-chart";
import AccountReceivable from "@/components/partials/widget/chart/account-receivable";
import AccountPayable from "@/components/partials/widget/chart/account-payable";
import useAuthStore from "@/store/authStore";
import useCacheData from "@/hooks/useCacheData";
import useEarnings from "@/hooks/useEarnings";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const CardSlider = dynamic(
  () => import("@/components/partials/widget/CardSlider"),
  {
    ssr: false,
  }
);
import LastTransactions from "@/components/partials/table/LastTransactions";
import SelectMonth from "@/components/partials/SelectMonth";
import DigitalAssetsCard from "@/components/partials/widget/DigitalAssetsCard";
import { useTranslation } from "@/hooks/useTranslation";

const users = [
  {
    name: "Ab",
  },
  {
    name: "Bc",
  },
  {
    name: "Cd",
  },
  {
    name: "Df",
  },
  {
    name: "Ab",
  },
  {
    name: "Sd",
  },
  {
    name: "Sg",
  },
];

const BankingPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuthStore();
  const { balances, loading } = useCacheData();
  const { t } = useTranslation('dashboard');

  // Hook para gerenciar título da aba com contagem de notificações
  useDocumentTitle(t('title'), 'Clube Digital', true);

  // Hook compartilhado para earnings
  const earningsData = useEarnings({
    limit: 100, // Buscar mais dados para o gráfico
    autoFetch: true,
  });

  return (
    <div className="space-y-5">
      <Card
        title={t('portfolio.title')}
        subtitle={t('portfolio.subtitle')}
        bodyClass="p-4"
      >
        <PortfolioSummary />
      </Card>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-6 col-span-12 space-y-5">
          <DigitalAssetsCard />
        </div>
        <div className="lg:col-span-6 col-span-12 space-y-5">
          <LastTransactions />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
        <Earnings />
        <Card title={t('earnings.title')} subtitle={t('earnings.subtitle')}>
          <div className="legend-ring4">
            <EarningsChart earnings={earningsData.earnings || []} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BankingPage;
