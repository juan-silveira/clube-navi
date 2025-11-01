"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useAuthStore from '@/store/authStore';
import ClientOnly from './ClientOnly';
import s3PhotoService from '@/services/s3PhotoService';

const UserAvatar = ({ 
  size = 'md', 
  className = '', 
  showOnlineStatus = false,
  clickable = false,
  onClick = null
}) => {
  const { user, profilePhotoUrl, setProfilePhotoUrl } = useAuthStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Size variants
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  const dotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2 h-2', 
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4',
    '3xl': 'w-5 h-5'
  };

  // Load profile photo automatically if not available
  useEffect(() => {
    const loadProfilePhoto = async () => {
      // Se não há usuário ou já tentamos carregar, não fazer nada
      if (!user?.id || isLoadingPhoto || hasAttemptedLoad) return;
      
      // Se já temos a foto no store ou no usuário, não precisa carregar
      if (profilePhotoUrl || user?.profilePicture) {
        // Se tem no usuário mas não no store, atualizar o store
        if (user?.profilePicture && !profilePhotoUrl) {
          setProfilePhotoUrl(user.profilePicture);
        }
        setHasAttemptedLoad(true);
        return;
      }

      setIsLoadingPhoto(true);
      setHasAttemptedLoad(true);
      
      try {
        const result = await s3PhotoService.loadProfilePhoto(user.id);
        
        if (result.url) {
          setProfilePhotoUrl(result.url);
        }
        // Não logar quando não há foto - isso é normal
      } catch (error) {
        // Só logar erros reais, não 404 ou 429
        if (!error.message?.includes('404') && !error.message?.includes('429')) {
          console.error('❌ [UserAvatar] Erro ao carregar foto:', error);
        }
      } finally {
        setIsLoadingPhoto(false);
      }
    };

    // Load apenas uma vez por sessão de usuário
    if (user?.id && !hasAttemptedLoad) {
      loadProfilePhoto();
    }
  }, [user?.id, hasAttemptedLoad, profilePhotoUrl, setProfilePhotoUrl]);

  // Se o usuário mudou, resetar o estado da foto
  useEffect(() => {
    if (!user?.id && profilePhotoUrl) {
      // Usuário foi deslogado, limpar foto
      setProfilePhotoUrl(null);
      setHasAttemptedLoad(false);
    }
  }, [user?.id, profilePhotoUrl, setProfilePhotoUrl]);

  // Escutar eventos de atualização de foto de perfil
  useEffect(() => {
    const handlePhotoUpdated = (event) => {
      const { userId, newUrl } = event.detail;
      // console.log('📸 [UserAvatar] Evento recebido:', { userId, newUrl, currentUserId: user?.id });
      
      // Só atualizar se for para o usuário atual
      if (userId === user?.id) {
        // console.log('📸 [UserAvatar] Atualizando foto para usuário atual:', newUrl);
        setProfilePhotoUrl(newUrl);
        setImageLoaded(false); // Forçar reload da imagem
      } else {
        // console.log('📸 [UserAvatar] Evento ignorado - usuário diferente');
      }
    };

    if (user?.id) {
      // console.log('📸 [UserAvatar] Registrando listener para usuário:', user.id);
      window.addEventListener('profilePhotoUpdated', handlePhotoUpdated);
    }

    return () => {
      if (user?.id) {
        // console.log('📸 [UserAvatar] Removendo listener para usuário:', user.id);
        window.removeEventListener('profilePhotoUpdated', handlePhotoUpdated);
      }
    };
  }, [user?.id, setProfilePhotoUrl]);

  // Reset image loaded state when URL changes
  useEffect(() => {
    setImageLoaded(false);
  }, [profilePhotoUrl]);

  // Generate user initials
  const getUserInitials = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [user?.name]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);
  }, []);

  const avatarClasses = useMemo(() => `
    ${sizeClasses[size]} 
    ${className}
    relative rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 
    ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all' : ''}
    bg-gradient-to-r from-blue-500 to-purple-600 
    flex items-center justify-center text-white font-bold
  `.trim(), [size, className, clickable]);

  return (
    <ClientOnly fallback={
      <div className={avatarClasses}>
        <span>{getUserInitials}</span>
        {showOnlineStatus && (
          <div className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-green-500 border-2 border-white dark:border-gray-800 rounded-full`} />
        )}
      </div>
    }>
      <div className={avatarClasses} onClick={clickable && onClick ? onClick : undefined}>
        {/* Always show initials as base */}
        <span className={`${profilePhotoUrl && imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          {getUserInitials}
        </span>
        
        {/* Profile photo overlay when available */}
        {profilePhotoUrl && (
          <img
            src={profilePhotoUrl.startsWith('http') ? profilePhotoUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${profilePhotoUrl}`}
            alt={`${user?.name || 'User'} profile`}
            className={`absolute inset-0 w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Online status indicator */}
        {showOnlineStatus && (
          <div className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-green-500 border-2 border-white dark:border-gray-800 rounded-full z-10`} />
        )}
      </div>
    </ClientOnly>
  );
};

export default React.memo(UserAvatar, (prevProps, nextProps) => {
  return (
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    prevProps.showOnlineStatus === nextProps.showOnlineStatus &&
    prevProps.clickable === nextProps.clickable &&
    prevProps.onClick === nextProps.onClick
  );
});