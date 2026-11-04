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
  const hasMenuButton = /aria-expanded|menu-toggle|nav-toggle|hamburger/i.test(html);
  const hasMobileRules = /@media\s*\([^)]*(?:max-width|max-inline-size)/i.test(html);
  const hasNav = /<nav\b/i.test(html);
  const hasGallery = /id=["'](?:galeria|gallery|portfolio|estrutura)["']|class=["'][^"']*(?:gallery|galeria|portfolio)[^"']*["']/i.test(html);
  const svgCount = (html.match(/<svg\b/gi) || []).length;
  const imageCount = (html.match(/<img\b/gi) || []).length;
  const cardCount = (html.match(/class=["'][^"']*\bcard\b[^"']*["']/gi) || []).length;
  const heroMatch = html.match(/<section\b[^>]*class=["'][^"']*hero[^"']*["'][^>]*>[\s\S]*?<\/section>/i) || html.match(/<header\b[\s\S]*?<\/header>/i);
  const hero = heroMatch ? heroMatch[0] : "";
  const heroVisuals = (hero.match(/<svg\b|<img\b|<picture\b/gi) || []).length;
  const galleryMatch = html.match(/<(?:section|div)\b[^>]*(?:galeria|gallery|portfolio|estrutura)[^>]*>[\s\S]*?<\/(?:section|div)>/i);
  const gallerySvgCount = galleryMatch ? (galleryMatch[0].match(/<svg\b/gi) || []).length : 0;
  const hasVisualStyling = /(?:clip-path|mask-image|background-image|linear-gradient|radial-gradient|filter:\s*drop-shadow|::before|::after)/i.test(html);
  const hasRealContact = /wa\.me\/|mailto:|tel:/i.test(html);
  const deadLinks = (html.match(/href=["'](?:#|javascript:void\(0\)|javascript:;)["']/gi) || []).length;

  if (sections < 8) issues.push("Poucas seções: crie pelo menos 8 seções úteis, específicas e sem repetição.");
  if (sections > 12) issues.push("Há seções demais; reduza para 8 a 12 seções fortes, sem conteúdo de enchimento.");
  if (!/<meta\s+name=["']viewport["']/i.test(html)) issues.push("Falta meta viewport para celular.");
  if (!/<title>\s*[^<]+<\/title>/i.test(html) || !/<meta\s+name=["']description["']/i.test(html)) issues.push("Complete title e meta description para SEO básico.");
  if (!hasMobileRules) issues.push("Falta uma media query real para adaptar o layout a telas pequenas.");
  if (!hasNav || !/<header[\s\S]*?<nav\b/i.test(html)) issues.push("Inclua nav semântico dentro do cabeçalho.");
  if (!/<nav\b[^>]*aria-label|<nav\b[^>]*aria-labelledby/i.test(html)) issues.push("Identifique a navegação principal com aria-label ou aria-labelledby.");
  if (!hasMenuButton) issues.push("Adicione botão de menu móvel acessível e funcional.");
  if (hasMenuButton && !/aria-controls=/i.test(html)) issues.push("Associe o botão do menu à navegação com aria-controls.");
  if (hasMenuButton && !/aria-expanded=["'](?:true|false)["']/i.test(html)) issues.push("O botão do menu precisa expor aria-expanded.");
  if (hasMenuButton && !/keydown/i.test(html)) issues.push("O menu móvel deve fechar ao pressionar Escape.");
  if (hasMenuButton && !/(?:querySelectorAll|querySelector)\(["'][^"']*a[^"']*["']\)[\s\S]{0,900}addEventListener\(["']click|addEventListener\(["']click[\s\S]{0,900}(?:querySelectorAll|querySelector)\(["'][^"']*a/i.test(html)) issues.push("Feche o painel mobile depois que qualquer link do menu for selecionado.");
  if (hasMenuButton && hasMobileRules && !/(?:nav|\.nav|\.menu|\.menu-links|\.nav-links)[^{]*\{[^}]*flex-direction\s*:\s*column/i.test(html)) issues.push("No celular, empilhe os links do menu verticalmente com flex-direction: column.");
  if (hasMenuButton && !/:focus-visible/i.test(html)) issues.push("Adicione estados :focus-visible claros para links e botões.");
  if (hasMenuButton && !/position\s*:\s*(?:fixed|absolute)/i.test(html)) issues.push("O painel mobile deve usar posicionamento e z-index que o mantenham legível acima do conteúdo.");
  if (/perguntas frequentes|\bfaq\b|d[uú]vidas frequentes/i.test(html) && !/aria-expanded|<details\b|addEventListener\s*\(\s*["']click|onclick=/i.test(html)) issues.push("FAQ sem interação aparente para abrir e fechar respostas.");
  if (/<form\b/i.test(html) && !/addEventListener\s*\(\s*["']submit|onsubmit=|mailto:|wa\.me\//i.test(html)) issues.push("Formulário sem tratamento de envio aparente; não finja que enviou dados.");
  if (/<form\b/i.test(html) && /onsubmit\s*=\s*["'][^"']*return\s+false|type\s*=\s*["']button["'][^>]*onclick\s*=\s*["'][^"']*alert/i.test(html)) issues.push("Formulário bloqueia o envio ou usa alerta falso; remova-o ou configure um destino real.");
  if (/<form\b/i.test(html) && !/<label\b/i.test(html)) issues.push("Formulário sem labels acessíveis.");
  if (broken.length) issues.push("Links internos sem destino: " + broken.slice(0, 6).map(id => "#" + id).join(", "));
  if (/<img\b/i.test(html) && /<img\b(?![^>]*\balt=)/i.test(html)) issues.push("Adicione alt útil às imagens.");
  if (/via\.placeholder\.com|placehold\.co|placekitten\.com/i.test(html)) issues.push("Remova imagens placeholder; use imagens fornecidas ou ilustrações SVG/CSS originais.");
  if (/©\s*202[0-5]\b/i.test(html)) issues.push("Atualize o ano do rodapé dinamicamente ou use o ano atual.");
  if (hasGallery && svgCount + imageCount < 3) issues.push("A galeria não tem conteúdo visual suficiente: crie pelo menos três ilustrações SVG/CSS originais distintas, não caixas com rótulos.");
  if (hasGallery && /(?:área pesos|area pesos|cardio|funcional)[\s\S]{0,100}(?:background:\s*(?:#(?:111|121212|1a1a1a|222)|var\(--surface\)))/i.test(html) && svgCount < 3) issues.push("A galeria parece formada por caixas escuras com texto; substitua por painéis ilustrados e diferentes.");
  if (!hasGallery && /academia|restaurante|salão|salao|hotel|imobili[aá]ria|arquitetura|eventos/i.test(html)) issues.push("Inclua uma galeria visual adequada ao segmento, com ilustrações próprias se não houver fotos.");
  if (cardCount >= 7 && svgCount < 2) issues.push("O layout está repetitivo em cartões; varie a composição com mosaico, faixa editorial, timeline ou tipografia.");
  if (hero && heroVisuals === 0) issues.push("O hero não tem elemento visual próprio; crie composição editorial com ilustração SVG/CSS original relacionada ao segmento.");
  if (hero && heroVisuals === 1 && !hasVisualStyling) issues.push("O hero tem apenas um visual simples e sem tratamento; adicione camadas, recortes, profundidade e composição editorial.");
  if (hasGallery && gallerySvgCount < 3 && imageCount < 3) issues.push("A galeria precisa de pelo menos quatro painéis visuais distintos em SVG/CSS, não apenas cartões ou formas geométricas básicas.");
  if (cardCount >= 5 && !/(?:masonry|grid-template-areas|:nth-child\()/i.test(html)) issues.push("A composição repete cartões sem hierarquia; crie mosaico assimétrico ou destaque visual com tamanhos variados.");
  if (!hasVisualStyling) issues.push("Falta direção de arte visual: use recursos gráficos CSS/SVG, texturas, recortes, camadas e detalhes consistentes.");
  if (deadLinks >= 2) issues.push("Há links sem destino ou links javascript:void; conecte cada ação a uma seção real ou remova a ação.");
  if (/agende uma visita|fale conosco|entre em contato|solicite um or[cç]amento/i.test(html) && !hasRealContact && !/Canal de contato a configurar/i.test(html)) issues.push("A chamada comercial não tem destino de contato funcional; conecte WhatsApp/e-mail informado ou deixe aviso discreto de configuração.");
  if (!/<h1\b/i.test(html)) issues.push("Falta um título principal h1 claro no hero.");
  if (/width\s*:\s*300px[\s\S]{0,160}height\s*:\s*300px[\s\S]{0,160}border\s*:\s*20px/i.test(html)) issues.push("O hero parece usar apenas um quadrado decorativo simples; crie uma composição editorial relacionada ao segmento.");
  if (/prefers-reduced-motion/i.test(html) === false && /scroll-behavior\s*:\s*smooth/i.test(html)) issues.push("Respeite prefers-reduced-motion para usuários que reduzem animações.");
  if (/equipamentos de última geração|equipamentos de ponta|estrutura de ponta|tecnologia de ponta|instrutores acompanham|profissionais certificados|manutenção constante|atendimento personalizado|resultados garantidos|líder no mercado|referência na região|equipe especializada|ambiente climatizado|espaço amplo/i.test(html)) issues.push("Revise afirmações comerciais específicas não comprovadas pelos dados fornecidos.");
  if (/\[[^\]]{2,80}\]|\b(?:inserir|adicionar|informar)\s+(?:aqui|horário|endereço|telefone|preço|valor)\b|(?:endereço|telefone|horário)\s+a\s+definir/i.test(html)) issues.push("Remova placeholders e instruções provisórias visíveis.");
  if (/<button\b/i.test(html) && !/:focus-visible|:focus\b/i.test(html)) issues.push("Adicione estados de foco visíveis para navegação por teclado.");
  if (/R\$\s*(?:XXX|X{2,}|0{2,}|\[.*?preço.*?\])/i.test(html)) issues.push("Remova preços provisórios; use somente valores informados.");
  if (/alert\s*\(.*(?:pronto para integração|configure o endpoint|não configurado)/i.test(html)) issues.push("Remova alertas que simulam integração; deixe claro quando algo é demonstrativo.");
  return { sections, issues: issues.slice(0, 16) };
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

DIREÇÃO DE ARTE E QUALIDADE VISUAL OBRIGATÓRIA: aja como um estúdio digital profissional. Escolha um conceito visual específico do segmento e mantenha consistência em cores, tipografia, formas, ícones e fotografia/ilustração. Não entregue template genérico. Crie ritmo de página com alternância de fundos, largura controlada, respiro generoso, hierarquia tipográfica expressiva, títulos fortes, textos escaneáveis e CTAs claros. HERO: layout assimétrico, título grande com quebra intencional, etiqueta curta, CTA principal e ilustração SVG/CSS original com vários detalhes e camadas que conte algo sobre o negócio. Nunca use apenas um círculo, quadrado ou cruz como ilustração. Crie pelo menos DOIS momentos visuais memoráveis além do hero: mosaico assimétrico com quatro ilustrações SVG/CSS diferentes para negócios visuais; faixa editorial de destaque; timeline desenhada; manifesto tipográfico ou composição especial de serviços. Não use a mesma grade de cartões em todas as seções. Em cada painel SVG, desenhe objetos reconhecíveis e específicos do segmento com linhas, formas e detalhes próprios; formas geométricas soltas não contam como galeria. Use ícones SVG coerentes, estados hover/focus e microinterações discretas. Evite excesso de gradientes, emojis como ícones principais, sombras pesadas e bordas em todos os elementos. O resultado deve ter acabamento autoral e excelente adaptação a desktop e celular. Se não houver imagens reais fornecidas, crie visuais editoriais com CSS/SVG e cores/texturas adequadas ao segmento; NÃO use via.placeholder.com, placehold.co, placekitten.com, URLs inventadas, imagens quebradas ou URLs externas aleatórias. Se usar imagem remota, ela deve ser uma URL pública real e estável que você conheça; caso contrário, não use imagem remota. O resultado deve ser visualmente rico e excelente em desktop e celular. Em telas pequenas, o menu deve abrir como painel vertical legível, com links empilhados, espaçamento de toque adequado, fundo sólido e z-index correto; nunca deixe links em linha espremida ou sobrepostos. O botão deve atualizar aria-expanded e aria-controls, fechar ao selecionar link e ao pressionar Escape. Inclua :focus-visible em links, botões e campos. PROIBIDO deixar retângulos pretos/cinzas vazios ou caixas que pareçam imagens ausentes: crie uma ilustração SVG/CSS completa dentro delas, ou remova o bloco e reorganize o layout. Nunca deixe navegação escondida no celular sem botão hambúrguer acessível e funcional. Não publique preços como R$ XXX,XX nem frases como 'unidade a definir'; se os dados faltarem, omita-os ou use um aviso de edição discreto que não pareça conteúdo final.

ESTRUTURA: produza obrigatoriamente entre 8 e 12 seções relevantes, adaptadas ao segmento, sem enchimento. Para negócios visuais (academia, restaurante, salão, hotel, arquitetura, imóveis, eventos), inclua uma galeria/portfólio visual realista; sem fotos fornecidas, crie ilustrações SVG/CSS originais e não invente fotos nem URLs. Para serviços que não dependem de imagens, use uma seção editorial visual alternativa. cabeçalho com logotipo textual e navegação responsiva; hero com proposta de valor, descrição e CTA; apresentação/sobre; serviços ou catálogo detalhado; benefícios/diferenciais; processo ou etapas; galeria/portfólio quando relevante; planos/preços apenas quando solicitados ou fizerem sentido; FAQ funcional; contato com CTA final; rodapé completo. Acrescente conteúdo próprio do segmento (por exemplo, cardápio para restaurante, equipe/modalidades para academia, imóveis para imobiliária, projetos para construção, cursos para educação). Não mostre seção vazia nem repita o mesmo texto para preencher espaço.

FUNCIONALIDADE E ACESSIBILIDADE: menu móvel realmente funcional, botão com aria-label e aria-expanded atualizado em cada abertura/fechamento; feche o menu ao clicar num link e ao pressionar Escape. Navegação por âncoras com scroll suave, mas respeite prefers-reduced-motion. FAQ com botões que atualizem aria-expanded e aria-controls, ou use details/summary nativo. Galeria/modal, se houver, deve ter botão de fechar acessível, aria-label apropriado, fechar com Escape e imagem com alt útil. Só crie formulário se houver destino real de envio fornecido ou integração disponível. Caso contrário, NÃO crie formulário: crie uma seção de contato demonstrativa com aviso discreto “Canal de contato a configurar antes da publicação” e sem campos nem botão de envio. Nunca use onsubmit="return false", botão que finge enviar, alertas de integração ou mensagens falsas de sucesso. Botões e links devem funcionar. Use foco visível, contraste adequado e HTML semântico. Inclua title, meta description, headings em ordem e textos alternativos úteis quando houver imagens.

INTEGRIDADE: não invente endereço, telefone, horários, preços, depoimentos, avaliações, certificações, números de clientes, instalações, equipamentos, tecnologias, tamanho de equipe, experiência, credenciais, resultados ou alegações médicas. Não transforme benefícios desejáveis em fatos existentes. Só apresente como fato o que estiver explicitamente nos dados fornecidos. Se a descrição do cliente disser “quero” ou “gostaria”, trate como desejo de projeto, não como característica já existente. Evite frases factuais como “temos equipamentos de última geração”, “nossa equipe é certificada” ou “garantimos resultados” sem comprovação. Use somente os dados fornecidos. Quando faltar endereço, telefone, horário, preço ou outra informação, omita o dado ou use frase neutra como “Consulte a equipe para mais informações”. Escreva textos atraentes sem inventar fatos: prefira convites, explicações gerais do serviço e benefícios apresentados como possibilidades, não promessas garantidas. NUNCA exiba colchetes, “a definir”, “inserir aqui”, instruções de edição ou placeholders no site final. Marque conteúdo demonstrativo como exemplo. Use o WhatsApp informado somente se válido, convertido para dígitos no link wa.me. Nunca inclua chaves de API, rastreadores, coleta oculta de dados ou scripts de terceiros. Não afirme que login, pagamentos, agendamento, banco de dados ou envio a servidores funcionam sem backend real; quando solicitados, crie apenas uma demonstração visual claramente identificada e indique o que precisa ser conectado.

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
      const repairPrompt = [
        "Você é diretor de arte digital e engenheiro front-end sênior. RECONSTRUA o site para elevar muito a qualidade visual. Retorne SOMENTE um HTML completo válido começando com <!doctype html>.",
        "",
        "DIREÇÃO DE ARTE: reconstrua como estúdio digital profissional. Escolha conceito visual próprio do segmento e aplique sistema consistente de cores, tipografia, espaçamento, formas, ícones e fundos alternados. Dê ritmo à página; não repita cartões.",
        "HERO: composição editorial assimétrica, título grande com quebra intencional, etiqueta curta, CTA destacado e ilustração SVG inline original com vários elementos reconhecíveis e detalhes do segmento. Use camadas, recortes, escala e profundidade. Proibido quadrado solitário, círculo genérico, cruz simples ou bloco vazio.",
        "GALERIA: para segmentos visuais, crie 4 painéis ilustrados distintos em SVG/CSS original. Desenhe objetos reconhecíveis do segmento com linhas, detalhes e composição própria. Quatro círculos/quadrados soltos não contam. Nunca use caixas vazias com rótulos. Não invente fotos nem URLs.",
        "VARIEDADE: entre 8 e 12 seções úteis e pelo menos dois momentos visuais memoráveis além do hero: mosaico assimétrico, faixa editorial, timeline ou manifesto tipográfico. Evite repetir cartões iguais.",
        "ACABAMENTO: tipografia hierárquica, espaçamento generoso, grid consistente, contraste, ícones SVG coerentes, microinterações discretas e visual profissional em desktop e celular.",
        "MOBILE: menu em painel vertical, fundo sólido, position fixed/absolute, z-index alto, links empilhados com flex-direction: column e boa área de toque. Botão com aria-label, aria-controls e aria-expanded atualizado. Fechar ao clicar em qualquer link e ao pressionar Escape. Nav com aria-label, :focus-visible e prefers-reduced-motion.",
        "FAQ acessível com details/summary ou botões que atualizem aria-expanded. Formulário só se houver destino real; caso contrário, remova-o e deixe aviso discreto sem campos nem botão falso.",
        "INTEGRIDADE: remova afirmações não comprovadas sobre instalações, equipamentos, equipe, certificações, tecnologia, atendimento, reputação ou resultados. Não invente endereço, telefone, horário, preço, avaliações, depoimentos, clientes ou credenciais. Não use placeholders, colchetes, imagens quebradas, URLs aleatórias, alertas falsos ou mensagens de sucesso falsas.",
        "Mantenha links internos válidos, IDs únicos, HTML semântico, title, meta description e responsividade.",
        "Problemas detectados que precisam ser corrigidos:\n- " + quality.issues.join("\n- "),
        "Pedido original do cliente: " + prompt,
        "HTML atual para reconstrução:\n" + html
      ].join("\n");
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
            const score = q => q.issues.length * 12 + Math.max(0, 8 - q.sections) * 5 + Math.max(0, q.sections - 12) * 5;
            const originalScore = score(quality);
            const candidateScore = score(candidateQuality);
            const candidateIsValid = candidateQuality.sections >= 8 && candidateQuality.sections <= 12 && candidateQuality.issues.length <= quality.issues.length && candidateScore < originalScore;
            if (candidateIsValid) {
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
