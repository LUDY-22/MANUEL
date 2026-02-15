
/**
 * Formata valores para a moeda angolana (Kz)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(value).replace('AOA', 'Kz');
};

export const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

export const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(timestamp));
};
