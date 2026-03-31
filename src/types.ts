export interface ValuationInputs {
  empresa: string;
  lpaAtual: number;
  lpaProjetado: number;
  taxaDesconto: number;
  cagrLiquido: number;
  crescimentoG: number;
  plSetor: number;
  vpa: number;
  roe: number;
  dy: number;
  fcfPercent: number;
  cotacaoAtual: number;
  notaRisco: number;
}

export interface ValuationResults {
  dcfIntrinsic: number;
  dcfPTMargem: number;
  valuationPL: number;
  vpaMethod: number;
  grahamMethod: number;
  bazinMethod: number;
  mediaSimples: number;
  mediaPonderada: number;
  precoJustoFinal: number;
  dyEmReal: number;
  margemSeguranca: number;
  upside: number;
  fluxos: {
    ano: number;
    lpa: number;
    fcf: number;
    pv: number;
  }[];
}

export function calculateValuation(inputs: ValuationInputs): ValuationResults {
  const {
    lpaProjetado, taxaDesconto: rRaw, cagrLiquido: cagrRaw, crescimentoG: gRaw,
    plSetor, vpa, roe: roeRaw, dy: dyRaw, fcfPercent: fcfRaw, cotacaoAtual, notaRisco
  } = inputs;

  const r = rRaw / 100;
  const cagr = cagrRaw / 100;
  let g = gRaw / 100;
  
  // Refinamento: g deve ser menor que r para evitar divisão por zero ou resultados negativos/inflados
  if (g >= r) {
    g = r - 0.005; // Ajusta g para ser ligeiramente menor que r (0.5% de diferença)
    if (g < 0) g = 0;
  }

  const roe = roeRaw / 100;
  const dyPercent = dyRaw / 100;
  const fcfFactor = fcfRaw / 100;

  const fluxos = [];
  let somaPV = 0;
  let lpaAtual = lpaProjetado;

  for (let i = 1; i <= 5; i++) {
    const fcf = lpaAtual * fcfFactor;
    const pv = fcf / Math.pow(1 + r, i);
    fluxos.push({ ano: i, lpa: lpaAtual, fcf, pv });
    somaPV += pv;
    lpaAtual *= (1 + cagr);
  }

  const fcf5 = fluxos[4].fcf;
  const fcf6 = fcf5 * (1 + g);
  const vt = fcf6 / (r - g);
  const pvVT = vt / Math.pow(1 + r, 5);
  
  const dcfIntrinsic = somaPV + pvVT;
  const dcfPTMargem = dcfIntrinsic * 0.75;

  const valuationPL = lpaProjetado * plSetor * 0.8;
  const vpaMethod = vpa * (roe / r);
  const grahamMethod = lpaProjetado * (8.5 + 1.5 * cagrRaw);
  const dyEmReal = lpaProjetado * dyPercent;
  const bazinMethod = dyEmReal / 0.07;

  const mediaSimples = (dcfPTMargem + valuationPL + vpaMethod + grahamMethod + bazinMethod) / 5;
  const mediaPonderada = (dcfPTMargem * 0.4) + (grahamMethod * 0.2) + (bazinMethod * 0.2) + (vpaMethod * 0.1) + (valuationPL * 0.1);
  const precoJustoFinal = mediaPonderada * (0.45 + (notaRisco * 0.05));

  const margemSeguranca = ((precoJustoFinal - cotacaoAtual) / precoJustoFinal) * 100;
  const upside = ((precoJustoFinal - cotacaoAtual) / cotacaoAtual) * 100;

  return {
    dcfIntrinsic, dcfPTMargem, valuationPL, vpaMethod, grahamMethod, bazinMethod,
    mediaSimples, mediaPonderada, precoJustoFinal, dyEmReal, margemSeguranca, upside, fluxos
  };
}
