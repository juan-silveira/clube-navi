import { useEffect, useRef, useState } from 'react';

// Gerenciador global de polling compartilhado
class SharedPollingManager {
  constructor() {
    this.channels = new Map(); // contractAddress -> BroadcastChannel
    this.intervals = new Map(); // contractAddress -> interval
    this.subscribers = new Map(); // contractAddress -> Set<callback>
    this.lastData = new Map(); // contractAddress -> last fetched data
  }

  subscribe(contractAddress, callback, fetchFunction, interval = 5000) {
    const key = contractAddress;

    // Criar canal se não existir
    if (!this.channels.has(key)) {
      const channel = new BroadcastChannel(`polling-${key}`);
      this.channels.set(key, channel);
      this.subscribers.set(key, new Set());

      // Listener para dados compartilhados
      channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'data-update') {
          this.lastData.set(key, data);
          // Notificar todos os subscribers locais
          const subs = this.subscribers.get(key);
          if (subs) {
            subs.forEach(cb => cb(data));
          }
        }
      };
    }

    // Adicionar subscriber
    const subscribers = this.subscribers.get(key);
    subscribers.add(callback);

    // Enviar dados existentes imediatamente se disponível
    const lastData = this.lastData.get(key);
    if (lastData) {
      callback(lastData);
    }

    // Iniciar polling se for o primeiro subscriber
    if (subscribers.size === 1) {
      this.startPolling(key, fetchFunction, interval);
    }

    // Retornar função de cleanup
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);

        // Parar polling se não há mais subscribers
        if (subs.size === 0) {
          this.stopPolling(key);
        }
      }
    };
  }

  async startPolling(contractAddress, fetchFunction, interval = 5000) {
    const key = contractAddress;

    // Não iniciar se já está rodando
    if (this.intervals.has(key)) return;

    console.log(`🔄 Iniciando polling compartilhado para ${key}`);

    const poll = async () => {
      try {
        const data = await fetchFunction();

        // Só atualizar se dados mudaram (evitar re-renders desnecessários)
        const lastData = this.lastData.get(key);
        const dataChanged = JSON.stringify(data) !== JSON.stringify(lastData);

        if (dataChanged) {
          // Armazenar dados localmente
          this.lastData.set(key, data);

          // Broadcast para outras abas/windows
          const channel = this.channels.get(key);
          if (channel) {
            channel.postMessage({
              type: 'data-update',
              data: data
            });
          }

          // Notificar subscribers locais
          const subscribers = this.subscribers.get(key);
          if (subscribers) {
            subscribers.forEach(callback => callback(data));
          }
        }
      } catch (error) {
        console.error(`❌ Erro no polling compartilhado para ${key}:`, error);
      }
    };

    // Fetch inicial
    await poll();

    // Configurar intervalo
    const pollingInterval = setInterval(poll, interval);
    this.intervals.set(key, pollingInterval);
  }

  stopPolling(contractAddress) {
    const key = contractAddress;

    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
      console.log(`⏹️ Parando polling compartilhado para ${key}`);
    }

    // Fechar canal se não há subscribers
    const subscribers = this.subscribers.get(key);
    if (!subscribers || subscribers.size === 0) {
      const channel = this.channels.get(key);
      if (channel) {
        channel.close();
        this.channels.delete(key);
      }
      this.subscribers.delete(key);
      this.lastData.delete(key);
    }
  }
}

// Instância global
const globalPollingManager = new SharedPollingManager();

// Hook para usar polling compartilhado
const useSharedPolling = (contractAddress, fetchFunction, enabled = true, interval = 5000) => {
  const [data, setData] = useState(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!enabled || !contractAddress || !fetchFunction) {
      return;
    }

    // Subscribe ao polling compartilhado
    cleanupRef.current = globalPollingManager.subscribe(
      contractAddress,
      setData,
      fetchFunction,
      interval
    );

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [contractAddress, enabled, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return data;
};

export default useSharedPolling;