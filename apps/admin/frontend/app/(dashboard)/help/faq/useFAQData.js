import { useTranslation } from 'react-i18next';

export const useFAQData = () => {
  const { t } = useTranslation('help');

  const categories = [
    { id: 'general', label: t('faq.categories.general.label'), icon: 'heroicons:information-circle', color: 'blue' },
    { id: 'deposits', label: t('faq.categories.deposits.label'), icon: 'heroicons:arrow-down-on-square', color: 'green' },
    { id: 'withdrawals', label: t('faq.categories.withdrawals.label'), icon: 'heroicons:banknotes', color: 'orange' },
    { id: 'transfers', label: t('faq.categories.transfers.label'), icon: 'heroicons:arrows-right-left', color: 'purple' },
    { id: 'exchange', label: t('faq.categories.exchange.label'), icon: 'heroicons:chart-bar', color: 'indigo' },
    { id: 'security', label: t('faq.categories.security.label'), icon: 'heroicons:shield-check', color: 'red' }
  ];

  const faqs = {
    'general': [
      {
        question: t('faq.categories.general.questions.whatIsCoinage.question'),
        answer: t('faq.categories.general.questions.whatIsCoinage.answer'),
        relatedLinks: [
          { label: t('faq.categories.general.questions.whatIsCoinage.links.tutorials'), path: '/help/tutorials' }
        ]
      },
      {
        question: t('faq.categories.general.questions.createAccount.question'),
        answer: t('faq.categories.general.questions.createAccount.answer'),
        relatedLinks: []
      },
      {
        question: t('faq.categories.general.questions.security.question'),
        answer: t('faq.categories.general.questions.security.answer'),
        relatedLinks: [
          { label: t('faq.categories.general.questions.security.links.configureSecurity'), path: '/security' }
        ]
      },
      {
        question: t('faq.categories.general.questions.kyc.question'),
        answer: t('faq.categories.general.questions.kyc.answer'),
        relatedLinks: [
          { label: t('faq.categories.general.questions.kyc.links.validateDocuments'), path: '/document-validation' }
        ]
      }
    ],
    'deposits': [
      {
        question: t('faq.categories.deposits.questions.howToDeposit.question'),
        answer: t('faq.categories.deposits.questions.howToDeposit.answer'),
        relatedLinks: [
          { label: t('faq.categories.deposits.questions.howToDeposit.links.makeDeposit'), path: '/deposit' },
          { label: t('faq.categories.deposits.questions.howToDeposit.links.tutorial'), path: '/help/tutorials' }
        ]
      },
      {
        question: t('faq.categories.deposits.questions.depositTime.question'),
        answer: t('faq.categories.deposits.questions.depositTime.answer'),
        relatedLinks: []
      },
      {
        question: t('faq.categories.deposits.questions.minDeposit.question'),
        answer: t('faq.categories.deposits.questions.minDeposit.answer'),
        relatedLinks: [
          { label: t('faq.categories.deposits.questions.minDeposit.links.viewFees'), path: '/fees' }
        ]
      },
      {
        question: t('faq.categories.deposits.questions.cancelDeposit.question'),
        answer: t('faq.categories.deposits.questions.cancelDeposit.answer'),
        relatedLinks: []
      }
    ],
    'withdrawals': [
      {
        question: t('faq.categories.withdrawals.questions.howToWithdraw.question'),
        answer: t('faq.categories.withdrawals.questions.howToWithdraw.answer'),
        relatedLinks: [
          { label: t('faq.categories.withdrawals.questions.howToWithdraw.links.makeWithdraw'), path: '/withdraw' },
          { label: t('faq.categories.withdrawals.questions.howToWithdraw.links.tutorial'), path: '/help/tutorials' }
        ]
      },
      {
        question: t('faq.categories.withdrawals.questions.withdrawTime.question'),
        answer: t('faq.categories.withdrawals.questions.withdrawTime.answer'),
        relatedLinks: []
      },
      {
        question: t('faq.categories.withdrawals.questions.withdrawLimit.question'),
        answer: t('faq.categories.withdrawals.questions.withdrawLimit.answer'),
        relatedLinks: [
          { label: t('faq.categories.withdrawals.questions.withdrawLimit.links.validateDocuments'), path: '/document-validation' }
        ]
      },
      {
        question: t('faq.categories.withdrawals.questions.withdrawFees.question'),
        answer: t('faq.categories.withdrawals.questions.withdrawFees.answer'),
        relatedLinks: [
          { label: t('faq.categories.withdrawals.questions.withdrawFees.links.viewFees'), path: '/fees' }
        ]
      }
    ],
    'transfers': [
      {
        question: t('faq.categories.transfers.questions.howToTransfer.question'),
        answer: t('faq.categories.transfers.questions.howToTransfer.answer'),
        relatedLinks: [
          { label: t('faq.categories.transfers.questions.howToTransfer.links.makeTransfer'), path: '/transfer' },
          { label: t('faq.categories.transfers.questions.howToTransfer.links.tutorial'), path: '/help/tutorials' }
        ]
      },
      {
        question: t('faq.categories.transfers.questions.transferLimit.question'),
        answer: t('faq.categories.transfers.questions.transferLimit.answer'),
        relatedLinks: []
      },
      {
        question: t('faq.categories.transfers.questions.cancelTransfer.question'),
        answer: t('faq.categories.transfers.questions.cancelTransfer.answer'),
        relatedLinks: []
      },
      {
        question: t('faq.categories.transfers.questions.checkTransfers.question'),
        answer: t('faq.categories.transfers.questions.checkTransfers.answer'),
        relatedLinks: [
          { label: t('faq.categories.transfers.questions.checkTransfers.links.viewStatement'), path: '/statement' }
        ]
      }
    ],
    'exchange': [
      {
        question: t('faq.categories.exchange.questions.orderTypes.question'),
        answer: t('faq.categories.exchange.questions.orderTypes.answer'),
        relatedLinks: [
          { label: t('faq.categories.exchange.questions.orderTypes.links.tutorial'), path: '/help/tutorials' },
          { label: t('faq.categories.exchange.questions.orderTypes.links.exchange'), path: '/exchange' }
        ]
      },
      {
        question: t('faq.categories.exchange.questions.tradingFees.question'),
        answer: t('faq.categories.exchange.questions.tradingFees.answer'),
        relatedLinks: [
          { label: t('faq.categories.exchange.questions.tradingFees.links.viewFees'), path: '/fees' }
        ]
      },
      {
        question: t('faq.categories.exchange.questions.cancelOrder.question'),
        answer: t('faq.categories.exchange.questions.cancelOrder.answer'),
        relatedLinks: [
          { label: t('faq.categories.exchange.questions.cancelOrder.links.orderBook'), path: '/exchange/book' }
        ]
      },
      {
        question: t('faq.categories.exchange.questions.orderBook.question'),
        answer: t('faq.categories.exchange.questions.orderBook.answer'),
        relatedLinks: [
          { label: t('faq.categories.exchange.questions.orderBook.links.tutorial'), path: '/help/tutorials' },
          { label: t('faq.categories.exchange.questions.orderBook.links.orderBook'), path: '/exchange/book' }
        ]
      }
    ],
    'security': [
      {
        question: t('faq.categories.security.questions.what2FA.question'),
        answer: t('faq.categories.security.questions.what2FA.answer'),
        relatedLinks: [
          { label: t('faq.categories.security.questions.what2FA.links.enable2FA'), path: '/security' }
        ]
      },
      {
        question: t('faq.categories.security.questions.enable2FA.question'),
        answer: t('faq.categories.security.questions.enable2FA.answer'),
        relatedLinks: [
          { label: t('faq.categories.security.questions.enable2FA.links.configureNow'), path: '/security' }
        ]
      },
      {
        question: t('faq.categories.security.questions.lost2FA.question'),
        answer: t('faq.categories.security.questions.lost2FA.answer'),
        relatedLinks: []
      },
      {
        question: t('faq.categories.security.questions.changePassword.question'),
        answer: t('faq.categories.security.questions.changePassword.answer'),
        relatedLinks: [
          { label: t('faq.categories.security.questions.changePassword.links.changePassword'), path: '/security' }
        ]
      },
      {
        question: t('faq.categories.security.questions.protectAccount.question'),
        answer: t('faq.categories.security.questions.protectAccount.answer'),
        relatedLinks: []
      }
    ]
  };

  return { categories, faqs };
};
