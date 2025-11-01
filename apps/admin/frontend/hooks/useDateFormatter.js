import { useMemo } from 'react';

export const useDateFormatter = () => {
  
  const formatBirthDate = useMemo(() => {
    return (birthDate) => {
      if (!birthDate) return "Não informado";
      
      try {
        // Para datas de nascimento, sempre extrair apenas a parte da data
        // e ignorar timezone para evitar mudança de dia
        let dateStr;
        
        if (typeof birthDate === 'string') {
          // Extrair apenas YYYY-MM-DD, ignorando horário e timezone
          dateStr = birthDate.split('T')[0];
        } else if (birthDate instanceof Date) {
          dateStr = birthDate.toISOString().split('T')[0];
        } else {
          dateStr = String(birthDate).split('T')[0];
        }
        
        // Validar formato YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          throw new Error('Formato de data inválido');
        }
        
        // Converter manualmente para pt-BR sem usar Date constructor
        // que pode ser afetado por timezone
        const [year, month, day] = dateStr.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        
      } catch (error) {
        console.error('Erro ao formatar data de nascimento:', birthDate, error);
        return "Data inválida";
      }
    };
  }, []);

  const formatDateTime = useMemo(() => {
    return (dateTime) => {
      if (!dateTime) return "Não informado";
      
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          throw new Error('Data/hora inválida');
        }
        
        return date.toLocaleDateString("pt-BR") + ' às ' + 
               date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error('Erro ao formatar data/hora:', dateTime, error);
        return "Data inválida";
      }
    };
  }, []);

  const formatDate = useMemo(() => {
    return (date) => {
      if (!date) return "Não informado";
      
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data inválida');
        }
        
        return dateObj.toLocaleDateString("pt-BR");
      } catch (error) {
        console.error('Erro ao formatar data:', date, error);
        return "Data inválida";
      }
    };
  }, []);

  return {
    formatBirthDate,
    formatDateTime, 
    formatDate
  };
};

export default useDateFormatter;