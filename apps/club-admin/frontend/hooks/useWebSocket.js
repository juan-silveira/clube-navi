import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (userAddress) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const currentScreenRef = useRef(null);

  useEffect(() => {
    if (!userAddress) return;

    // Conectar ao WebSocket
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800', {
      transports: ['websocket'],
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('🔌 Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      // console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup na desmontagem
    return () => {
      if (currentScreenRef.current) {
        socket.emit('leave_screen', { userId: userAddress });
      }
      socket.disconnect();
    };
  }, [userAddress]);

  // Função para se registrar em uma tela específica
  const joinScreen = (screen, contractAddress) => {
    if (!socketRef.current || !userAddress) {
      // console.log('❌ Cannot join screen: missing socket or userAddress', {
      //   hasSocket: !!socketRef.current,
      //   hasUserAddress: !!userAddress
      // });
      return;
    }

    // Sair da tela anterior se existir
    if (currentScreenRef.current) {
      console.log(`👋 Leaving previous screen: ${currentScreenRef.current.screen}`);
      socketRef.current.emit('leave_screen', { userId: userAddress });
    }

    // Entrar na nova tela
    const joinData = {
      userId: userAddress,
      screen,
      contractAddress
    };

    // console.log(`👤 Joining screen with data:`, joinData);
    socketRef.current.emit('join_screen', joinData);

    currentScreenRef.current = { screen, contractAddress };
    // console.log(`✅ Successfully joined screen: ${screen} (contract: ${contractAddress})`);
  };

  // Função para sair de uma tela
  const leaveScreen = () => {
    if (!socketRef.current || !userAddress) return;

    socketRef.current.emit('leave_screen', { userId: userAddress });
    currentScreenRef.current = null;
    // console.log('👋 Left screen');
  };

  // Função para escutar eventos específicos
  const onEvent = (eventName, callback) => {
    if (!socketRef.current) return;

    socketRef.current.on(eventName, callback);

    // Retornar função de cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, callback);
      }
    };
  };

  // Função para parar de escutar eventos
  const offEvent = (eventName, callback) => {
    if (!socketRef.current) return;
    socketRef.current.off(eventName, callback);
  };

  return {
    isConnected,
    joinScreen,
    leaveScreen,
    onEvent,
    offEvent,
    socket: socketRef.current
  };
};

export default useWebSocket;