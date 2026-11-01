const ALLOWED_ORIGIN = "https://angelalves-dev.github.io";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ error: "Use uma requisição POST para gerar o site." }, 405, origin);
    }
    if (origin && origin !== ALLOWED_ORIGIN) {
      return json({ error: "Origem não autorizada." }, 403, origin);
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: "A chave de IA ainda não foi configurada como segredo GEMINI_API_KEY no Worker." }, 503, origin);
    }

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 12000) return json({ error: "Descrição muito grande. Resuma e tente novamente." }, 413, origin);
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Não consegui ler os dados enviados. Tente novamente." }, 400, origin);
    }

    const prompt = String(body.prompt || "").trim();
    const business = body.business && typeof body.business === "object" ? body.business : {};
    if (prompt.length < 15) return json({ error: "Descreva o site com pelo menos 15 caracteres." }, 400, origin);
    if (prompt.length > 5000) return json({ error: "A descrição deve ter no máximo 5.000 caracteres." }, 400, origin);

    const instructions = `Você é um desenvolvedor web sênior e designer de sites comerciais. Gere um site completo em português do Brasil, pronto para salvar como um único arquivo HTML. Responda SOMENTE com o código HTML, sem markdown ou explicações. O HTML deve começar com <!doctype html> e incluir CSS dentro de <style>, sem bibliotecas ou dependências externas, responsivo para celular e computador, acessível e visualmente marcante. Não entregue um modelo genérico curto: personalize o design para o segmento e inclua, conforme fizer sentido, navegação responsiva com menu móvel funcional, hero com chamadas para ação, sobre a empresa, serviços/produtos em cards detalhados, benefícios, processo de trabalho, galeria visual, planos/preços editáveis, FAQ com acordeão funcional, CTA final e rodapé completo. Acrescente seções específicas ao negócio em vez de repetir sempre a mesma estrutura. Use CSS detalhado, tipografia forte, paleta coerente, ícones SVG inline quando úteis, microanimações discretas, estados hover/focus, foco visível e respeito a prefers-reduced-motion. Inclua JavaScript puro para interações úteis, como menu móvel, acordeões, filtros de catálogo, galeria/modal ou validação de formulário. Adicione SEO básico e HTML semântico. Formulários devem validar no navegador e só enviar por WhatsApp/mailto se houver dados adequados; nunca finja que existe backend. Não invente depoimentos, avaliações, estatísticas, endereço ou certificações. Não inclua scripts externos, rastreadores, formulários que enviem dados a servidores desconhecidos ou chaves de API. Não prometa login, banco de dados, pagamentos ou backend real; se pedidos, crie apenas uma interface demonstrativa e deixe clara a limitação. Use textos reais e específicos para o segmento, sem lorem ipsum. Não invente endereço, avaliações, certificações ou alegações médicas. Se houver WhatsApp, crie um link wa.me válido usando apenas dígitos. Não inclua scripts externos, rastreadores, formulários que enviem dados a servidores desconhecidos ou chaves de API. O usuário deve poder editar o arquivo depois.\n\nDados fornecidos pelo criador: ${JSON.stringify({
      name: String(business.name || "Meu Negócio").slice(0, 100),
      type: String(business.type || "servicos").slice(0, 80),
      tagline: String(business.tagline || "").slice(0, 200),
      accent: String(business.accent || "#7357e8").slice(0, 30),
      style: String(business.style || "moderno").slice(0, 50),
      offerings: String(business.offerings || "").slice(0, 1200),
      whatsapp: String(business.whatsapp || "").replace(/[^0-9]/g, "").slice(0, 20)
    })}\n\nDescrição e necessidades do cliente: ${prompt}`;

    const model = String(env.GEMINI_MODEL || "gemini-3.1-flash-lite");
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(env.GEMINI_API_KEY);

    let apiResponse;
    try {
      apiResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: instructions }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 8192 }
        })
      });
    } catch {
      return json({ error: "Não foi possível conectar ao serviço de IA. Tente novamente em instantes." }, 502, origin);
    }

    const result = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      const message = result?.error?.message || "";
      const status = apiResponse.status === 429 ? 429 : 502;
      return json({
        error: status === 429
          ? "O limite temporário da IA foi atingido. Aguarde um pouco e tente novamente."
          : "O serviço de IA recusou a solicitação. Confira a configuração da chave e do modelo no Worker.",
        detail: message.slice(0, 250)
      }, status, origin);
    }

    const html = result?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .replace(/^\s*```(?:html)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    if (!html || !/^<!doctype html/i.test(html) || !/<html[\s>]/i.test(html) || html.length < 500) {
      return json({ error: "A IA não retornou um HTML completo. Tente uma descrição mais específica." }, 502, origin);
    }
    return json({ html }, 200, origin);
  }
};
