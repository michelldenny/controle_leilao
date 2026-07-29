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
  // Configuração CORS básica se necessário
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
    const { name, description, category, brand, model, imageBase64 } = req.body || {};
    const ai = getGenAI();

    const parts: any[] = [];
    if (imageBase64) {
      const mimeType = imageBase64.startsWith("data:image/jpeg")
        ? "image/jpeg"
        : imageBase64.startsWith("data:image/png")
          ? "image/png"
          : "image/jpeg";
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const promptText = `Atue como um perito avaliador de bens arrematados em leilões no Brasil.
Análise do item:
- Nome/Título informados: ${name || "Não informado"}
- Descrição: ${description || "Não informada"}
- Categoria atual: ${category || "Não informada"}
- Marca: ${brand || "Não informada"}
- Modelo: ${model || "Não informado"}

Retorne um JSON válido estritamente com os seguintes campos em Português do Brasil:
{
  "suggestedCategory": "Categoria recomendada (ex: Informática, Veículos, Máquinas, Móveis, etc.)",
  "suggestedSubcategory": "Subcategoria adequada",
  "brand": "Marca identificada/confirmada",
  "model": "Modelo identificado/confirmado",
  "conditionAssessment": "Avaliação provável de condição (Novo, Seminovo, Usado, Avariado, Sucata, Não testado)",
  "estimatedMarketMin": 100.00,
  "estimatedMarketAvg": 150.00,
  "estimatedMarketMax": 200.00,
  "marketSearchQuery": "Termos de busca ideais para Mercado Livre / OLX",
  "technicalSpecs": ["Especificação 1", "Especificação 2"],
  "pricingAdvice": "Resumo de viabilidade e dicas para revenda acelerada"
}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    return res.status(200).json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Erro na análise por IA:", error);
    return res.status(500).json({ error: error.message || "Falha ao analisar item com IA" });
  }
}
