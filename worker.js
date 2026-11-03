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

function inspectHtml(html) {
  const issues = [];
  const sections = (html.match(/<section\b/gi) || []).length;
  const ids = new Set(Array.from(html.matchAll(/\bid=["']([^"']+)["']/gi), m => m[1]));
  const anchors = Array.from(html.matchAll(/href=["']#([^"']+)["']/gi), m => m[1]);
  const broken = [...new Set(anchors.filter(id => id && !ids.has(id)))];
  if (sections < 7) issues.push('Poucas seções: crie pelo menos 7 seções úteis, específicas e sem repetição.');
  if (!/<meta\s+name=["']viewport["']/i.test(html)) issues.push('Falta meta viewport para celular.');
  if (!/<title>\s*[^<]+<\/title>/i.test(html) || !/<meta\s+name=["']description["']/i.test(html)) issues.push('Complete title e meta description para SEO básico.');
  if (!/@media\s*\(/i.test(html)) issues.push('Falta CSS responsivo com media query.');
  if (!/<nav\b/i.test(html)) issues.push('Falta navegação semântica nav.');
  if (!/aria-expanded|aria-label=["'][^"']*(menu|navega)|menu-toggle|nav-toggle|hamburger/i.test(html)) issues.push('Adicione um controle acessível e funcional para o menu móvel.');
  if (/perguntas frequentes|\bfaq\b|d[uú]vidas frequentes/i.test(html) && !/aria-expanded|<details\b|addEventListener\s*\(\s*["']click|onclick=/i.test(html)) issues.push('FAQ sem interação aparente para abrir e fechar respostas.');
  if (/<form\b/i.test(html) && !/addEventListener\s*\(\s*["']submit|onsubmit=|mailto:|wa\.me\//i.test(html)) issues.push('Formulário sem tratamento de envio aparente; não finja que enviou dados.');
  if (broken.length) issues.push('Links internos sem destino: ' + broken.slice(0, 6).map(id => '#' + id).join(', '));
  if (/<img\b/i.test(html) && /<img\b(?![^>]*\balt=)/i.test(html)) issues.push('Adicione alt às imagens.');
  if (/via\\.placeholder\\.com|placehold\\.co|placekitten\\.com/i.test(html)) issues.push('Remova imagens de placeholder que podem falhar; use composição visual em CSS ou imagens reais fornecidas e estáveis.');
  if (/©\\s*202[0-5]\\b/i.test(html)) issues.push('Atualize o ano antigo do rodapé dinamicamente com JavaScript ou use o ano atual.');
  if (/perguntas frequentes|\\bfaq\\b|d[uú]vidas frequentes/i.test(html) && !/aria-expanded/i.test(html) && !/<details\\b/i.test(html)) issues.push('Torne as perguntas frequentes acessíveis com details/summary ou aria-expanded nos botões.');
  if (/<form\\b/i.test(html) && /placeholder=/i.test(html) && !/<label\\b/i.test(html)) issues.push('Adicione labels acessíveis aos campos do formulário; placeholder não substitui label.');
  if (/<form\\b/i.test(html) && /enviado com sucesso|mensagem enviada|formulário enviado/i.test(html) && !/wa\\.me\\/|mailto:/i.test(html)) issues.push('O formulário aparenta confirmar envio sem um destino real; substitua por aviso claro de demonstração/configuração necessária.');
  return { sections, issues: issues.slice(0, 8) };
}

function extractHtml(result) {
  return (result?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').replace(/^\s*```(?:html)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
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

    const instructions = `Você é uma equipe sênior de design UX/UI, desenvolvimento front-end, conversão e SEO. Crie um site comercial realmente profissional, rico e personalizado para o negócio descrito, em português do Brasil. Entregue SOMENTE um documento HTML completo começando com <!doctype html>, com CSS dentro de <style> e JavaScript puro dentro de <script>. Tudo deve funcionar em um único arquivo, sem frameworks, bibliotecas externas, fontes externas ou scripts de terceiros. Não faça uma página genérica curta.

QUALIDADE VISUAL OBRIGATÓRIA: defina uma direção de arte específica para o segmento e faça o resultado parecer um site de estúdio profissional, não um template genérico. Use composição visual forte, hierarquia tipográfica editorial, paleta própria para o segmento, espaços generosos, grid consistente, variação entre seções, cartões detalhados, bordas e sombras sutis, estados hover/focus e microinterações elegantes. O hero deve ter composição memorável (layout dividido, tipografia marcante, forma/ilustração CSS ou SVG inline), com CTA visível; não deixe uma grande área vazia nem use apenas texto sobre fundo liso. Evite excesso de gradientes, emojis como ícones principais e cartões repetidos em todas as seções. Use SVG inline para ícones e ilustrações simples. Se não houver imagens reais fornecidas, crie visuais editoriais com CSS/SVG e cores/texturas adequadas ao segmento; NÃO use via.placeholder.com, placehold.co, placekitten.com, URLs inventadas, imagens quebradas ou URLs externas aleatórias. Se usar imagem remota, ela deve ser uma URL pública real e estável que você conheça; caso contrário, não use imagem remota. O resultado deve ser visualmente rico e excelente em desktop e celular.

ESTRUTURA: produza normalmente entre 8 e 12 seções relevantes, adaptadas ao segmento, sem enchimento: cabeçalho com logotipo textual e navegação responsiva; hero com proposta de valor, descrição e CTA; apresentação/sobre; serviços ou catálogo detalhado; benefícios/diferenciais; processo ou etapas; galeria/portfólio quando relevante; planos/preços apenas quando solicitados ou fizerem sentido; FAQ funcional; contato com CTA final; rodapé completo. Acrescente conteúdo próprio do segmento (por exemplo, cardápio para restaurante, equipe/modalidades para academia, imóveis para imobiliária, projetos para construção, cursos para educação). Não mostre seção vazia nem repita o mesmo texto para preencher espaço.

FUNCIONALIDADE E ACESSIBILIDADE: menu móvel realmente funcional, botão com aria-label e aria-expanded atualizado em cada abertura/fechamento; feche o menu ao clicar num link e ao pressionar Escape. Navegação por âncoras com scroll suave, mas respeite prefers-reduced-motion. FAQ com botões que atualizem aria-expanded e aria-controls, ou use details/summary nativo. Galeria/modal, se houver, deve ter botão de fechar acessível, aria-label apropriado, fechar com Escape e imagem com alt útil. Formulários devem ter label associado a cada campo, validação e mensagens claras. Nunca mostre alerta de “enviado com sucesso” nem diga que recebeu dados se não existe integração real; sem telefone/e-mail real fornecido, explique que é necessário configurar o destino, sem simular envio. Botões e links devem funcionar. Use foco visível, contraste adequado e HTML semântico. Inclua title, meta description, headings em ordem e textos alternativos úteis quando houver imagens.

INTEGRIDADE: não invente endereço, telefone, horários, preços, depoimentos, avaliações, certificações, números de clientes ou alegações médicas. Use os dados fornecidos; quando faltarem, use rótulos editáveis como [Adicionar endereço] e [Informar horário] ou omita o dado. Marque conteúdo demonstrativo como exemplo. Use o WhatsApp informado somente se válido, convertido para dígitos no link wa.me. Nunca inclua chaves de API, rastreadores, coleta oculta de dados ou scripts de terceiros. Não afirme que login, pagamentos, agendamento, banco de dados ou envio a servidores funcionam sem backend real; quando solicitados, crie apenas uma demonstração visual claramente identificada e indique o que precisa ser conectado.

ANTES DE RESPONDER, revise mentalmente o HTML: tags fechadas, CSS válido, JavaScript sem erros óbvios, IDs únicos, links para seções existentes, mobile responsivo, menu e FAQ acessíveis, labels em formulários, nenhum placeholder de imagem quebrado, nenhum falso sucesso de formulário e nenhum dado comercial inventado. Não use ano fixo antigo no rodapé; calcule o ano atual com JavaScript. Retorne somente o código HTML, sem markdown, comentários introdutórios ou explicações fora do documento. O arquivo deve ser fácil de editar pelo usuário.

Dados fornecidos pelo criador: ${JSON.stringify({
      name: String(business.name || "Meu Negócio").slice(0, 100),
      type: String(business.type || "servicos").slice(0, 80),
      tagline: String(business.tagline || "").slice(0, 200),
      accent: String(business.accent || "#7357e8").slice(0, 30),
      style: String(business.style || "moderno").slice(0, 50),
      offerings: String(business.offerings || "").slice(0, 1200),
      whatsapp: String(business.whatsapp || "").replace(/[^0-9]/g, "").slice(0, 20)
    })}

Descrição e necessidades do cliente: ${prompt}`;

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
          generationConfig: { temperature: 0.75, maxOutputTokens: 12000 }
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

    let html = extractHtml(result);
    if (!html || !/^<!doctype html/i.test(html) || !/<html[\s>]/i.test(html) || html.length < 500) {
      return json({ error: "A IA não retornou um HTML completo. Tente uma descrição mais específica." }, 502, origin);
    }

    let quality = inspectHtml(html);
    let repairAttempted = false;
    let repairApplied = false;
    if (quality.issues.length) {
      repairAttempted = true;
      const repairPrompt = "Corrija o HTML abaixo e devolva SOMENTE o documento completo começando por <!doctype html>, sem markdown. Preserve o design e o conteúdo válido, corrigindo estes problemas: \n- " +
        quality.issues.join("\n- ") +
        "\nNão invente endereço, preços, avaliações ou depoimentos. Garanta responsividade, acessibilidade, links internos válidos e não finja que backend existe. Pedido original: \n" + prompt + "\nHTML a corrigir:\n" + html;
      try {
        const repairResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: repairPrompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 12000 } })
        });
        const repairResult = await repairResponse.json().catch(() => ({}));
        if (repairResponse.ok) {
          const candidate = extractHtml(repairResult);
          if (candidate && /^<!doctype html/i.test(candidate) && /<html[\s>]/i.test(candidate) && candidate.length >= 500) {
            const candidateQuality = inspectHtml(candidate);
            if (candidateQuality.issues.length <= quality.issues.length) {
              html = candidate;
              quality = candidateQuality;
              repairApplied = true;
            }
          }
        }
      } catch {
        // Se a correção falhar, mantém o primeiro HTML válido.
      }
    }
    return json({
      html,
      quality: { checked: true, autoRepairAttempted: repairAttempted, autoRepairApplied: repairApplied, sectionCount: quality.sections, warnings: quality.issues, note: "A verificação é estática; confira a prévia e teste os controles no navegador." }
    }, 200, origin);
  }
};
