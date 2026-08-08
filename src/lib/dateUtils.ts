/**
 * Utilitários para tratamento seguro de datas sem sofrer distorções de fuso horário (UTC vs Fuso Local).
 */

/**
 * Formata uma string de data no formato 'YYYY-MM-DD' para 'DD/MM/YYYY'
 * sem converter para objeto Date, evitando problemas de fuso horário UTC.
 */
export const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return "";
  
  // Se contiver horário ou espaço (ex: "2026-08-15 00:00:00" ou "2026-08-15T00:00:00"), extrair apenas a parte da data
  const cleanDateStr = dateStr.split("T")[0].split(" ")[0];
  const parts = cleanDateStr.split("-");
  
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
  }
  
  return dateStr;
};

/**
 * Retorna a data atual no fuso horário local no formato 'YYYY-MM-DD'.
 * Substitui o uso de `new Date().toISOString().split('T')[0]` que usa UTC
 * e pode alterar o dia após as 21:00 em fusos como o de Brasília (UTC-3).
 */
export const getLocalDateISO = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Retorna a chave no formato 'YYYY-MM' para agrupamento de relatórios e gráficos.
 */
export const getYearMonthKey = (dateStr?: string): string => {
  if (!dateStr) return "";
  const cleanStr = dateStr.split("T")[0].split(" ")[0];
  const parts = cleanStr.split("-");
  if (parts.length >= 2 && parts[0].length === 4) {
    return `${parts[0]}-${parts[1].padStart(2, "0")}`;
  }
  return "";
};

/**
 * Formata um valor numérico em moeda brasileira (R$).
 */
export const formatCurrency = (val: number): string => {
  return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
