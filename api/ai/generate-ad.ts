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
    const { name, brand, model, category, condition, specs, totalCost, estimatedValue, platform } = req.body || {};
    const ai = getGenAI();

    const prompt = `Você é um especialista em copywriting e vendas em marketplaces (Mercado Livre, OLX, Facebook Marketplace, Shopee).
Crie um anúncio de alta conversão para o bem adquirido em leilão:
- Item: ${name}
- Marca/Modelo: ${brand || ""} ${model || ""}
- Categoria: ${category || ""}
- Condição: ${condition || "Usado"}
- Especificações/Detalhes: ${JSON.stringify(specs || [])}
- Custo de Arrematação/Total: R$ ${totalCost || 0}
- Valor Estimado de Mercado: R$ ${estimatedValue || 0}
- Plataforma Alvo: ${platform || "Geral (Mercado Livre e OLX)"}

Retorne um JSON estruturado:
{
  "title": "Título cativante para anúncio (máximo 60 caracteres)",
  "suggestedPrice": 0.00,
  "description": "Texto descritivo formatado em Markdown com tópicos, especificações, estado de conservação, garantia/transparência de leilão e chamada para ação.",
  "bulletPoints": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "keywords": ["tag1", "tag2", "tag3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    return res.status(200).json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Erro ao gerar anúncio com IA:", error);
    return res.status(500).json({ error: error.message || "Falha ao gerar anúncio" });
  }
}
