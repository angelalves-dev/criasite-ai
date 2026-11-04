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
  const idValues = Array.from(html.matchAll(/\bid=["']([^"']+)["']/gi), m => m[1]);
  const duplicateIds = [...new Set(idValues.filter((id, index) => idValues.indexOf(id) !== index))];
  const anchors = Array.from(html.matchAll(/href=["']#([^"']+)["']/gi), m => m[1]);
  const broken = [...new Set(anchors.filter(id => id && !ids.has(id)))];
  const hasMenuButton = /aria-expanded|menu-toggle|nav-toggle|hamburger/i.test(html);
  const hasMobileRules = /@media\s*\([^)]*(?:max-width|max-inline-size)/i.test(html);
  const hasNav = /<nav\b/i.test(html);
  const hasGallery = /id=["'](?:galeria|gallery|portfolio|estrutura)["']|class=["'][^"']*(?:gallery|galeria|portfolio)[^"']*["']/i.test(html);
  const svgCount = (html.match(/<svg\b/gi) || []).length;
  const semanticSvgCount = (html.match(/<svg\b(?=[^>]*(?:role=["']img["']|aria-label=["']))[^>]*>/gi) || []).length;
  const svgShapeCount = (html.match(/<(?:path|line|polyline|polygon|rect|circle|ellipse)\b/gi) || []).length;
  const imageCount = (html.match(/<img\b/gi) || []).length;
  const cardCount = (html.match(/class=["'][^"']*\bcard\b[^"']*["']/gi) || []).length;
  const heroMatch = html.match(/<section\b[^>]*class=["'][^"']*hero[^"']*["'][^>]*>[\s\S]*?<\/section>/i) || html.match(/<header\b[\s\S]*?<\/header>/i);
  const hero = heroMatch ? heroMatch[0] : "";
  const heroVisuals = (hero.match(/<svg\b|<img\b|<picture\b/gi) || []).length;
  const galleryMatch = html.match(/<section\b(?=[^>]*(?:galeria|gallery|portfolio|estrutura))[^>]*>[\s\S]*?<\/section>/i) || html.match(/<div\b(?=[^>]*(?:galeria|gallery|portfolio|estrutura))[^>]*>[\s\S]*?<\/div>/i);
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
  const mobileCss = Array.from(html.matchAll(/@media\s*\([^)]*\)([\s\S]{0,5000})/gi), match => match[1]).join("\n");
  const mobileNavIsVertical = /(?:nav\s+ul|nav\s+\.?(?:nav-links|menu-links)|\.?(?:nav-links|menu-links)|nav)[^{]*\{[^}]*flex-direction\s*:\s*column/i.test(mobileCss);
  if (hasMenuButton && hasMobileRules && !mobileNavIsVertical) issues.push("No celular, os próprios links da lista de navegação precisam ficar empilhados verticalmente; não basta transformar o contêiner nav em coluna.");
  if (hasMenuButton && !/:focus-visible/i.test(html)) issues.push("Adicione estados :focus-visible claros para links e botões.");
  if (hasMenuButton && !/position\s*:\s*(?:fixed|absolute)/i.test(html)) issues.push("O painel mobile deve usar posicionamento e z-index que o mantenham legível acima do conteúdo.");
  if (/perguntas frequentes|\bfaq\b|d[uú]vidas frequentes/i.test(html) && !/aria-expanded|<details\b|addEventListener\s*\(\s*["']click|onclick=/i.test(html)) issues.push("FAQ sem interação aparente para abrir e fechar respostas.");
  if (/<form\b/i.test(html) && !/addEventListener\s*\(\s*["']submit|onsubmit=|mailto:|wa\.me\//i.test(html)) issues.push("Formulário sem tratamento de envio aparente; não finja que enviou dados.");
  if (/<form\b/i.test(html) && /onsubmit\s*=\s*["'][^"']*return\s+false|type\s*=\s*["']button["'][^>]*onclick\s*=\s*["'][^"']*alert/i.test(html)) issues.push("Formulário bloqueia o envio ou usa alerta falso; remova-o ou configure um destino real.");
  if (/<form\b/i.test(html) && !/<label\b/i.test(html)) issues.push("Formulário sem labels acessíveis.");
  if (broken.length) issues.push("Links internos sem destino: " + broken.slice(0, 6).map(id => "#" + id).join(", "));
  if (duplicateIds.length) issues.push("IDs duplicados: " + duplicateIds.slice(0, 5).join(", ") + ". Cada seção e controle precisa de um ID único.");
  if (/<img\b/i.test(html) && /<img\b(?![^>]*\balt=)/i.test(html)) issues.push("Adicione alt útil às imagens.");
  if (/via\.placeholder\.com|placehold\.co|placekitten\.com/i.test(html)) issues.push("Remova imagens placeholder; use imagens fornecidas ou ilustrações SVG/CSS originais.");
  if (/©\s*202[0-5]\b/i.test(html)) issues.push("Atualize o ano do rodapé dinamicamente ou use o ano atual.");
  if (hasGallery && svgCount + imageCount < 3) issues.push("A galeria não tem conteúdo visual suficiente: crie pelo menos três ilustrações SVG/CSS originais distintas, não caixas com rótulos.");
  if (hasGallery && /(?:área pesos|area pesos|cardio|funcional)[\s\S]{0,100}(?:background:\s*(?:#(?:111|121212|1a1a1a|222)|var\(--surface\)))/i.test(html) && svgCount < 3) issues.push("A galeria parece formada por caixas escuras com texto; substitua por painéis ilustrados e diferentes.");
  if (!hasGallery && /academia|restaurante|salão|salao|hotel|imobili[aá]ria|arquitetura|eventos/i.test(html)) issues.push("Inclua uma galeria visual adequada ao segmento, com ilustrações próprias se não houver fotos.");
  if (cardCount >= 7 && svgCount < 2) issues.push("O layout está repetitivo em cartões; varie a composição com mosaico, faixa editorial, timeline ou tipografia.");
  if (hero && heroVisuals === 0) issues.push("O hero não tem elemento visual próprio; crie composição editorial com ilustração SVG/CSS original relacionada ao segmento.");
  if (hero && heroVisuals === 1 && !hasVisualStyling) issues.push("O hero tem apenas um visual simples e sem tratamento; adicione camadas, recortes, profundidade e composição editorial.");
  if (hasGallery && gallerySvgCount + (galleryMatch ? (galleryMatch[0].match(/<img\b/gi) || []).length : 0) < 4) issues.push("A galeria precisa de quatro painéis visuais distintos dentro da própria seção; textos, cartões vazios e ícones soltos não contam.");
  const gallerySemanticSvgs = galleryMatch ? (galleryMatch[0].match(/<svg\b(?=[^>]*(?:role=["']img["']|aria-label=["']))[^>]*>/gi) || []).length : 0;
  if (hasGallery && gallerySemanticSvgs < 4) issues.push('Galeria sem quatro ilustrações acessíveis: cada painel SVG precisa de role="img" e aria-label descritivo.');
  if (hasGallery && svgShapeCount < 18) issues.push("Ilustrações pouco detalhadas: desenvolva os SVGs com múltiplas formas, linhas e detalhes específicos, não formas geométricas isoladas.");
  const heroSvg = (hero.match(/<svg\b[\s\S]*?<\/svg>/i) || [""])[0];
  const heroShapeCount = (heroSvg.match(/<(?:path|line|polyline|polygon|rect|circle|ellipse)\b/gi) || []).length;
  if (heroSvg && heroShapeCount < 5) issues.push("Hero sem composição detalhada: a ilustração principal precisa combinar ao menos cinco elementos SVG e ter descrição acessível.");
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
  const sectionBlocks = Array.from(html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi), m => ({ attrs: m[1], body: m[2] }));
  const sparseSections = sectionBlocks.filter(section => {
    const id = (section.attrs.match(/\bid=["']([^"']+)["']/i) || [])[1] || "";
    if (/hero|galeria|gallery|faq/i.test(id)) return false;
    const readable = section.body
      .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&(?:nbsp|amp|quot|#39|lt|gt);/gi, " ")
      .replace(/\s+/g, " ").trim();
    return readable.length < 65;
  });
  if (sparseSections.length) {
    const names = sparseSections.map(section => (section.attrs.match(/\bid=["']([^"']+)["']/i) || [])[1] || "sem-id");
    issues.push("Seções superficiais ou quase vazias: " + names.slice(0, 5).join(", ") + ". Desenvolva cada seção com conteúdo específico, contexto útil e composição própria.");
  }
  const gallerySvgs = galleryMatch ? Array.from(galleryMatch[0].matchAll(/<svg\b[\s\S]*?<\/svg>/gi), m => m[0]) : [];
  const underdevelopedGallerySvgs = gallerySvgs.filter(svg => (svg.match(/<(?:path|line|polyline|polygon|rect|circle|ellipse)\b/gi) || []).length < 4);
  if (hasGallery && (gallerySvgs.length < 4 || underdevelopedGallerySvgs.length > 0)) {
    issues.push("Galeria incompleta ou esquemática: entregue quatro ilustrações SVG próprias, cada uma com silhueta reconhecível e pelo menos quatro elementos gráficos detalhados.");
  }
  const heroUsesTwoColumns = /(?:\.hero|#hero)[^{]*\{[^}]*grid-template-columns\s*:\s*(?:1fr\s+1fr|repeat\(\s*2)/i.test(html);
  const heroHasMobileStack = /@media[\s\S]{0,1400}(?:\.hero|#hero)[^{]*\{[^}]*grid-template-columns\s*:\s*1fr/i.test(html);
  if (heroUsesTwoColumns && !heroHasMobileStack) {
    issues.push("Hero sem adaptação responsiva comprovada: empilhe texto e ilustração em uma coluna em telas pequenas.");
  }
  if (/id=["'](?:modalidades|servicos|services)["']/i.test(html)) {
    const block = sectionBlocks.find(section => /id=["'](?:modalidades|servicos|services)["']/i.test(section.attrs));
    if (block) {
      const bodyText = block.body.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const itemCount = (block.body.match(/<(?:article|li)\b|class=["'][^"']*(?:service|modalidade|servico)[^"']*["']/gi) || []).length;
      if (bodyText.length < 110 || itemCount < 2) issues.push("Seção de modalidades/serviços sem opções concretas suficientes: apresente pelo menos três opções ou explique claramente os serviços com conteúdo útil, sem inventar fatos.");
    }
  }
  if (/id=["']contato["']/i.test(html) && !hasRealContact && /canal de contato a configurar|contato a configurar|configure seu (?:whatsapp|telefone|e-mail)|adicionar (?:whatsapp|telefone|e-mail)|canais oficiais ser[aã]o adicionados|informa[cç][oõ]es de contato ser[aã]o/i.test(html)) {
    issues.push("Contato ainda contém instrução técnica ou placeholder: substitua por um encerramento editorial elegante, sem inventar canais nem criar botões falsos.");
  }
  return { sections, issues: issues.slice(0, 24) };
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

DIREÇÃO DE ARTE E QUALIDADE VISUAL OBRIGATÓRIA: aja como um estúdio digital profissional. Escolha um conceito visual específico do segmento e mantenha consistência em cores, tipografia, formas, ícones e fotografia/ilustração. Não entregue template genérico. Crie ritmo de página com alternância de fundos, largura controlada, respiro generoso, hierarquia tipográfica expressiva, títulos fortes, textos escaneáveis e CTAs claros. HERO: layout assimétrico, título grande com quebra intencional, etiqueta curta, CTA principal e ilustração SVG/CSS original com vários detalhes e camadas que conte algo sobre o negócio. Nunca use apenas um círculo, quadrado ou cruz como ilustração. Crie pelo menos DOIS momentos visuais memoráveis além do hero: mosaico assimétrico com quatro ilustrações SVG/CSS diferentes para negócios visuais; faixa editorial de destaque; timeline desenhada; manifesto tipográfico ou composição especial de serviços. Não use a mesma grade de cartões em todas as seções. Em cada painel SVG, desenhe objetos reconhecíveis e específicos do segmento com linhas, formas e detalhes próprios; formas geométricas soltas não contam como galeria. Use ícones SVG coerentes, estados hover/focus e microinterações discretas. Evite excesso de gradientes, emojis como ícones principais, sombras pesadas e bordas em todos os elementos. O resultado deve ter acabamento autoral e excelente adaptação a desktop e celular. Se não houver imagens reais fornecidas, crie visuais editoriais com CSS/SVG e cores/texturas adequadas ao segmento; NÃO use via.placeholder.com, placehold.co, placekitten.com, URLs inventadas, imagens quebradas ou URLs externas aleatórias. Se usar imagem remota, ela deve ser uma URL pública real e estável que você conheça; caso contrário, não use imagem remota. O resultado deve ser visualmente rico e excelente em desktop e celular. Não basta cumprir contagem de seções: nenhuma seção pode ser apenas um título e uma frase genérica. Desenvolva cada seção com um bloco informativo específico, exemplos de opções/etapas quando cabíveis e hierarquia visual própria. Em serviços/modalidades, mostre pelo menos três opções claramente distintas, cada uma com título, explicação específica e benefício possível sem prometer resultados. Não deixe a seção apenas com três nomes e frases vagas. O hero deve empilhar texto e arte no celular. A seção de contato sem dados confirmados deve ser um encerramento editorial profissional e atraente, com convite neutro para conhecer o negócio. Não escreva “a configurar”, “adicionar contato”, “canais serão adicionados” nem qualquer instrução técnica visível; não invente telefone, e-mail ou WhatsApp. Em telas pequenas, o menu deve abrir como painel vertical legível, com links empilhados, espaçamento de toque adequado, fundo sólido e z-index correto; nunca deixe links em linha espremida ou sobrepostos. O botão deve atualizar aria-expanded e aria-controls, fechar ao selecionar link e ao pressionar Escape. Inclua :focus-visible em links, botões e campos. PROIBIDO deixar retângulos pretos/cinzas vazios ou caixas que pareçam imagens ausentes: crie uma ilustração SVG/CSS completa dentro delas, ou remova o bloco e reorganize o layout. Nunca deixe navegação escondida no celular sem botão hambúrguer acessível e funcional. Não publique preços como R$ XXX,XX nem frases como 'unidade a definir'; se os dados faltarem, omita-os ou use um aviso de edição discreto que não pareça conteúdo final.

ESTRUTURA OBRIGATÓRIA: entregue de 8 a 12 elementos <section> reais, cada um com conteúdo útil e id único. Para academia, use exatamente esta sequência adaptada: hero, sobre, modalidades, benefícios, método/etapas, galeria visual, planos (sem inventar preços), depoimentos somente se fornecidos (caso contrário substitua por manifesto/experiência), FAQ e contato. Para outros segmentos, adapte a mesma profundidade ao negócio. Não conte header, footer ou div como seção. Não esconda seções com display:none. Cada seção deve ter composição própria e não repetir a mesma grade de cartões. Negócios visuais exigem galeria com quatro cenas/painéis ilustrados detalhados e distintos, não formas abstratas.

FUNCIONALIDADE E ACESSIBILIDADE: menu móvel realmente funcional, botão com aria-label e aria-expanded atualizado em cada abertura/fechamento; feche o menu ao clicar num link e ao pressionar Escape. Navegação por âncoras com scroll suave, mas respeite prefers-reduced-motion. FAQ com botões que atualizem aria-expanded e aria-controls, ou use details/summary nativo. Galeria/modal, se houver, deve ter botão de fechar acessível, aria-label apropriado, fechar com Escape e imagem com alt útil. Só crie formulário se houver destino real de envio fornecido ou integração disponível. Caso contrário, NÃO crie formulário: crie uma seção de encerramento editorial com convite neutro e visual marcante, sem mencionar configuração, ausência de contato ou instruções técnicas, e sem campos nem botão de envio. Nunca use onsubmit="return false", botão que finge enviar, alertas de integração ou mensagens falsas de sucesso. Botões e links devem funcionar. Use foco visível, contraste adequado e HTML semântico. Inclua title, meta description, headings em ordem e textos alternativos úteis quando houver imagens.

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
          generationConfig: { temperature: 0.75, maxOutputTokens: 16000 }
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
        "SEÇÕES OBRIGATÓRIAS: entregue 8 a 12 elementos <section> reais, não conte header/footer/div. Para academia inclua hero, sobre, modalidades, benefícios, método, galeria, planos, manifesto ou experiência, FAQ e contato. Cada seção precisa ter conteúdo e id próprio.",
        "SEGMENTO ACADEMIA: use linguagem visual esportiva premium. Se não houver fotos fornecidas, desenhe SVGs detalhados e reconhecíveis de halteres, anilhas, esteira, corda naval ou atleta em movimento, sem alegar que esses equipamentos existem na academia. Não use ícones geométricos genéricos como ilustração principal.",
        "HERO: composição editorial assimétrica, título grande com quebra intencional, etiqueta curta, CTA destacado e ilustração SVG inline original com vários elementos reconhecíveis e detalhes do segmento. Use camadas, recortes, escala e profundidade. Proibido quadrado solitário, círculo genérico, cruz simples ou bloco vazio.",
        'A ilustração do hero deve conter ao menos cinco elementos SVG combinados e um <title> ou aria-label que descreva a cena. Para academia, represente equipamento/atividade reconhecível, não apenas formas abstratas.',
        "GALERIA: para segmentos visuais, crie exatamente quatro ou mais painéis ilustrados distintos em SVG/CSS original, todos dentro da seção da galeria. Desenhe objetos reconhecíveis do segmento com linhas, detalhes e composição própria. Quatro círculos/quadrados soltos não contam. Nunca use caixas vazias com rótulos. Não invente fotos nem URLs.",
        'Cada SVG ilustrativo da galeria deve ter role="img" e aria-label descritivo que identifique claramente o objeto/cena (ex.: "Halteres e anilhas em composição", "Esteira de corrida", "Corda naval em movimento", "Atleta fazendo agachamento"). Não conte ícones decorativos sem descrição como ilustrações. Cada painel deve ter pelo menos 4 elementos SVG combinados e detalhes internos.',
        "VARIEDADE: entre 8 e 12 seções úteis e pelo menos dois momentos visuais memoráveis além do hero: mosaico assimétrico, faixa editorial, timeline ou manifesto tipográfico. Evite repetir cartões iguais.",
        "CONTEÚDO: nenhuma seção pode ficar em título + frase genérica. Desenvolva serviços/modalidades com pelo menos três opções úteis e distintas, método com etapas claras, benefícios contextualizados e FAQ com respostas completas. Sem inventar fatos.",
        "CONTATO: sem canais fornecidos, não invente telefone/e-mail/WhatsApp nem crie botão falso. Remova qualquer menção a “a configurar”, “adicionar contato” ou “canais serão adicionados”. Faça uma seção final editorial, elegante e visualmente forte, com convite neutro para conhecer o negócio.",
        "RESPONSIVIDADE: se hero usar duas colunas no desktop, crie regra mobile explícita para empilhar texto e ilustração em uma coluna; revise grids e tipografia para telas estreitas.",
        'SVG: cada ilustração da galeria deve ter pelo menos quatro elementos gráficos combinados, silhueta reconhecível e detalhes internos específicos; não basta adicionar aria-label a um círculo ou retângulo.',
        "ACABAMENTO: tipografia hierárquica, espaçamento generoso, grid consistente, contraste, ícones SVG coerentes, microinterações discretas e visual profissional em desktop e celular.",
        "MOBILE: menu em painel vertical, fundo sólido, position fixed/absolute, z-index alto. A lista nav ul (não apenas o elemento nav) deve usar display:flex e flex-direction:column, com links empilhados, espaçamento e boa área de toque. Botão com aria-label, aria-controls e aria-expanded atualizado. Fechar ao clicar em qualquer link e ao pressionar Escape. Nav com aria-label, :focus-visible e prefers-reduced-motion.",
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
            const weight = issue => /IDs duplicados|Links internos sem destino|Seções superficiais|Seção de modalidades|Contato ainda parece|Galeria sem ilustrações identificáveis|Hero sem composição detalhada|adaptação responsiva comprovada/i.test(issue) ? 18 : 8;
            const score = q => q.issues.reduce((total, issue) => total + weight(issue), 0) + Math.max(0, 8 - q.sections) * 12 + Math.max(0, q.sections - 12) * 12;
            const originalScore = score(quality);
            const candidateScore = score(candidateQuality);
            const criticalPatterns = /IDs duplicados|Links internos sem destino|Seções superficiais|Seção de modalidades|Contato ainda contém|Galeria sem quatro ilustrações|Galeria incompleta|Hero sem composição detalhada|adaptação responsiva comprovada|próprios links da lista de navegação/;
            const candidateHasRequiredArt = !candidateQuality.issues.some(issue => /Galeria sem quatro ilustrações|Galeria incompleta|Hero sem composição detalhada|desenhos esquemáticos/.test(issue));
            const candidateHasNoCriticalIssues = !candidateQuality.issues.some(issue => criticalPatterns.test(issue));
            const candidateIsValid = candidateQuality.sections >= 8 && candidateQuality.sections <= 12 && candidateScore < originalScore && candidateHasRequiredArt && candidateHasNoCriticalIssues;
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
      quality: { checked: true, autoRepairAttempted: repairAttempted, autoRepairApplied: repairApplied, repairStatus: !repairAttempted ? "not-needed" : repairApplied ? "applied" : "not-applied", sectionCount: quality.sections, warnings: quality.issues, note: "A verificação é estática; confira a prévia e teste os controles no navegador." }
    }, 200, origin);
  }
};
