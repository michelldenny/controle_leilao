import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Rate limiter para proteger as rotas de IA contra abuso de consumo
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 requisições por IP
  message: { error: "Muitas requisições enviadas à IA. Por favor, aguarde alguns minutos antes de tentar novamente." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/ai/", aiLimiter);

// Initialize Google GenAI client lazily or when key is present
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

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Controle de Leilões e Patrimônio", timestamp: new Date().toISOString() });
});

// AI Item Analysis & Valuation Endpoint
app.post("/api/ai/analyze-item", async (req, res) => {
  try {
    const { name, description, category, brand, model, imageBase64 } = req.body;
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
    res.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Erro na análise por IA:", error);
    res.status(500).json({ error: error.message || "Falha ao analisar item com IA" });
  }
});

// AI Marketplace Advertisement Generator
app.post("/api/ai/generate-ad", async (req, res) => {
  try {
    const { name, brand, model, category, condition, specs, totalCost, estimatedValue, platform } = req.body;
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
    res.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Erro ao gerar anúncio com IA:", error);
    res.status(500).json({ error: error.message || "Falha ao gerar anúncio" });
  }
});

// AI Pricing & Strategy Advisory Endpoint
app.post("/api/ai/pricing-strategy", async (req, res) => {
  try {
    const { totalCost, estimatedAvg, daysInStock, category, condition } = req.body;
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
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Erro na estratégia de preço por IA:", error);
    res.status(500).json({ error: error.message || "Falha na recomendação estratégica" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
