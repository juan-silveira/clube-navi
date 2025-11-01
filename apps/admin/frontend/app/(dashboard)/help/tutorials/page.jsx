"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';

const TutorialsPage = () => {
  const router = useRouter();
  const { t } = useTranslation('help');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const tutorials = [
    {
      id: 1,
      title: t('tutorials.list.firstDeposit.title'),
      description: t('tutorials.list.firstDeposit.description'),
      icon: "heroicons:arrow-down-on-square",
      videoPath: "/assets/videos/depositar.mp4",
      category: t('tutorials.categories.beginner'),
      size: "994KB"
    },
    {
      id: 2,
      title: t('tutorials.list.transfer.title'),
      description: t('tutorials.list.transfer.description'),
      icon: "heroicons:arrows-right-left",
      videoPath: "/assets/videos/transferir.mp4",
      category: t('tutorials.categories.beginner'),
      size: "550KB"
    },
    {
      id: 3,
      title: t('tutorials.list.withdraw.title'),
      description: t('tutorials.list.withdraw.description'),
      icon: "heroicons:banknotes",
      videoPath: "/assets/videos/sacar.mp4",
      category: t('tutorials.categories.beginner'),
      size: "619KB"
    },
    {
      id: 4,
      title: t('tutorials.list.marketBuy.title'),
      description: t('tutorials.list.marketBuy.description'),
      icon: "heroicons:arrow-trending-up",
      videoPath: "/assets/videos/compra-mercado.mp4",
      category: t('tutorials.categories.intermediate'),
      size: "635KB"
    },
    {
      id: 5,
      title: t('tutorials.list.marketSell.title'),
      description: t('tutorials.list.marketSell.description'),
      icon: "heroicons:arrow-trending-down",
      videoPath: "/assets/videos/venda-mercado.mp4",
      category: t('tutorials.categories.intermediate'),
      size: "597KB"
    },
    {
      id: 6,
      title: t('tutorials.list.limitBuy.title'),
      description: t('tutorials.list.limitBuy.description'),
      icon: "heroicons:book-open",
      videoPath: "/assets/videos/compra-ordem.mp4",
      category: t('tutorials.categories.advanced'),
      size: "1.7MB"
    },
    {
      id: 7,
      title: t('tutorials.list.limitSell.title'),
      description: t('tutorials.list.limitSell.description'),
      icon: "heroicons:chart-bar",
      videoPath: "/assets/videos/venda-ordem.mp4",
      category: t('tutorials.categories.advanced'),
      size: "2.2MB"
    }
  ];

  const getCategoryColor = (category) => {
    const beginner = t('tutorials.categories.beginner');
    const intermediate = t('tutorials.categories.intermediate');
    const advanced = t('tutorials.categories.advanced');

    switch (category) {
      case beginner:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case intermediate:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case advanced:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const openVideoModal = (tutorial) => {
    setSelectedVideo(tutorial);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/help')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('tutorials.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('tutorials.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <Card
            key={tutorial.id}
            className="hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            {/* Card Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Icon icon={tutorial.icon} className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(tutorial.category)}`}>
                  {tutorial.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tutorial.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {tutorial.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Icon icon="heroicons:film" className="w-4 h-4 mr-1" />
                  {t('tutorials.videoTutorial')}
                </div>
                <span>{tutorial.size}</span>
              </div>

              {/* Video Preview */}
              <div className="relative bg-gray-900 aspect-video group cursor-pointer rounded-lg overflow-hidden" onClick={() => openVideoModal(tutorial)}>
                <video
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                >
                  <source src={tutorial.videoPath} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Icon icon="heroicons:play" className="w-8 h-8 text-blue-600 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <div
            className="relative max-w-4xl w-full bg-gray-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Icon icon="heroicons:x-mark" className="w-6 h-6 text-white" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                className="w-full h-full"
                controls
                autoPlay
                src={selectedVideo.videoPath}
              >
                <source src={selectedVideo.videoPath} type="video/mp4" />
                {t('tutorials.modal.browserNotSupported')}
              </video>
            </div>

            {/* Video Info */}
            <div className="p-6 bg-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-gray-300">
                    {selectedVideo.description}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(selectedVideo.category)}`}>
                  {selectedVideo.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialsPage;
