import { GoogleGenAI, Type } from "@google/genai";
import { ValuationInputs } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchStockData(ticker: string): Promise<Partial<ValuationInputs>> {
  const prompt = `Busque as informações financeiras mais recentes para a empresa com o ticker ${ticker} na B3 (Bolsa Brasileira). 
  Retorne os seguintes campos em formato JSON:
  - lpaProjetado (Lucro por Ação dos últimos 12 meses ou projetado)
  - vpa (Valor Patrimonial por Ação)
  - roe (Retorno sobre Patrimônio Líquido em %)
  - dy (Dividend Yield em %)
  - cotacaoAtual (Preço atual da ação)
  - plSetor (P/L médio do setor da empresa)
  - empresa (Nome ou Ticker confirmado)
  
  Certifique-se de que os valores numéricos sejam apenas números (sem símbolos de % ou R$).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lpaProjetado: { type: Type.NUMBER },
            vpa: { type: Type.NUMBER },
            roe: { type: Type.NUMBER },
            dy: { type: Type.NUMBER },
            cotacaoAtual: { type: Type.NUMBER },
            plSetor: { type: Type.NUMBER },
            empresa: { type: Type.STRING },
          },
          required: ["lpaProjetado", "vpa", "roe", "dy", "cotacaoAtual", "plSetor", "empresa"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Nenhum dado retornado pelo modelo.");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao buscar dados da ação:", error);
    throw error;
  }
}
