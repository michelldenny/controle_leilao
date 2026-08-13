import React from "react";

interface FormattedNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  decimals?: number; // padrão: 2
  id?: string;
}

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  prefix,
  suffix,
  disabled = false,
  decimals = 2,
  id,
}) => {
  // Converte um número em string formatada pt-BR (ex: 1234.5 -> "1.234,50")
  const formatDisplay = (val: number | undefined | null): string => {
    if (val === undefined || val === null || isNaN(val) || val === 0) return "";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const [displayValue, setDisplayValue] = React.useState<string>(() => formatDisplay(value));

  // Sincronizar estado local quando a prop 'value' mudar externamente
  React.useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value, decimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Extrair apenas os dígitos numéricos
    const digitsOnly = rawInput.replace(/\D/g, "");

    if (!digitsOnly) {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Tratar como inteiro de centavos e dividir pela potência de 10 correspondente a 'decimals'
    const numericVal = parseInt(digitsOnly, 10) / Math.pow(10, decimals);
    
    // Formatar para exibição com separadores pt-BR
    const formatted = numericVal.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    setDisplayValue(formatted);
    onChange(numericVal);
  };

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${prefix ? "pl-8" : ""} ${suffix ? "pr-8" : ""}`}
      />
      {suffix && (
        <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};
