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

QUALIDADE VISUAL OBRIGATÓRIA: defina uma direção de arte específica para o segmento e faça o resultado parecer um site de estúdio profissional, não um template genérico. Crie pelo menos dois momentos visuais memoráveis além do hero: por exemplo, faixa editorial de destaque, galeria em mosaico com imagens reais fornecidas ou ilustrações SVG/CSS originais, seção de processo em linha do tempo, composição assimétrica ou manifesto tipográfico. Evite repetir a mesma grade de cartões. Use composição visual forte, hierarquia tipográfica editorial, paleta própria para o segmento, espaços generosos, grid consistente, variação entre seções, cartões detalhados, bordas e sombras sutis, estados hover/focus e microinterações elegantes. O hero deve ter composição memorável (layout dividido, tipografia marcante, forma/ilustração CSS ou SVG inline), com CTA visível; não deixe uma grande área vazia nem use apenas texto sobre fundo liso. Evite excesso de gradientes, emojis como ícones principais e cartões repetidos em todas as seções. Use SVG inline para ícones e ilustrações simples. Se não houver imagens reais fornecidas, crie visuais editoriais com CSS/SVG e cores/texturas adequadas ao segmento; NÃO use via.placeholder.com, placehold.co, placekitten.com, URLs inventadas, imagens quebradas ou URLs externas aleatórias. Se usar imagem remota, ela deve ser uma URL pública real e estável que você conheça; caso contrário, não use imagem remota. O resultado deve ser visualmente rico e excelente em desktop e celular. Em telas pequenas, o menu deve abrir como painel vertical legível, com links empilhados, espaçamento de toque adequado, fundo sólido e z-index correto; nunca deixe links em linha espremida ou sobrepostos. O botão deve atualizar aria-expanded e aria-controls, fechar ao selecionar link e ao pressionar Escape. Inclua :focus-visible em links, botões e campos. PROIBIDO deixar retângulos pretos/cinzas vazios ou caixas que pareçam imagens ausentes: crie uma ilustração SVG/CSS completa dentro delas, ou remova o bloco e reorganize o layout. Nunca deixe navegação escondida no celular sem botão hambúrguer acessível e funcional. Não publique preços como R$ XXX,XX nem frases como 'unidade a definir'; se os dados faltarem, omita-os ou use um aviso de edição discreto que não pareça conteúdo final.

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
      const repairPrompt = \`Você é um diretor de arte digital premiado e engenheiro front-end sênior. Sua tarefa é RECONSTRUIR E MELHORAR VISIVELMENTE o site, não apenas trocar palavras. Retorne SOMENTE um HTML completo válido começando com <!doctype html>.

PRIORIDADE MÁXIMA — DESIGN:
1) HERO de alto impacto: layout editorial assimétrico, título grande com quebras intencionais, subtítulo curto, CTA destacado e uma ilustração SVG inline original relacionada ao negócio. Use camadas, recortes, linhas, formas e profundidade. Proibido um quadrado solitário, círculo genérico ou bloco vazio.
2) GALERIA: se o segmento for visual, crie 4 painéis ilustrados distintos com SVG/CSS original (cada um com composição própria, detalhes e legenda). Nunca use caixas vazias com palavras como ÁREA PESOS, CARDIO ou FUNCIONAL. Não invente fotos nem URLs. Se o negócio não for visual, crie uma seção editorial/portfólio apropriada.
3) VARIEDADE: 8 a 12 seções úteis. Pelo menos dois momentos visuais memoráveis além do hero: mosaico assimétrico, faixa editorial, timeline, manifesto tipográfico ou composição de processo. Não repita cartões iguais em todas as seções.
4) ACABAMENTO: tipografia hierárquica, espaçamento generoso, grid consistente, cores com contraste, bordas e sombras sutis, ícones SVG coerentes, microinterações discretas e aparência profissional em desktop e celular.

PRIORIDADE MÁXIMA — MOBILE E ACESSIBILIDADE:
- Menu móvel abre em painel vertical com fundo sólido, position fixed/absolute, z-index alto e links empilhados (flex-direction: column), com área de toque confortável.
- Botão com aria-label, aria-controls e aria-expanded atualizado em cada abertura/fechamento.
- Fechar ao clicar em qualquer link e ao pressionar Escape; restaurar aria-expanded=false.
- Navegação principal com aria-label; foco :focus-visible visível; respeitar prefers-reduced-motion.
- FAQ funcional com details/summary ou botões acessíveis.

INTEGRIDADE:
- Remova qualquer afirmação não comprovada sobre equipamentos, instalações, equipe, certificações, tecnologia, atendimento, reputação ou resultados. Não transforme desejos do cliente em fatos.
- Não invente endereço, telefone, horário, preço, avaliações, depoimentos, clientes ou credenciais.
- Sem destino real de envio, remova formulários e use apenas aviso discreto de canal a configurar, sem campos nem botão falso.
- Não use placeholders, colchetes, imagens quebradas, URLs aleatórias, alertas falsos ou mensagens de sucesso falsas.
- Mantenha links internos válidos, IDs únicos, HTML semântico, title, meta description e responsividade.

Corrija obrigatoriamente os problemas detectados:
- \${quality.issues.map(x => "- " + x).join("\\n")}
Pedido original do cliente: \${prompt}

HTML atual para reconstrução:
\${html}\`;
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
            const originalScore = quality.issues.length * 12 + Math.max(0, 8 - quality.sections) * 5;
            const candidateScore = candidateQuality.issues.length * 12 + Math.max(0, 8 - candidateQuality.sections) * 5;
            const candidateIsValid = candidateQuality.sections >= 8 && candidateQuality.sections <= 12 && candidateQuality.issues.length < quality.issues.length;
            if (candidateIsValid && candidateScore < originalScore) {
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
