import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Info, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  RefreshCcw,
  DollarSign,
  Layers,
  PieChart,
  Activity,
  ChevronRight,
  Target,
  Zap,
  HelpCircle,
  Search,
  Download,
  Share2,
  Settings,
  Eye,
  Lock,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { calculateValuation, ValuationInputs, ValuationResults } from './types';
import { fetchStockData } from './services/stockService';

// --- Componentes de UI Refinados ---

const GlassCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "bg-zinc-900/30 border border-zinc-800/40 rounded-[2rem] backdrop-blur-xl shadow-2xl overflow-hidden",
      className
    )}
  >
    {children}
  </motion.div>
);

const TooltipContent = ({ 
  title, 
  description, 
  impact, 
  example 
}: { 
  title: string, 
  description: string, 
  impact: string, 
  example: string 
}) => (
  <div className="w-72 p-5 bg-zinc-950/95 border border-zinc-800 rounded-[1.5rem] shadow-2xl backdrop-blur-3xl z-[100]">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
      <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{title}</span>
    </div>
    <div className="space-y-4">
      <p className="text-[11px] leading-relaxed text-zinc-300 font-medium">{description}</p>
      <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-1">Impacto no Valor</span>
        <p className="text-[10px] leading-relaxed text-zinc-400 italic">{impact}</p>
      </div>
      <div className="flex items-start gap-2">
        <div className="mt-1 p-1 bg-blue-500/10 rounded-md">
          <Zap size={10} className="text-blue-400" />
        </div>
        <div>
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">Exemplo Prático</span>
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">{example}</p>
        </div>
      </div>
    </div>
  </div>
);

const SliderInput = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 0.1, 
  onChange, 
  suffix = "", 
  tooltipTitle = "",
  tooltipDesc = "",
  tooltipImpact = "",
  tooltipExample = "",
  warning = ""
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step?: number;
  onChange: (val: number) => void; 
  suffix?: string;
  tooltipTitle?: string;
  tooltipDesc?: string;
  tooltipImpact?: string;
  tooltipExample?: string;
  warning?: string;
}) => {
  const isOutOfBounds = value < min || value > max;

  return (
    <div className={cn(
      "group flex flex-col gap-3 p-4 rounded-2xl border transition-all",
      isOutOfBounds || warning 
        ? "bg-rose-500/5 border-rose-500/40" 
        : "bg-zinc-950/30 border-zinc-800/50 hover:border-zinc-700/50"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            isOutOfBounds || warning ? "text-rose-400" : "text-zinc-500 group-focus-within:text-orange-400"
          )}>
            {label}
          </label>
          {tooltipTitle && (
            <div className="group/tip relative">
              <HelpCircle size={12} className="text-zinc-700 cursor-help hover:text-zinc-400 transition-colors" />
              <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover/tip:opacity-100 transition-all translate-y-1 group-hover/tip:translate-y-0 pointer-events-none z-[100]">
                <TooltipContent 
                  title={tooltipTitle} 
                  description={tooltipDesc} 
                  impact={tooltipImpact} 
                  example={tooltipExample} 
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input 
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={cn(
              "w-20 bg-transparent text-right text-xs font-mono font-bold focus:outline-none",
              isOutOfBounds || warning ? "text-rose-400" : "text-zinc-200"
            )}
          />
          <span className="text-[10px] font-bold text-zinc-600 uppercase">{suffix}</span>
        </div>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(Math.max(value, min), max)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={cn(
            "w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all",
            isOutOfBounds || warning ? "bg-rose-900/40 accent-rose-500" : "bg-zinc-800 accent-orange-500 hover:accent-orange-400"
          )}
        />
      </div>
      {(isOutOfBounds || warning) && (
        <div className="flex items-center gap-1.5 mt-1">
          <AlertTriangle size={10} className="text-rose-500" />
          <span className="text-[9px] font-bold text-rose-500/80 uppercase tracking-tight">
            {warning || (value < min ? `Mínimo sugerido: ${min}${suffix}` : `Máximo sugerido: ${max}${suffix}`)}
          </span>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, subValue, icon: Icon, trend, colorClass, delay = 0 }: { 
  label: string, 
  value: string, 
  subValue?: string, 
  icon: any, 
  trend?: 'up' | 'down' | 'neutral',
  colorClass?: string,
  delay?: number
}) => (
  <GlassCard className="p-8 relative group" delay={delay}>
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
      <Icon size={80} />
    </div>
    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">{label}</span>
    <div className="flex items-baseline gap-3">
      <AnimatePresence mode="wait">
        <motion.span 
          key={value}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn("text-4xl font-mono font-black tracking-tighter", colorClass || "text-zinc-100")}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {trend && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}
        >
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {subValue}
        </motion.div>
      )}
    </div>
  </GlassCard>
);

export default function App() {
  const [inputs, setInputs] = useState<ValuationInputs>({
    empresa: 'CMIG4',
    lpaProjetado: 1.40,
    taxaDesconto: 12.0,
    cagrLiquido: 8.0,
    crescimentoG: 6.0,
    plSetor: 11.29,
    vpa: 10.0,
    roe: 14.0,
    dy: 15.0,
    fcfPercent: 35.0,
    cotacaoAtual: 12.57,
    notaRisco: 5
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Efeito de "Cálculo" para feedback visual (Behavioral Design)
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 400);
    return () => clearTimeout(timer);
  }, [inputs]);

  const results = useMemo(() => calculateValuation(inputs), [inputs]);

  const chartData = [
    { name: 'DCF', value: results.dcfPTMargem, color: '#f97316', desc: 'Preço Teto DCF (Margem 25%)' },
    { name: 'Graham', value: results.grahamMethod, color: '#3b82f6', desc: 'Fórmula de Benjamin Graham' },
    { name: 'Bazin', value: results.bazinMethod, color: '#10b981', desc: 'Método de Décio Bazin' },
    { name: 'VPA', value: results.vpaMethod, color: '#a855f7', desc: 'Valor Patrimonial Ajustado' },
    { name: 'P/L', value: results.valuationPL, color: '#eab308', desc: 'Múltiplo P/L Setorial' },
    { name: 'Final', value: results.precoJustoFinal, color: '#f43f5e', desc: 'Preço Justo Ponderado' },
  ];

  const riskNotes = [1, 3, 5, 7, 9, 11];

  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const handleFetchStock = async () => {
    if (!inputs.empresa) return;
    setIsLoadingStock(true);
    setStockError(null);
    try {
      const data = await fetchStockData(inputs.empresa);
      setInputs(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      setStockError("Erro ao buscar dados. Verifique o ticker.");
      setTimeout(() => setStockError(null), 3000);
    } finally {
      setIsLoadingStock(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Barra Lateral Minimalista */}
      <aside className="fixed left-0 top-0 bottom-0 w-24 border-r border-zinc-800/30 bg-zinc-950/50 backdrop-blur-3xl flex flex-col items-center py-12 gap-12 z-50 hidden lg:flex">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 cursor-pointer"
        >
          <Calculator className="text-white" size={28} />
        </motion.div>
        
        <nav className="flex flex-col gap-10">
          {[Activity, Layers, PieChart, Target].map((Icon, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.2, color: '#f97316' }}
              className={cn(
                "p-2 cursor-pointer transition-colors",
                i === 0 ? "text-orange-500" : "text-zinc-700"
              )}
            >
              <Icon size={24} />
            </motion.div>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-8">
          <Settings size={22} className="text-zinc-800 hover:text-zinc-500 cursor-pointer transition-colors" />
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-600 transition-all">
            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-24">
        {/* Header de Alta Fidelidade */}
        <header className="h-28 border-b border-zinc-800/30 bg-zinc-950/40 backdrop-blur-2xl sticky top-0 z-40 px-12 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={isCalculating ? { scale: [1, 1.1, 1] } : {}}
                className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
              />
              <h1 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase italic">
                {inputs.empresa || 'Empresa'} <span className="text-orange-500">Terminal</span>
              </h1>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em]">v1.5 QUANT PRO</span>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] mt-2">Sistemas de Análise de Equity • Grau Institucional</p>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Cotação de Mercado</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono text-zinc-200 font-black tracking-tighter">R$ {inputs.cotacaoAtual.toFixed(2)}</span>
                <div className="p-1 bg-zinc-900 rounded-md border border-zinc-800">
                  <Search size={12} className="text-zinc-600" />
                </div>
              </div>
            </div>
            <div className="h-14 w-px bg-zinc-800/50" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-orange-500/80 uppercase tracking-widest mb-1">Valor Justo Calculado</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={results.precoJustoFinal}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "text-4xl font-mono font-black tracking-tighter leading-none",
                    results.upside > 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  R$ {results.precoJustoFinal.toFixed(2)}
                </motion.span>
              </AnimatePresence>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: '#18181b' }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 shadow-xl"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </header>

        <main className="p-12 max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Coluna de Configuração (Esquerda) */}
          <section className="xl:col-span-4 space-y-10">
            <GlassCard className="p-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-orange-500/10 rounded-2xl">
                    <Settings size={18} className="text-orange-500" />
                  </div>
                  <h2 className="text-sm font-black text-zinc-100 uppercase tracking-[0.3em]">Parâmetros</h2>
                </div>
                <motion.button 
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6, ease: "circOut" }}
                  onClick={() => setInputs({
                    empresa: 'CMIG4', lpaProjetado: 1.40, taxaDesconto: 12.0, cagrLiquido: 8.0, crescimentoG: 6.0,
                    plSetor: 11.29, vpa: 10.0, roe: 14.0, dy: 15.0, fcfPercent: 35.0, cotacaoAtual: 12.57, notaRisco: 5
                  })}
                  className="p-2 text-zinc-700 hover:text-orange-500 transition-colors"
                >
                  <RefreshCcw size={18} />
                </motion.button>
              </div>

              <div className="space-y-8">
                {/* Grupo: Identificação */}
                <div className="space-y-6">
                  <div className="group flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-1">
                      <label className="text-[10px] font-black text-zinc-500 group-focus-within:text-orange-400 transition-colors uppercase tracking-widest">Ticker do Ativo</label>
                      <div className="group/tip relative">
                        <HelpCircle size={10} className="text-zinc-700 cursor-help hover:text-zinc-400 transition-colors" />
                        <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover/tip:opacity-100 transition-all translate-y-1 group-hover/tip:translate-y-0 pointer-events-none z-[100]">
                          <TooltipContent 
                            title="Ticker do Ativo" 
                            description="Código de negociação da empresa na bolsa de valores (B3)." 
                            impact="Identifica o ativo para contextualização do setor e busca de dados fundamentais." 
                            example="Exemplos: PETR4 (Petrobras), VALE3 (Vale), ITUB4 (Itaú), CMIG4 (Cemig)." 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700">
                          <Search size={16} />
                        </div>
                        <input
                          type="text"
                          value={inputs.empresa}
                          onChange={(e) => setInputs(p => ({ ...p, empresa: e.target.value.toUpperCase() }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleFetchStock()}
                          className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-2xl pl-14 pr-6 py-4 text-sm font-mono font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 transition-all uppercase"
                          placeholder="EX: VALE3"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFetchStock}
                        disabled={isLoadingStock}
                        className={cn(
                          "px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                          isLoadingStock 
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                            : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400"
                        )}
                      >
                        {isLoadingStock ? (
                          <RefreshCcw size={14} className="animate-spin" />
                        ) : (
                          <Zap size={14} />
                        )}
                        {isLoadingStock ? "..." : "Buscar"}
                      </motion.button>
                    </div>
                    {stockError && (
                      <motion.span 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-bold text-rose-500 uppercase tracking-tight px-2"
                      >
                        {stockError}
                      </motion.span>
                    )}
                  </div>

                  <SliderInput 
                    label="Cotação Atual" 
                    value={inputs.cotacaoAtual} 
                    min={0.01} max={500} step={0.01}
                    onChange={(v) => setInputs(p => ({ ...p, cotacaoAtual: v }))}
                    suffix="BRL"
                    tooltipTitle="Cotação de Mercado"
                    tooltipDesc="O preço atual de negociação da ação no mercado secundário (B3)."
                    tooltipImpact="É o denominador do cálculo de Upside. Quanto menor a cotação em relação ao Preço Justo, maior o potencial de ganho."
                    tooltipExample={`Cotação R$ ${inputs.cotacaoAtual.toFixed(2)} vs Preço Justo R$ ${results.precoJustoFinal.toFixed(2)} = Upside de ${results.upside.toFixed(2)}%.`}
                  />
                  
                  <SliderInput 
                    label="LPA Projetado (Ano 1)" 
                    value={inputs.lpaProjetado} 
                    min={0} max={20} step={0.01}
                    onChange={(v) => setInputs(p => ({ ...p, lpaProjetado: v }))}
                    suffix="BRL"
                    tooltipTitle="Lucro por Ação (LPA)"
                    tooltipDesc="Lucro líquido da empresa dividido pelo total de ações. Representa a parcela do lucro que pertence a cada ação."
                    tooltipImpact="É a base multiplicadora principal. Um aumento de 10% no LPA eleva o Preço Justo em 10% nos modelos de Graham e P/L."
                    tooltipExample={`LPA R$ ${inputs.lpaProjetado.toFixed(2)} x P/L 10 = R$ ${(inputs.lpaProjetado * 10).toFixed(2)}. Se o LPA subir 20% (R$ ${(inputs.lpaProjetado * 1.2).toFixed(2)}), o valor justo sobe proporcionalmente.`}
                  />
                </div>

                {/* Grupo: Crescimento */}
                <div className="grid grid-cols-1 gap-6">
                  <SliderInput 
                    label="Crescimento CAGR (5Y)" 
                    value={inputs.cagrLiquido} 
                    min={0} max={40}
                    onChange={(v) => setInputs(p => ({ ...p, cagrLiquido: v }))}
                    suffix="%"
                    tooltipTitle="Crescimento CAGR"
                    tooltipDesc="Taxa de crescimento anual composta esperada para os lucros nos próximos 5 anos."
                    tooltipImpact="Impacto exponencial no DCF. Mudar de 8% para 12% pode elevar o valor intrínseco em mais de 20% devido ao efeito dos juros compostos."
                    tooltipExample={`Com lucro de R$ 100 e crescimento de ${inputs.cagrLiquido}%, em 5 anos o lucro será R$ ${(100 * Math.pow(1 + inputs.cagrLiquido/100, 5)).toFixed(2)}.`}
                  />
                  <SliderInput 
                    label="Crescimento Perpétuo (G)" 
                    value={inputs.crescimentoG} 
                    min={0} max={10}
                    onChange={(v) => setInputs(p => ({ ...p, crescimentoG: v }))}
                    suffix="%"
                    tooltipTitle="Crescimento Perpétuo (g)"
                    tooltipDesc="Taxa de crescimento esperada da empresa 'para sempre' após o 5º ano de projeção."
                    tooltipImpact="Define o Valor Terminal. Deve ser conservador. Se G >= WACC, o sistema ajusta G para ser ligeiramente menor que a taxa de desconto para evitar valores infinitos ou inflados."
                    tooltipExample={`Se a economia cresce 3% e você projeta ${inputs.crescimentoG}%, você assume que a empresa ganhará mercado perpetuamente.`}
                    warning={inputs.crescimentoG >= inputs.taxaDesconto ? "G deve ser menor que o WACC" : ""}
                  />
                  <SliderInput 
                    label="Taxa de Desconto (WACC)" 
                    value={inputs.taxaDesconto} 
                    min={5} max={25}
                    onChange={(v) => setInputs(p => ({ ...p, taxaDesconto: v }))}
                    suffix="%"
                    tooltipTitle="Taxa de Desconto (WACC)"
                    tooltipDesc="Representa o risco e o custo de oportunidade do capital investido. É a taxa usada para trazer valores futuros ao presente."
                    tooltipImpact="Relação inversa: se o WACC sobe (ex: juros altos), o valor presente dos lucros futuros cai drasticamente."
                    tooltipExample={`Com WACC de ${inputs.taxaDesconto}%, um lucro de R$ 100 daqui a 5 anos vale hoje apenas R$ ${(100 / Math.pow(1 + inputs.taxaDesconto/100, 5)).toFixed(2)}.`}
                  />
                </div>

                {/* Grupo: Fluxo de Caixa (Separado conforme pedido) */}
                <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Configuração de Fluxo</span>
                  </div>
                  <SliderInput 
                    label="Margem FCF (%)" 
                    value={inputs.fcfPercent} 
                    min={0} max={100}
                    onChange={(v) => setInputs(p => ({ ...p, fcfPercent: v }))}
                    suffix="%"
                    tooltipTitle="Margem de Fluxo de Caixa (FCF)"
                    tooltipDesc="Percentual do lucro líquido que efetivamente se transforma em caixa livre para o acionista."
                    tooltipImpact="Define quanto do lucro projetado será usado no cálculo do DCF. Valores maiores elevam o preço justo."
                    tooltipExample={`Com LPA de R$ ${inputs.lpaProjetado.toFixed(2)} e Margem FCF de ${inputs.fcfPercent}%, o caixa livre por ação é R$ ${(inputs.lpaProjetado * inputs.fcfPercent / 100).toFixed(2)}.`}
                  />
                </div>

                {/* Grupo: Múltiplos */}
                <div className="grid grid-cols-1 gap-6">
                  <SliderInput 
                    label="P/L Médio do Setor" 
                    value={inputs.plSetor} 
                    min={1} max={50}
                    onChange={(v) => setInputs(p => ({ ...p, plSetor: v }))}
                    suffix="x"
                    tooltipTitle="P/L Setorial"
                    tooltipDesc="Múltiplo Preço/Lucro médio histórico das empresas do mesmo setor de atuação."
                    tooltipImpact="Define o 'preço de mercado justo' relativo aos pares. Indica quanto o mercado paga por cada R$ 1 de lucro gerado."
                    tooltipExample={`Se o setor negocia a ${inputs.plSetor}x e o LPA é R$ ${inputs.lpaProjetado.toFixed(2)}, o preço alvo pelo P/L é R$ ${(inputs.lpaProjetado * inputs.plSetor).toFixed(2)}.`}
                  />
                  <SliderInput 
                    label="Dividend Yield (%)" 
                    value={inputs.dy} 
                    min={0} max={30}
                    onChange={(v) => setInputs(p => ({ ...p, dy: v }))}
                    suffix="%"
                    tooltipTitle="Dividend Yield (DY)"
                    tooltipDesc="Rendimento de dividendos esperado em relação ao preço da ação."
                    tooltipImpact="Base do Método Bazin. Define o Preço Teto para garantir uma renda mínima (ex: 6% ao ano conforme Bazin)."
                    tooltipExample={`Com DY de ${inputs.dy}% e LPA de R$ ${inputs.lpaProjetado.toFixed(2)}, o dividendo é R$ ${(inputs.lpaProjetado * (inputs.dy / 100)).toFixed(2)}. O Preço Teto Bazin (6%) é R$ ${((inputs.lpaProjetado * (inputs.dy / 100)) / 0.06).toFixed(2)}.`}
                  />
                </div>

                {/* Grupo: Patrimonial */}
                <div className="grid grid-cols-1 gap-6">
                  <SliderInput 
                    label="VPA (Valor Patrimonial)" 
                    value={inputs.vpa} 
                    min={0} max={100}
                    onChange={(v) => setInputs(p => ({ ...p, vpa: v }))}
                    suffix="BRL"
                    tooltipTitle="Valor Patrimonial (VPA)"
                    tooltipDesc="Patrimônio Líquido da empresa dividido pelo total de ações. É o valor contábil líquido."
                    tooltipImpact="Representa o 'chão' do preço. Usado no modelo de Graham para limitar o prêmio pago sobre ativos físicos."
                    tooltipExample={`Com VPA de R$ ${inputs.vpa.toFixed(2)}, se a ação custa R$ ${inputs.cotacaoAtual.toFixed(2)}, o P/VP atual é de ${(inputs.cotacaoAtual / (inputs.vpa || 1)).toFixed(2)}x.`}
                  />
                  <SliderInput 
                    label="ROE (%)" 
                    value={inputs.roe} 
                    min={0} max={60}
                    onChange={(v) => setInputs(p => ({ ...p, roe: v }))}
                    suffix="%"
                    tooltipTitle="ROE (Retorno sobre PL)"
                    tooltipDesc="Mede a eficiência da empresa em gerar lucro com o capital dos acionistas (Lucro Líquido / Patrimônio Líquido)."
                    tooltipImpact="ROEs altos justificam a empresa negociar com prêmio sobre o valor contábil (P/VP > 1). Indica vantagem competitiva."
                    tooltipExample={`Um ROE de ${inputs.roe}% indica que para cada R$ 100 de patrimônio, a empresa gera R$ ${inputs.roe.toFixed(2)} de lucro líquido.`}
                  />
                </div>

                {/* Nota de Risco (Behavioral: Gamification) */}
                <div className="p-8 bg-zinc-950/50 border border-zinc-800/80 rounded-[2rem] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Score de Risco Qualitativo</span>
                        <div className="group/tip relative">
                          <HelpCircle size={10} className="text-zinc-700 cursor-help hover:text-zinc-400 transition-colors" />
                          <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover/tip:opacity-100 transition-all translate-y-1 group-hover/tip:translate-y-0 pointer-events-none z-[100]">
                            <TooltipContent 
                              title="Score de Risco" 
                              description="Avaliação subjetiva do investidor sobre a qualidade da gestão, governança e competitividade." 
                              impact="Aplica um desconto adicional sobre a média ponderada. Quanto maior a nota, maior o risco e menor o preço justo final." 
                              example={`Com nota ${inputs.notaRisco}, o multiplicador de segurança é ${(0.45 + (inputs.notaRisco * 0.05)).toFixed(2)}x. Uma nota 11 (risco máximo) aplica um desconto muito maior.`} 
                            />
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Ajuste de Segurança Final</span>
                    </div>
                    <motion.div 
                      key={inputs.notaRisco}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center"
                    >
                      <span className="text-xl font-mono text-orange-500 font-black">{inputs.notaRisco}</span>
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {riskNotes.map((note) => (
                      <motion.button
                        key={note}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setInputs(prev => ({ ...prev, notaRisco: note }))}
                        className={cn(
                          "h-10 text-[10px] font-mono rounded-xl border transition-all flex items-center justify-center",
                          inputs.notaRisco === note 
                            ? "bg-orange-500 border-orange-500 text-black font-black shadow-lg shadow-orange-500/40" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                        )}
                      >
                        {note}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Baixo Risco</span>
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Alto Risco</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>

          {/* Coluna de Resultados (Direita) */}
          <section className="xl:col-span-8 space-y-12">
            
            {/* Dashboard de Métricas de Impacto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard 
                label="Potencial de Alta (Upside)" 
                value={`${results.upside > 0 ? '+' : ''}${results.upside.toFixed(2)}%`}
                subValue={`${Math.abs(results.upside).toFixed(1)}%`}
                icon={TrendingUp}
                trend={results.upside > 0 ? 'up' : 'down'}
                colorClass={results.upside > 0 ? "text-emerald-400" : "text-rose-400"}
                delay={0.1}
              />
              <StatCard 
                label="Margem de Segurança" 
                value={`${results.margemSeguranca.toFixed(2)}%`}
                icon={ShieldCheck}
                colorClass={results.margemSeguranca > 20 ? "text-emerald-400" : results.margemSeguranca > 0 ? "text-orange-400" : "text-rose-400"}
                delay={0.2}
              />
              <GlassCard className="p-8 flex flex-col justify-center relative group" delay={0.3}>
                <div className="absolute -top-6 -right-6 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                  <Target size={140} />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Veredito do Sistema</span>
                <div className="flex items-center gap-5">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "w-4 h-4 rounded-full",
                      results.upside > 25 ? "bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.7)]" : 
                      results.upside > 0 ? "bg-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.7)]" : 
                      "bg-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.7)]"
                    )} 
                  />
                  <span className={cn(
                    "text-4xl font-black uppercase tracking-tighter italic leading-none",
                    results.upside > 25 ? "text-emerald-400" : results.upside > 0 ? "text-orange-400" : "text-rose-400"
                  )}>
                    {results.upside > 25 ? 'Compra Forte' : results.upside > 0 ? 'Manter / Neutro' : 'Venda Forte'}
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Visualizações de Dados Avançadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Comparativo de Metodologias */}
              <GlassCard className="p-10" delay={0.4}>
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                      <BarChart3 size={20} />
                    </div>
                    <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.3em]">Convergência de Modelos</h3>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Preço de Mercado</span>
                  </div>
                </div>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#52525b', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'monospace' }}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#121214', radius: 12 }}
                        contentStyle={{ 
                          backgroundColor: '#09090b', 
                          border: '1px solid #27272a',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          padding: '16px',
                          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)'
                        }}
                        formatter={(value: number, name: string, props: any) => [
                          <span className="font-black text-zinc-100">R$ {value.toFixed(2)}</span>, 
                          <span className="text-zinc-500 uppercase text-[10px] tracking-widest">{props.payload.desc}</span>
                        ]}
                      />
                      <ReferenceLine 
                        y={inputs.cotacaoAtual} 
                        stroke="#f97316" 
                        strokeDasharray="8 8" 
                        strokeWidth={3}
                        label={{ position: 'top', value: 'MERCADO', fill: '#f97316', fontSize: 10, fontWeight: 900, dy: -15 }} 
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={44}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Projeção de Fluxo de Caixa */}
              <GlassCard className="p-10" delay={0.5}>
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                      <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.3em]">Projeção de Lucros (5Y)</h3>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Crescimento: {inputs.cagrLiquido}%</span>
                  </div>
                </div>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.fluxos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLpa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                      <XAxis 
                        dataKey="ano" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'monospace' }}
                        tickFormatter={(v) => `Ano ${v}`}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'monospace' }}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#09090b', 
                          border: '1px solid #27272a',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          padding: '16px'
                        }}
                        formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Lucro Projetado']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lpa" 
                        stroke="#f97316" 
                        fillOpacity={1} 
                        fill="url(#colorLpa)" 
                        strokeWidth={4}
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Resumo de Métodos e Tabela Técnica */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Tabela de Fluxo de Caixa */}
              <GlassCard className="lg:col-span-2 p-10" delay={0.6}>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                      <Activity size={20} />
                    </div>
                    <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.3em]">Detalhamento Técnico (DCF)</h3>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-zinc-300 uppercase tracking-widest transition-colors"
                  >
                    <Download size={14} /> Exportar Dados
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800/60">
                        <th className="pb-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Período</th>
                        <th className="pb-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">LPA Projetado</th>
                        <th className="pb-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">FCF (35%)</th>
                        <th className="pb-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Valor Presente</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] font-mono">
                      {results.fluxos.map((f, i) => (
                        <motion.tr 
                          key={f.ano} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + (i * 0.1) }}
                          className="border-b border-zinc-800/30 group hover:bg-zinc-800/10 transition-colors"
                        >
                          <td className="py-5 text-zinc-500 font-black uppercase tracking-widest text-[11px]">Ano {f.ano}</td>
                          <td className="py-5 text-right text-zinc-300">R$ {f.lpa.toFixed(2)}</td>
                          <td className="py-5 text-right text-zinc-600">R$ {f.fcf.toFixed(2)}</td>
                          <td className="py-5 text-right text-emerald-500/80 font-black">R$ {f.pv.toFixed(2)}</td>
                        </motion.tr>
                      ))}
                      <tr className="bg-orange-500/5">
                        <td className="py-6 px-6 text-zinc-400 font-black uppercase tracking-widest text-[11px]">Valor Terminal (PV)</td>
                        <td colSpan={2} />
                        <td className="py-6 px-6 text-right text-orange-500 font-black text-lg">R$ {(results.dcfIntrinsic - results.fluxos.reduce((acc, f) => acc + f.pv, 0)).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Resumo Ponderado e Ação */}
              <GlassCard className="p-10 flex flex-col" delay={0.7}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                    <PieChart size={20} />
                  </div>
                  <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.3em]">Ponderação Final</h3>
                </div>
                
                <div className="space-y-10 flex-1">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Média Ponderada</span>
                      <span className="text-lg font-mono text-zinc-100 font-black">R$ {results.mediaPonderada.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Fator de Risco</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Nota {inputs.notaRisco}</span>
                      </div>
                      <span className="text-lg font-mono text-orange-400 font-black">{(0.45 + (inputs.notaRisco * 0.05)).toFixed(2)}x</span>
                    </div>
                    <div className="h-px bg-zinc-800/60" />
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-[12px] font-black text-zinc-300 uppercase tracking-widest">Preço Justo Final</span>
                      <motion.span 
                        animate={isCalculating ? { scale: [1, 1.1, 1] } : {}}
                        className="text-3xl font-mono text-emerald-400 font-black tracking-tighter"
                      >
                        R$ {results.precoJustoFinal.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-zinc-950/60 border border-zinc-800/80 rounded-3xl space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                    <p className="text-[12px] text-zinc-400 leading-relaxed font-medium italic">
                      "A ponderação integra DCF (40%), Graham (20%), Bazin (20%), VPA (10%) e P/L (10%). O ajuste de risco de {inputs.notaRisco} aplica uma margem de segurança adicional ao valor intrínseco."
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      <Lock size={12} /> Algoritmo Quant Verificado
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#ffffff', color: '#000000' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-10 py-5 bg-zinc-100 text-black font-black text-[12px] uppercase tracking-[0.3em] rounded-3xl transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-white/5"
                >
                  Gerar Relatório PDF <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </GlassCard>
            </div>

          </section>
        </main>

        <footer className="p-16 border-t border-zinc-800/20 mt-24 flex flex-col md:flex-row justify-between items-center gap-12 bg-zinc-950/30">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-xl">
              <Calculator size={28} className="text-zinc-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.4em]">Analista Quant Terminal</span>
              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-1">Sistema de Equity Research de Alta Fidelidade</span>
            </div>
          </div>
          <div className="flex gap-20">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Processamento</span>
              <span className="text-[12px] text-zinc-600 font-bold">Local Engine • Latência Zero</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Integridade</span>
              <span className="text-[12px] text-emerald-600/80 font-black flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" /> Ativo
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Sessão</span>
              <span className="text-[12px] text-zinc-600 font-bold uppercase tracking-tighter">{new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
