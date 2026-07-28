import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no ambiente.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { totalCost, estimatedAvg, daysInStock, category, condition } = req.body || {};
    const ai = getGenAI();

    const prompt = `Analise a estratégia de preço e liquidez para este bem em estoque há ${daysInStock || 0} dias:
- Custo total acumulado: R$ ${totalCost}
- Avaliação média de mercado: R$ ${estimatedAvg}
- Categoria: ${category}
- Condição: ${condition}

Sugira 3 faixas de preço (Venda Rápida / Giro Alto, Preço Justo de Mercado, Preço Máximo com Margem Alta) e forneça recomendações para acelerar a venda mantendo boa rentabilidade.
Retorne um JSON:
{
  "fastSalePrice": 0,
  "fairMarketPrice": 0,
  "maxMarginPrice": 0,
  "recommendedAction": "Recomendação direta em 2 a 3 frases",
  "estimatedDaysToSell": "15 a 30 dias",
  "marginAnalysis": "Análise sobre margem e risco de obsolescência"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return res.status(200).json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Erro na estratégia de preço por IA:", error);
    return res.status(500).json({ error: error.message || "Falha na recomendação estratégica" });
  }
}
