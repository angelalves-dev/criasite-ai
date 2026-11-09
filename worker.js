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


function segmentVisualBrief(type) {
  const key = String(type || "servicos").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const profiles = {
    academia: ["photo-1534438327276-14e5300c3a48", "photo-1571019613454-1cb2f99b2d8b", "photo-1583454110551-21f2fa2afe61", "photo-1517836357463-d25dfeac3438"],
    restaurante: ["photo-1517248135467-4c7edcad34c4", "photo-1414235077428-338989a2e8c0", "photo-1515003197210-e0cd7184f8b2", "photo-1559339352-11d035aa65de"],
    barbearia: ["photo-1503951914875-452162b0f3f1", "photo-1599351431202-1e0f0137899a", "photo-1621605815971-fbc98d665033", "photo-1503951914875-452162b0f3f1"],
    beleza: ["photo-1560066984-138dadb4c035", "photo-1522337360788-8b13dee7a37e", "photo-1487412720507-e7ab37603c6f", "photo-1521590832167-7bcbfaa6381f"],
    clinica: ["photo-1629909613654-28e377c37b09", "photo-1576091160399-112ba8d25d1d", "photo-1584982751601-97d4b6c8b6c5", "photo-1631815588090-d4bfec5b1ccb"],
    loja: ["photo-1441986300917-64674bd600d8", "photo-1472851294608-062f824d29cc", "photo-1490481651871-ab68de25d43d", "photo-1523275335684-37898b6baf30"],
    petshop: ["photo-1548199973-03cce0bbc87b", "photo-1583337130417-3346a1be7dee", "photo-1543466835-00a7907e9de1", "photo-1552053831-71594a27632d"],
    imobiliaria: ["photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687920-4e2a09cf159d"],
    fotografo: ["photo-1452587925148-ce544e77e70d", "photo-1516035069371-29a1b244cc32", "photo-1492691527719-9d1e07e534b4", "photo-1500530855697-b586d89ba3ee"],
    construcao: ["photo-1503387762-592deb58ef4e", "photo-1504307651254-35680f356dfd", "photo-1541888946425-d81bb19240f5", "photo-1503387762-592deb58ef4e"],
    educacao: ["photo-1509062522246-3755977927d7", "photo-1523050854058-8df90110c9f1", "photo-1503676260728-1c00da094a0b", "photo-1509062522246-3755977927d7"],
    servicos: ["photo-1497366754035-f200968a6e72", "photo-1497366216548-37526070297c", "photo-1497366811353-6870744d04b2", "photo-1497366754035-f200968a6e72"]
  };
  const aliases = { "salao": "beleza", "salao de beleza": "beleza", "gym": "academia", "fitness": "academia", "musculacao": "academia", "academia de ginastica": "academia", "restaurante / lanchonete": "restaurante", "pet shop": "petshop", "pet-shop": "petshop", "clinica medica": "clinica", "loja virtual": "loja", "fotografia": "fotografo", "imoveis": "imobiliaria" };
  const selected = aliases[key] || key;
  const ids = profiles[selected] || profiles.servicos;
  const urls = ids.map((id, index) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=" + (index === 0 ? "1500" : "900") + "&q=85");
  return [
    "DIREÇÃO VISUAL ESPECÍFICA DO SEGMENTO (" + selected + "):",
    "Priorize fotografia editorial real como base visual, não uma galeria de ícones ou quatro SVGs esquemáticos. URLs de fotografia pública selecionadas para este segmento:",
    ...urls.map((url, index) => (index + 1) + ". " + url),
    "Use as quatro imagens em painéis com object-fit:cover, proporções variadas, recortes editoriais e alt em português começando por 'Imagem ilustrativa'. Use a primeira imagem como visual principal do hero. Não afirme que as imagens mostram o estabelecimento, equipe ou clientes reais: são referências ilustrativas do segmento. Não invente imagens de pessoas identificáveis como funcionários ou clientes.",
    "Crie composição premium: hero com foto grande + título e CTA; mosaico com pelo menos quatro fotos; alterne seções editoriais, listas e faixas com fundos diferentes. Não force seção de planos para negócios que não vendem planos/assinaturas. Não invente depoimentos, avaliações, números ou resultados."
  ].join("\n");
}


function enforceSegmentPhotography(html, business = {}) {
  let output = String(html || "");
  const key = String(business.type || "servicos").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const profiles = {
    academia: ["photo-1534438327276-14e5300c3a48", "photo-1571019613454-1cb2f99b2d8b", "photo-1583454110551-21f2fa2afe61", "photo-1517836357463-d25dfeac3438"],
    restaurante: ["photo-1517248135467-4c7edcad34c4", "photo-1414235077428-338989a2e8c0", "photo-1515003197210-e0cd7184f8b2", "photo-1559339352-11d035aa65de"],
    barbearia: ["photo-1503951914875-452162b0f3f1", "photo-1599351431202-1e0f0137899a", "photo-1621605815971-fbc98d665033", "photo-1503951914875-452162b0f3f1"],
    beleza: ["photo-1560066984-138dadb4c035", "photo-1522337360788-8b13dee7a37e", "photo-1487412720507-e7ab37603c6f", "photo-1521590832167-7bcbfaa6381f"],
    clinica: ["photo-1629909613654-28e377c37b09", "photo-1576091160399-112ba8d25d1d", "photo-1584982751601-97d4b6c8b6c5", "photo-1631815588090-d4bfec5b1ccb"],
    loja: ["photo-1441986300917-64674bd600d8", "photo-1472851294608-062f824d29cc", "photo-1490481651871-ab68de25d43d", "photo-1523275335684-37898b6baf30"],
    petshop: ["photo-1548199973-03cce0bbc87b", "photo-1583337130417-3346a1be7dee", "photo-1543466835-00a7907e9de1", "photo-1552053831-71594a27632d"],
    imobiliaria: ["photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687920-4e2a09cf159d"],
    fotografo: ["photo-1452587925148-ce544e77e70d", "photo-1516035069371-29a1b244cc32", "photo-1492691527719-9d1e07e534b4", "photo-1500530855697-b586d89ba3ee"],
    construcao: ["photo-1503387762-592deb58ef4e", "photo-1504307651254-35680f356dfd", "photo-1541888946425-d81bb19240f5", "photo-1503387762-592deb58ef4e"],
    educacao: ["photo-1509062522246-3755977927d7", "photo-1523050854058-8df90110c9f1", "photo-1503676260728-1c00da094a0b", "photo-1509062522246-3755977927d7"],
    servicos: ["photo-1497366754035-f200968a6e72", "photo-1497366216548-37526070297c", "photo-1497366811353-6870744d04b2", "photo-1497366754035-f200968a6e72"]
  };
  const aliases = { "gym": "academia", "fitness": "academia", "musculacao": "academia", "academia de ginastica": "academia", "restaurante / lanchonete": "restaurante", "pet shop": "petshop", "salao": "beleza", "salao de beleza": "beleza" };
  const selected = aliases[key] || key;
  const ids = profiles[selected] || profiles.servicos;
  const makeUrl = (id, index) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=" + (index === 0 ? "1500" : "900") + "&q=85";
  const replaceImage = (tag, url, alt, eager) => {
    let next = tag;
    if (/\bsrc\s*=\s*["'][^"']*["']/i.test(next)) next = next.replace(/\bsrc\s*=\s*["'][^"']*["']/i, 'src="' + url + '"');
    else next = next.replace(/<img\b/i, '<img src="' + url + '"');
    if (/\balt\s*=\s*["'][^"']*["']/i.test(next)) next = next.replace(/\balt\s*=\s*["'][^"']*["']/i, 'alt="' + alt + '"');
    else next = next.replace(/<img\b/i, '<img alt="' + alt + '"');
    next = next.replace(/\sloading\s*=\s*["'][^"']*["']/i, "");
    next = next.replace(/\sdecoding\s*=\s*["'][^"']*["']/i, "");
    next = next.replace(/<img\b/i, '<img loading="' + (eager ? "eager" : "lazy") + '" decoding="async"');
    return next;
  };
  const heroRe = /<section\b(?=[^>]*\bid=["']hero["'])[^>]*>[\s\S]*?<\/section>/i;
  output = output.replace(heroRe, section => {
    let used = false;
    return section.replace(/<img\b[^>]*>/i, tag => {
      used = true;
      return replaceImage(tag, makeUrl(ids[0], 0), "Imagem ilustrativa do segmento " + selected, true);
    });
  });
  const galleryRe = /<section\b(?=[^>]*\bid=["'](?:galeria|gallery|estrutura)["'])[^>]*>[\s\S]*?<\/section>/i;
  output = output.replace(galleryRe, section => {
    let index = 0;
    section = section.replace(/<img\b[^>]*>/gi, tag => {
      if (index >= 4) return tag;
      const i = index++;
      return replaceImage(tag, makeUrl(ids[i], i), "Imagem ilustrativa " + (i + 1) + " do segmento " + selected, false);
    });
    while (index < 4) {
      const i = index++;
      const image = '<figure class="gallery-item" style="margin:0;overflow:hidden;border-radius:12px;aspect-ratio:4/3"><img src="' + makeUrl(ids[i], i) + '" alt="Imagem ilustrativa ' + (i + 1) + ' do segmento ' + selected + '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover"></figure>';
      if (/<svg\b[\s\S]*?<\/svg>/i.test(section)) section = section.replace(/<svg\b[\s\S]*?<\/svg>/i, image);
      else section = section.replace(/<\/section>/i, image + "</section>");
    }
    return section;
  });
  return output;
}

function inspectHtml(html, business = {}) {
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
  const whatsappDigits = String(business.whatsapp || "").replace(/[^0-9]/g, "");
  const hasWhatsAppContact = whatsappDigits.length >= 10 && whatsappDigits.length <= 15 &&
    new RegExp("wa\\.me/" + whatsappDigits + "(?:[?\\\"'])?", "i").test(html);
  const hasRealContact = hasWhatsAppContact;
  const contactBlock = (html.match(/<section\b(?=[^>]*\bid=["']contato["'])[^>]*>[\s\S]*?<\/section>/i) || [""])[0];
  const fakeContact = /(?:mailto:|href=["'][^"']*(?:example\.com|powerfit\.com|seudominio|seuemail)|contato@(?:powerfit|exemplo|example)\.)/i.test(contactBlock);
  const waLinks = Array.from(contactBlock.matchAll(/https?:\/\/(?:www\.)?wa\.me\/([0-9+]+)/gi), match => match[1].replace(/\D/g, ""));
  const hasDummyWhatsApp = waLinks.some(number => number.length < 10 || number.length > 15 || /^0+$/.test(number) || /^(1234567890|11999999999|5511999999999)$/.test(number));
  const unsupportedCommercialClaims = /(?:acesso livre|acesso total|avaliação inicial|avaliação mensal|acompanhamento total|acompanhamento individual|horário de funcionamento|horário de atendimento|nossa equipe|equipe técnica|equipe especializada|treino supervisionado|avaliação periódica|reavaliação periódica|planilha de treino personalizada|visita guiada|tour guiado|suporte técnico|prioridade em agendamentos|processo realizado presencialmente|visite nossa unidade|nossa recepção|recepção da academia|profissionais certificados|instrutores acompanham|atendimento personalizado)/i.test(html);
  const deadLinks = (html.match(/href=["'](?:#|javascript:void\(0\)|javascript:;)["']/gi) || []).length;

  const structureSource = html.replace(/<!--[\s\S]*?-->/g, "");
  const structuralTags = ["html", "head", "body", "header", "nav", "main", "section", "article", "aside", "footer", "div", "ul", "ol", "li", "details", "summary", "form", "button", "script", "style"];
  const unbalancedTags = structuralTags.filter(tag => {
    const opened = (structureSource.match(new RegExp("<" + tag + "\\b(?![^>]*\\/>)", "gi")) || []).length;
    const closed = (structureSource.match(new RegExp("</" + tag + "\\s*>", "gi")) || []).length;
    return opened !== closed;
  });
  if (unbalancedTags.length) issues.push("HTML com estrutura inválida: tags sem abertura ou fechamento correspondente (" + unbalancedTags.join(", ") + "). Corrija toda a hierarquia antes de entregar.");
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
  const mobileNavIsVertical = /(?:nav\s+ul|nav\s+\.?(?:nav-links|menu-links)|\.?(?:nav-links|menu-links))[^{]*\{[^}]*flex-direction\s*:\s*column/i.test(mobileCss);
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
  const galleryImageCount = galleryMatch ? (galleryMatch[0].match(/<img\b/gi) || []).length : 0;
  const galleryImagesWithAlt = galleryMatch ? (galleryMatch[0].match(/<img\b(?=[^>]*\balt=["'][^"']+["'])[^>]*>/gi) || []).length : 0;
  const expectedPhotoIds = Array.from(segmentVisualBrief(business.type).matchAll(/images\.unsplash\.com\/(photo-[^?]+)/g), match => match[1]);
  const galleryImageTags = galleryMatch ? Array.from(galleryMatch[0].matchAll(/<img\b[^>]*>/gi), match => match[0]) : [];
  const galleryPhotoIds = galleryImageTags.map(tag => ((tag.match(/src=["'][^"']*images\.unsplash\.com\/(photo-[^?]+)/i) || [])[1] || ""));
  const correctSegmentPhotos = galleryPhotoIds.filter(id => expectedPhotoIds.includes(id)).length;
  if (hasGallery && galleryImagesWithAlt < 4) issues.push("Galeria precisa conter quatro fotografias reais com texto alternativo útil.");
  if (hasGallery && expectedPhotoIds.length && correctSegmentPhotos < 4) issues.push("Galeria usa fotos ausentes ou incompatíveis com o segmento. Use exatamente as quatro URLs de fotografia fornecidas para este tipo de negócio.");
  if (hasGallery && gallerySemanticSvgs + galleryImagesWithAlt < 4) issues.push("Galeria precisa de quatro imagens com alt útil ou ilustrações SVG acessíveis.");
  if (hasGallery && gallerySvgCount > 0 && svgShapeCount < 18 && (galleryMatch ? (galleryMatch[0].match(/<img\b/gi) || []).length : 0) < 4) issues.push("Ilustrações pouco detalhadas: desenvolva os SVGs com múltiplas formas, linhas e detalhes específicos, não formas geométricas isoladas.");
  const heroSvg = (hero.match(/<svg\b[\s\S]*?<\/svg>/i) || [""])[0];
  const heroShapeCount = (heroSvg.match(/<(?:path|line|polyline|polygon|rect|circle|ellipse)\b/gi) || []).length;
  if (heroSvg && heroShapeCount < 5) issues.push("Hero sem composição detalhada: a ilustração principal precisa combinar ao menos cinco elementos SVG e ter descrição acessível.");
  if (cardCount >= 5 && !/(?:masonry|grid-template-areas|:nth-child\()/i.test(html)) issues.push("A composição repete cartões sem hierarquia; crie mosaico assimétrico ou destaque visual com tamanhos variados.");
  if (!hasVisualStyling) issues.push("Falta direção de arte visual: use recursos gráficos CSS/SVG, texturas, recortes, camadas e detalhes consistentes.");
  if (deadLinks >= 2) issues.push("Há links sem destino ou links javascript:void; conecte cada ação a uma seção real ou remova a ação.");
  if (fakeContact) issues.push("Contato contém e-mail ou domínio fictício. Remova o mailto inventado; só use um canal de contato fornecido pelo cliente.");
  if (hasDummyWhatsApp) issues.push("O site contém um WhatsApp fictício, incompleto ou de exemplo. Remova imediatamente esse link e qualquer botão de contato associado; nunca use números com zeros ou números de demonstração.");
  if (waLinks.length && !hasWhatsAppContact) issues.push("Existe link wa.me que não corresponde exatamente ao WhatsApp fornecido pelo cliente. Remova o link incorreto.");
  if (unsupportedCommercialClaims) issues.push("O conteúdo apresenta como fatos serviços, equipe, horários, avaliações ou benefícios de planos que não foram confirmados. Reescreva como explicações neutras e convites para consultar condições, sem afirmar que o negócio oferece algo não informado.");
  if (!whatsappDigits && /(?:wa\.me\/|tel:|mailto:)/i.test(contactBlock)) issues.push("Não foi fornecido canal de contato: remova links de WhatsApp, telefone e e-mail que não vieram dos dados do cliente.");
  const fakeContactCta = /<(?:span|div|button)\b[^>]*class=["\'][^"\']*(?:btn|cta|contact-link)/i.test(contactBlock) && /falar com|fale conosco|entre em contato|iniciar jornada|solicite|agende/i.test(contactBlock);
  if (!whatsappDigits && !/<form\b/i.test(contactBlock) && fakeContactCta) issues.push("A seção de contato apresenta uma chamada sem ação funcional. Sem canal real fornecido, transforme o encerramento em conteúdo editorial neutro e remova o falso botão.");
  if (whatsappDigits.length >= 10 && whatsappDigits.length <= 15 && !hasWhatsAppContact) issues.push("O WhatsApp informado pelo cliente precisa estar conectado em um link https://wa.me/ com o número correto.");
  if (/agende uma visita|fale conosco|entre em contato|solicite um or[cç]amento/i.test(contactBlock || html) && !hasRealContact && whatsappDigits.length > 0) issues.push("A chamada comercial precisa usar o WhatsApp real informado pelo cliente.");
  if (/<img\b/i.test(html) && /<img\b(?![^>]*\bloading=["']lazy["'])/i.test(html)) issues.push("Imagens fora do hero devem usar loading=lazy para melhorar o carregamento.");
  if (/(?:min-width\s*:\s*(?:280|300|320|350)px|width\s*:\s*(?:300|320|350)px)/i.test(html) && !/overflow-x\s*:\s*hidden|overflow-x\s*:\s*clip/i.test(html)) issues.push("Revise larguras mínimas fixas que podem causar rolagem horizontal em celulares; use grids fluidos com minmax(0, 1fr).");
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
  const galleryPhotoCount = galleryMatch ? (galleryMatch[0].match(/<img\b/gi) || []).length : 0;
  if (hasGallery && galleryPhotoCount < 4) {
    issues.push("Galeria incompleta: use pelo menos quatro fotografias ilustrativas do segmento, com alt útil e recortes variados.");
  } else if (hasGallery && underdevelopedGallerySvgs.length > 0) {
    issues.push("Remova SVGs esquemáticos da galeria; priorize fotografias ilustrativas reais.");
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
  const sectionText = sectionBlocks.map(section => section.body.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  const substantialSections = sectionText.filter(text => text.length >= 150).length;
  if (sections >= 8 && substantialSections < 6) issues.push("Profundidade editorial insuficiente: desenvolva pelo menos seis seções com conteúdo útil, não apenas títulos e frases curtas.");
  const normalizedHtml = html.toLowerCase();
  if (/academia|muscula[cç][aã]o|powerfit|treinamento f[ií]sico/i.test(normalizedHtml)) {
    if (!/benef[ií]cios|vantagens|diferenciais/i.test(normalizedHtml)) issues.push("Falta uma seção de benefícios com conteúdo específico.");
    if (!/m[eé]todo|etapas|como funciona|jornada/i.test(normalizedHtml)) issues.push("Falta explicar o método ou as etapas da experiência.");
    if (!/manifesto|filosofia|no que acreditamos|experi[eê]ncia/i.test(normalizedHtml)) issues.push("Falta um momento de identidade da marca, como manifesto ou filosofia.");
  }
  const requestedType = String(business.type || "").trim().toLowerCase();
  const isFitnessSite = requestedType === "academia" || (!requestedType && /academia|muscula[cç][aã]o|powerfit|treinamento f[ií]sico/i.test(normalizedHtml));
  if (isFitnessSite && sections !== 10) issues.push("Estrutura de academia incorreta: entregue exatamente dez seções reais.");
  if (isFitnessSite) {
    const expectedOrder = ["hero", "sobre", "modalidades", "beneficios", "metodo", "galeria", "planos", "manifesto", "faq", "contato"];
    const actualOrder = sectionBlocks.map(section => ((section.attrs.match(/\bid=["']([^"']+)["']/i) || [])[1] || "").toLowerCase());
    const normalizedOrder = actualOrder.map(id => id.includes("etapa") ? "metodo" : id.includes("filosofia") ? "manifesto" : id.includes("gallery") ? "galeria" : id);
    if (expectedOrder.some((id, index) => normalizedOrder[index] !== id)) {
      issues.push("As dez seções da academia precisam seguir a ordem obrigatória: hero, sobre, modalidades, benefícios, método, galeria, planos, manifesto, FAQ e contato.");
    }
  }
  const plansBlock = sectionBlocks.find(section => /id=["']planos["']/i.test(section.attrs));
  if (isFitnessSite && plansBlock) {
    const planItems = (plansBlock.body.match(/<(?:article|li)\b|class=["'][^"']*(?:plan-card|pricing-card|plano-card)[^"']*["']/gi) || []).length;
    if (planItems < 3) issues.push("Planos sem hierarquia visual: crie pelo menos três cards article distintos, cada um com nome, descrição e lista de itens, sem inventar preços ou condições.");
  }
  const faqBlock = sectionBlocks.find(section => /id=["']faq["']/i.test(section.attrs));
  if (faqBlock) {
    const faqText = faqBlock.body.replace(/<[^>]+>/g, " ");
    const questionCount = (faqText.match(/\?/g) || []).length;
    const detailCount = (faqBlock.body.match(/<details\b/gi) || []).length;
    if (Math.max(questionCount, detailCount) < 5) issues.push("FAQ superficial: inclua pelo menos cinco perguntas úteis com respostas completas.");
  }
  const visibleText = html.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (/\*\*[^*]{2,80}\*\*|(?<!\*)\*[^*\n]{2,80}\*(?!\*)/.test(visibleText)) issues.push("Há marcação Markdown visível no texto; converta para tags HTML.");
  if (/minmax\(\s*(?:280|300|320|350)px\s*,/i.test(html)) issues.push("Há colunas com largura mínima rígida que podem estourar a tela; use grids fluidos.");
  if (/(?:agende|marque)\s+(?:uma\s+)?(?:visita|avaliação|aula experimental)/i.test(html) && !hasWhatsAppContact && !/<form\b/i.test(contactBlock)) issues.push("A chamada promete agendamento, mas não há canal funcional; troque por convite neutro.");
  if (faqBlock && /(?:a partir de\s*\d{1,2}\s*anos|segunda.{0,30}sexta|\b(?:abre|aberto|funciona|funcionamento)\b.{0,50}\b(?:h\b|horário|\d{1,2}:\d{2})|cancelamento.{0,80}(?:presencial|multa|aviso prévio)|\b(?:obrigatório|permitido|proibido)\b)/i.test(faqBlock.body)) issues.push("O FAQ contém regras, horários ou políticas específicas não confirmadas; substitua por perguntas neutras.");
  if (faqBlock && (faqBlock.body.match(/<details\b/gi) || []).length < 5) issues.push("O FAQ precisa de cinco perguntas em details/summary, com respostas úteis e sem regras inventadas.");
  if (isFitnessSite && plansBlock && (plansBlock.body.match(/<article\b/gi) || []).length < 3) issues.push("A seção de planos precisa de três cards article reais; itens de lista isolados não contam.");
  if (galleryMatch) {
    const svgShapes = Array.from(galleryMatch[0].matchAll(/<svg\b[\s\S]*?<\/svg>/gi), match => (match[0].match(/<(?:path|line|polyline|polygon|rect|circle|ellipse)\b/gi) || []).length);
    if (svgShapes.length >= 4 && svgShapes.some(count => count < 4)) issues.push("Cada painel da galeria precisa de SVG desenvolvido com pelo menos quatro formas ou detalhes.");
  }
  if (isFitnessSite) {
    const requiredTopics = [
      [/id=["']beneficios["']|>\s*benef[ií]cios\b/i, "benefícios"],
      [/id=["']manifesto["']|manifesto|nossa filosofia|no que acreditamos/i, "manifesto"],
      [/id=["']planos["']|planos/i, "planos"],
      [/id=["']faq["']|perguntas frequentes/i, "FAQ"]
    ];
    for (const [pattern, label] of requiredTopics) {
      if (!pattern.test(html)) issues.push("Seção obrigatória ausente: " + label + ".");
    }
  }
  const galleryObjectLabels = galleryMatch
    ? Array.from(galleryMatch[0].matchAll(/<svg\b(?=[^>]*aria-label=["']([^"']+)["'])[^>]*>/gi), match => match[1].toLowerCase())
    : [];
  if (isFitnessSite && galleryPhotoCount < 4) {
    const objectGroups = [/halter|peso livre|dumbbell/, /anilha|disco de peso|weight plate/, /esteira|treadmill/, /corda naval|battle rope/];
    const representedObjects = objectGroups.filter(pattern => galleryObjectLabels.some(label => pattern.test(label))).length;
    if (representedObjects < 4) issues.push("Galeria da academia precisa mostrar quatro cenas distintas: use fotografias ilustrativas ou SVGs identificados de halteres, anilhas, esteira e corda naval.");
  }
  const unsupportedClaims = /instrutores qualificados|acompanhamento di[aá]rio|equipe especializada|profissionais certificados|equipamentos de [úu]ltima gera[cç][aã]o|[áa]rea dedicada|estrutura completa|ambiente climatizado|resultados garantidos/i;
  if (unsupportedClaims.test(html)) issues.push("Há afirmações sobre equipe, equipamentos, instalações ou serviços que não foram confirmadas nos dados fornecidos.");
  const mobileUlRule = /nav\s+ul[^{]*\{[^}]*display\s*:\s*flex[^}]*flex-direction\s*:\s*column|nav\s+ul[^{]*\{[^}]*flex-direction\s*:\s*column[^}]*display\s*:\s*flex/i.test(mobileCss);
  if (hasMenuButton && hasMobileRules && !mobileUlRule) issues.push("A lista nav ul precisa ter regra mobile explícita com display:flex e flex-direction:column.");
  const visualMoments = [/manifesto|faixa[- ]editorial|statement/i, /timeline|etapas|processo/i, /masonry|grid-template-areas|bento|assim[eé]tric/i, /clip-path|mask-image|background-image|radial-gradient|linear-gradient/i].filter(pattern => pattern.test(normalizedHtml)).length;
  if (visualMoments < 2) issues.push("Direção de arte sem variedade: crie pelo menos dois momentos visuais especiais além do hero.");
  return { sections, issues: issues.slice(0, 24) };
}
function polishHtml(html) {
  let output = String(html || "");
  // Corrige padrões responsivos comuns sem alterar o conteúdo comercial.
  output = output.replace(/minmax\(\s*(?:280|300|320|350)px\s*,\s*1fr\s*\)/gi, "minmax(min(100%, 16rem), 1fr)");
  output = output.replace(/(min-width\s*:\s*)(?:280|300|320|350)px/gi, "$1min(100%, 16rem)");
  // Atualiza automaticamente anos antigos no rodapé.
  output = output.replace(/©\s*20(?:1[8-9]|2[0-5])\b/g, "© <span data-current-year></span>");
  // Melhora carregamento e segurança de links externos.
  output = output.replace(/<img\b(?![^>]*\bdecoding=)([^>]*)>/gi, '<img decoding="async"$1>');
  output = output.replace(/<a\b([^>]*\btarget=["']_blank["'][^>]*)>/gi, (tag, attrs) => {
    if (/\brel=["'][^"']*["']/i.test(attrs)) {
      return tag.replace(/rel=["']([^"']*)["']/i, (whole, rel) => 'rel="' + [...new Set((rel + " noopener noreferrer").trim().split(/\s+/))].join(" ") + '"');
    }
    return "<a" + attrs + ' rel="noopener noreferrer">';
  });
  if (/data-current-year/.test(output) && !/querySelectorAll\(['"]\[data-current-year\]/.test(output)) {
    output = output.replace(/<\/body>/i, '<script>document.querySelectorAll("[data-current-year]").forEach(function(node){node.textContent=String(new Date().getFullYear())});</script></body>');
  }
  return output;
}

function enforceBusinessIntegrity(html, business = {}) {
  let output = String(html || "");
  const digits = String(business.whatsapp || "").replace(/[^0-9]/g, "");
  const validWhatsApp = digits.length >= 10 && digits.length <= 15 && !/^0+$/.test(digits);

  // Mantém o arquivo autônomo, sem scripts ou folhas de estilo externas.
  output = output.replace(/<script\b(?=[^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*stylesheet)(?=[^>]*\bhref\s*=\s*["']https?:)[^>]*>/gi, "");
  output = output.replace(/@import\s+(?:url\()?\s*["']?https?:[^;]+;?/gi, "");

  // Nunca permite que a IA invente o canal de contato do cliente.
  output = output.replace(/<a\b([^>]*\bhref\s*=\s*["'](?:https?:\/\/(?:www\.)?wa\.me\/[^"']*|tel:[^"']*|mailto:[^"']*)["'][^>]*)>([\s\S]*?)<\/a>/gi,
    (whole, attrs, inner) => {
      const isWhatsApp = /wa\.me\//i.test(attrs);
      if (isWhatsApp && validWhatsApp) {
        const message = "Olá! Gostaria de saber mais sobre " + String(business.name || "seus serviços").slice(0, 80) + ".";
        return whole.replace(/href\s*=\s*["'][^"']*["']/i, 'href="https://wa.me/' + digits + '?text=' + encodeURIComponent(message) + '"');
      }
      return '<span class="contact-link-neutral">' + inner + '</span>';
    });

  if (validWhatsApp) {
    output = output.replace(/https?:\/\/(?:www\.)?wa\.me\/\d{6,20}(?:\?[^"'\s<>]*)?/gi, "https://wa.me/" + digits);
  }
  return output;
}

function qualityReport(quality) {
  const criticalPattern = /HTML com estrutura inválida|IDs duplicados|Links internos sem destino|Falta meta viewport|Falta um título principal h1|Contato contém e-mail|chamada sem ação funcional|WhatsApp fictício|WhatsApp informado pelo cliente precisa estar conectado|afirmações sobre equipe|afirmações comerciais específicas|afirmações não comprovadas|placeholder|instrução provisória|Formulário sem tratamento|Formulário bloqueia|Markdown visível|script externo|dependência externa/i;
  const majorPattern = /Poucas seções|Há seções demais|Seções superficiais|Profundidade editorial|Falta uma media query|adaptação responsiva|Galeria|Hero sem|direção de arte|composição|FAQ|Planos|modalidades|lista nav ul|menu móvel|Seção obrigatória|benefícios|manifesto|método|links sem destino/i;
  const criticalIssues = quality.issues.filter(issue => criticalPattern.test(issue));
  const majorIssues = quality.issues.filter(issue => majorPattern.test(issue) && !criticalPattern.test(issue));
  const minorIssues = quality.issues.filter(issue => !criticalPattern.test(issue) && !majorPattern.test(issue));
  const raw = 10 - criticalIssues.length * 1.35 - majorIssues.length * 0.55 - minorIssues.length * 0.25;
  const score = Math.max(0, Math.min(10, Math.round(raw * 10) / 10));
  const readyForClient = score >= 8 && criticalIssues.length === 0 && majorIssues.length <= 2;
  return {
    score,
    readyForClient,
    ratingLabel: readyForClient ? "Aprovado na verificação automática" : "Precisa de revisão antes de apresentar ao cliente",
    criticalCount: criticalIssues.length,
    majorCount: majorIssues.length,
    minorCount: minorIssues.length,
    criticalIssues,
    majorIssues,
    minorIssues
  };
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

    const visualBrief = segmentVisualBrief(business.type);
    const instructions = `Você é uma equipe sênior de design UX/UI, desenvolvimento front-end, conversão e SEO. Crie um site comercial realmente profissional, rico e personalizado para o negócio descrito, em português do Brasil. Entregue SOMENTE um documento HTML completo começando com <!doctype html>, com CSS dentro de <style> e JavaScript puro dentro de <script>. Tudo deve funcionar em um único arquivo, sem frameworks, bibliotecas externas, fontes externas ou scripts de terceiros. Não faça uma página genérica curta.

${visualBrief}

DIREÇÃO DE ARTE E QUALIDADE VISUAL OBRIGATÓRIA: aja como um estúdio digital profissional. Não entregue apenas wireframe ou coleção de cards. O resultado deve parecer um site comercial pronto para apresentação ao cliente, com identidade visual própria, composição forte e acabamento consistente. Escolha um conceito visual específico do segmento e mantenha consistência em cores, tipografia, formas, ícones e fotografia/ilustração. Não entregue template genérico. Crie ritmo de página com alternância de fundos, largura controlada, respiro generoso, hierarquia tipográfica expressiva, títulos fortes, textos escaneáveis e CTAs claros. HERO: layout assimétrico, título grande com quebra intencional, etiqueta curta e CTA principal. Use uma das fotografias exatas do bloco de segmento como imagem dominante do hero, com recorte editorial e tratamento visual premium; SVG/CSS é apenas detalhe complementar, nunca substitui a foto. Crie pelo menos DOIS momentos visuais memoráveis além do hero: mosaico assimétrico com quatro fotografias reais ilustrativas do segmento; faixa editorial de destaque; timeline desenhada; manifesto tipográfico ou composição especial de serviços. Não use a mesma grade de cartões em todas as seções. Não substitua fotografias por painéis SVG; use ilustrações vetoriais apenas como apoio visual. Use ícones SVG coerentes, estados hover/focus e microinterações discretas. Evite excesso de gradientes, emojis como ícones principais, sombras pesadas e bordas em todos os elementos. O resultado deve ter acabamento autoral e excelente adaptação a desktop e celular. Use prioritariamente as quatro URLs Unsplash selecionadas no bloco DIREÇÃO VISUAL ESPECÍFICA DO SEGMENTO como imagens reais ilustrativas no hero e na galeria; não substitua essas fotos por quatro SVGs esquemáticos. SVG/CSS pode complementar a direção de arte, não substituir as fotografias. NÃO use via.placeholder.com, placehold.co, placekitten.com, URLs inventadas ou imagens quebradas. Nunca use e-mail fictício como contato@nomedonegocio.com, contato@powerfit.com ou exemplo@example.com. Se não houver telefone/WhatsApp/e-mail real fornecido, não crie mailto, tel ou botão de contato falso: use uma chamada editorial neutra sem ação enganosa. Se houver WhatsApp informado, use exatamente esse número em https://wa.me/NUMERO. Se usar imagem remota, ela deve ser uma URL pública real e estável que você conheça; caso contrário, não use imagem remota. O resultado deve ser visualmente rico e excelente em desktop e celular. Não basta cumprir contagem de seções: nenhuma seção pode ser apenas um título e uma frase genérica. Desenvolva cada seção com um bloco informativo específico, exemplos de opções/etapas quando cabíveis e hierarquia visual própria. Em serviços/modalidades, mostre pelo menos três opções claramente distintas, cada uma com título, explicação específica e benefício possível sem prometer resultados. Não deixe a seção apenas com três nomes e frases vagas. O hero deve empilhar texto e arte no celular. A seção de contato sem dados confirmados deve ser um encerramento editorial profissional e atraente, com convite neutro para conhecer o negócio. Não escreva “a configurar”, “adicionar contato”, “canais serão adicionados” nem qualquer instrução técnica visível; não invente telefone, e-mail ou WhatsApp. Em telas pequenas, o menu deve abrir como painel vertical legível; a própria lista nav ul deve usar display:flex e flex-direction:column, com links empilhados, espaçamento de toque adequado, fundo sólido e z-index correto; nunca deixe links em linha espremida ou sobrepostos. O botão deve atualizar aria-expanded e aria-controls, fechar ao selecionar link e ao pressionar Escape. Inclua :focus-visible em links, botões e campos. PROIBIDO deixar retângulos pretos/cinzas vazios ou caixas que pareçam imagens ausentes: crie uma ilustração SVG/CSS completa dentro delas, ou remova o bloco e reorganize o layout. Nunca deixe navegação escondida no celular sem botão hambúrguer acessível e funcional. Não publique preços como R$ XXX,XX nem frases como 'unidade a definir'; se os dados faltarem, omita-os ou use um aviso de edição discreto que não pareça conteúdo final.

ESTRUTURA OBRIGATÓRIA: entregue de 8 a 12 elementos <section> reais, cada um com conteúdo útil e id único. Para academia, entregue EXATAMENTE 10 seções reais nesta ordem: hero, sobre, modalidades, benefícios, método/etapas, galeria visual, planos (sem inventar preços), manifesto/filosofia, FAQ e contato. Não omita, não funda e não substitua essas seções. Cada uma deve ter conteúdo desenvolvido e composição própria. Para outros segmentos, adapte a mesma profundidade ao negócio. Não conte header, footer ou div como seção. Não esconda seções com display:none. Cada seção deve ter composição própria e não repetir a mesma grade de cartões. Negócios visuais exigem galeria com pelo menos quatro fotografias reais ilustrativas do segmento, com recortes e proporções variadas, não apenas formas abstratas. Para academias, mostre cenas de treino e equipamentos; use alt que deixe claro que são imagens ilustrativas e não fotos comprovadas da unidade.

FUNCIONALIDADE E ACESSIBILIDADE: menu móvel realmente funcional, botão com aria-label e aria-expanded atualizado em cada abertura/fechamento; feche o menu ao clicar num link e ao pressionar Escape. Navegação por âncoras com scroll suave, mas respeite prefers-reduced-motion. FAQ com botões que atualizem aria-expanded e aria-controls, ou use details/summary nativo. Galeria/modal, se houver, deve ter botão de fechar acessível, aria-label apropriado, fechar com Escape e imagem com alt útil. Só crie formulário se houver destino real de envio fornecido ou integração disponível. Não invente endereços de e-mail, números de telefone, URLs de WhatsApp ou links de redes sociais para preencher a seção de contato. Caso contrário, NÃO crie formulário: crie uma seção de encerramento editorial com convite neutro e visual marcante, sem mencionar configuração, ausência de contato ou instruções técnicas, e sem campos nem botão de envio. Nunca use onsubmit="return false", botão que finge enviar, alertas de integração ou mensagens falsas de sucesso. Botões e links devem funcionar. Use foco visível, contraste adequado e HTML semântico. Inclua title, meta description, headings em ordem e textos alternativos úteis quando houver imagens.

INTEGRIDADE: não invente endereço, telefone, horários, preços, depoimentos, avaliações, certificações, números de clientes, instalações, equipamentos existentes, tecnologias, tamanho de equipe, experiência, credenciais, resultados ou alegações médicas. Diferencie ilustração conceitual de descrição factual: desenhar uma esteira não significa afirmar que a academia possui uma. Não transforme benefícios desejáveis em fatos existentes. Só apresente como fato o que estiver explicitamente nos dados fornecidos. Se a descrição do cliente disser “quero” ou “gostaria”, trate como desejo de projeto, não como característica já existente. Evite frases factuais como “temos equipamentos de última geração”, “nossa equipe é certificada” ou “garantimos resultados” sem comprovação. Use somente os dados fornecidos. Quando faltar endereço, telefone, horário, preço ou outra informação, omita o dado ou use frase neutra como “Consulte a equipe para mais informações”. Escreva textos atraentes sem inventar fatos: prefira convites, explicações gerais do serviço e benefícios apresentados como possibilidades, não promessas garantidas. NUNCA exiba colchetes, “a definir”, “inserir aqui”, instruções de edição ou placeholders no site final. Marque conteúdo demonstrativo como exemplo. Use o WhatsApp informado somente se válido, convertido para dígitos no link wa.me. Nunca inclua chaves de API, rastreadores, coleta oculta de dados ou scripts de terceiros. Não afirme que login, pagamentos, agendamento, banco de dados ou envio a servidores funcionam sem backend real; quando solicitados, crie apenas uma demonstração visual claramente identificada e indique o que precisa ser conectado.

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
          generationConfig: { temperature: 0.58, maxOutputTokens: 24000 }
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

    let html = enforceSegmentPhotography(enforceBusinessIntegrity(polishHtml(extractHtml(result)), business), business);
    if (!html || !/^<!doctype html/i.test(html) || !/<html[\s>]/i.test(html) || html.length < 500) {
      return json({ error: "A IA não retornou um HTML completo. Tente uma descrição mais específica." }, 502, origin);
    }

    let quality = inspectHtml(html, business);
    let repairAttempted = false;
    let repairApplied = false;
    for (let repairPass = 0; repairPass < 3 && quality.issues.length; repairPass++) {
      repairAttempted = true;
      const repairPrompt = [
        "Você é um estúdio digital sênior. REFAÇA o que estiver fraco, não maquie o HTML. O objetivo é um site comercial publicável, com direção de arte autoral, conteúdo confiável e acabamento de produto. Retorne SOMENTE um HTML completo válido começando com <!doctype html>.",
        "Esta é a tentativa de reconstrução " + (repairPass + 1) + " de 3. Corrija TODOS os problemas listados e faça uma revisão geral de qualidade. Não preserve componentes fracos só para manter o HTML anterior.",
        "",
        "DIREÇÃO DE ARTE: reconstrua como estúdio digital profissional. Antes de escrever, defina um conceito visual específico, uma paleta curta, uma escala tipográfica e uma composição própria. A primeira dobra deve ter impacto e hierarquia; alterne seções editoriais, mosaicos, faixas e listas visuais. Não repita o mesmo cartão em todas as seções. Cada seção deve parecer desenhada para este negócio, não um template trocando cores. Não use emoji como ícone principal, nem formas aleatórias para fingir fotografia. Use as quatro URLs de fotografia selecionadas no visualBrief como imagens ilustrativas reais no hero e na galeria; SVG/CSS complementa, mas não substitui essas fotos.",
        visualBrief,
        "SEÇÕES OBRIGATÓRIAS: para academia entregue exatamente 10 elementos <section> reais, nesta ordem: hero, sobre, modalidades, benefícios, método/etapas, galeria, planos, manifesto/filosofia, FAQ e contato. Não omita nem funda seções. Cada seção precisa ter conteúdo desenvolvido e id próprio. Para outros segmentos, entregue 8 a 12 seções úteis.",
        "SEGMENTO ACADEMIA: use linguagem visual esportiva premium e as quatro fotografias selecionadas no visualBrief dentro da galeria e uma delas no hero. As fotos são referências ilustrativas, não prova de que a academia possui os equipamentos ou espaços mostrados. Use alt descritivo e não invente instalações próprias.",
        "HERO: composição editorial assimétrica, título grande com quebra intencional, etiqueta curta, CTA destacado e uma das fotografias exatas do visualBrief como imagem principal. Use camadas, recortes, escala e profundidade; SVG inline pode complementar, mas não substituir a fotografia.",
        'O hero deve usar uma das quatro fotografias exatas do visualBrief. Se adicionar SVG, ele é apenas um detalhe complementar, não um requisito nem substituto da foto.',
        "GALERIA: crie quatro painéis fotográficos usando exatamente as quatro URLs do visualBrief, todas dentro da seção da galeria. Use object-fit:cover, aspect-ratio variado, recortes editoriais e legendas curtas. Cada img deve ter alt iniciando por 'Imagem ilustrativa'. Não substitua fotos por ícones, SVGs, círculos ou quadrados. Nunca use caixas vazias com rótulos.",
        'SVGs decorativos não contam como fotografias e não devem substituir os quatro painéis fotográficos exigidos.',
        "VARIEDADE: entre 9 e 12 seções úteis, com pelo menos seis seções realmente desenvolvidas (150+ caracteres de conteúdo útil cada, sem contar código SVG). Para academia, não omita benefícios, método/etapas e manifesto/filosofia da marca. Inclua pelo menos dois momentos visuais memoráveis além do hero: mosaico assimétrico, faixa editorial, timeline ou manifesto tipográfico. Evite repetir cartões iguais.",
        "CONTEÚDO: nenhuma seção pode ficar em título + frase genérica. Desenvolva serviços/modalidades com pelo menos três opções úteis e distintas, método com etapas claras e benefícios contextualizados. Na seção planos, crie no mínimo três cards HTML distintos (article), cada um com nome do plano, descrição e lista de itens; se o cliente não informou preços, escreva 'Consulte condições' sem inventar valores. Na FAQ, crie no mínimo cinco perguntas em details/summary, mas NÃO invente idade mínima, horários, regras de cancelamento, exigência de toalha, políticas ou condições operacionais. Se esses dados não foram fornecidos, faça perguntas neutras sobre conhecer serviços, escolher modalidade ou iniciar uma conversa.",
        "CONTATO: crie uma seção final com composição própria. Se houver WhatsApp no cadastro, use exatamente https://wa.me/ seguido dos dígitos fornecidos, com mensagem inicial contextual. Se não houver canal real, não invente e-mail, telefone, formulário ou botão; encerre com convite editorial sem ação enganosa. Nunca simule envio ou agendamento.",
        "RESPONSIVIDADE: se hero usar duas colunas no desktop, crie regra mobile explícita para empilhar texto e ilustração em uma coluna; revise grids e tipografia para telas estreitas. Não use minmax(300px, 1fr), min-width:300px ou larguras fixas em cards; prefira minmax(0,1fr) e minmax(min(100%, 16rem), 1fr).",
        'FOTOGRAFIA: confira se as quatro URLs da galeria correspondem exatamente ao segmento solicitado; não reutilize fotos de outro ramo comercial.',
        "ACABAMENTO: tipografia hierárquica, espaçamento generoso, grid consistente, contraste, ícones SVG coerentes, microinterações discretas e visual profissional em desktop e celular. Use pelo menos dois layouts de seção diferentes, planos em cards com destaque visual, galeria em mosaico e manifesto com composição tipográfica. Evite fundo escuro idêntico em todas as seções, cartões repetidos e textos genéricos como “transforme seu corpo” sem explicar como.",
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
          body: JSON.stringify({ contents: [{ parts: [{ text: repairPrompt }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 22000 } })
        });
        const repairResult = await repairResponse.json().catch(() => ({}));
        if (repairResponse.ok) {
          const candidate = enforceSegmentPhotography(enforceBusinessIntegrity(polishHtml(extractHtml(repairResult)), business), business);
          if (candidate && /^<!doctype html/i.test(candidate) && /<html[\s>]/i.test(candidate) && candidate.length >= 500) {
            const candidateQuality = inspectHtml(candidate, business);
            const weight = issue => /IDs duplicados|Links internos sem destino|Seções superficiais|Estrutura incompleta|Seção obrigatória ausente|Galeria da academia|afirmações sobre equipe|lista nav ul|Seção de modalidades|Contato ainda parece|Hero sem composição detalhada|adaptação responsiva comprovada/i.test(issue) ? 30 : 12;
            const score = q => q.issues.reduce((total, issue) => total + weight(issue), 0) + Math.max(0, 8 - q.sections) * 12 + Math.max(0, q.sections - 12) * 12;
            const originalScore = score(quality);
            const candidateScore = score(candidateQuality);
            // Só bloqueia falhas estruturais graves. Avisos editoriais/visuais continuam
            // sendo contabilizados, mas não devem descartar uma reconstrução claramente melhor.
            const criticalPatterns = /HTML com estrutura inválida|IDs duplicados|Links internos sem destino|Falta meta viewport|Falta um título principal h1|Poucas seções|Há seções demais|FAQ superficial|FAQ precisa de cinco perguntas|Planos sem hierarquia visual|três cards article reais|FAQ contém regras|chamada promete agendamento|Markdown visível|largura mínima rígida|Seções superficiais|Estrutura incompleta para academia|Estrutura de academia incorreta|dez seções da academia precisam seguir a ordem|Seção obrigatória ausente|lista nav ul|links da lista de navegação|Seção de modalidades\/serviços sem opções|Galeria incompleta ou esquemática|Galeria da academia não comprova|Hero sem composição detalhada|Contato contém e-mail ou domínio fictício|WhatsApp informado pelo cliente precisa estar conectado/;
            const candidateHasRequiredArt = !candidateQuality.issues.some(issue => /A galeria precisa de quatro painéis|Galeria sem quatro ilustrações|Galeria incompleta ou esquemática|Galeria incompleta: use pelo menos quatro fotografias|Remova SVGs esquemáticos da galeria|Galeria da academia não comprova|Hero sem composição detalhada/.test(issue));
            const candidateHasNoCriticalIssues = !candidateQuality.issues.some(issue => criticalPatterns.test(issue));
            const improvement = originalScore - candidateScore;
            // A reconstrução não deve ser descartada só porque a pontuação estática
            // empatou: a validação estrutural e visual é o critério decisivo.
            const candidateIsValid = candidateQuality.sections >= 8 &&
              candidateQuality.sections <= 12 &&
              candidateHasNoCriticalIssues &&
              candidateHasRequiredArt;
            const candidateImproves = improvement > 0 || candidateQuality.issues.length < quality.issues.length;
            // Mesmo uma reconstrução ainda imperfeita vira a base da segunda tentativa
            // quando melhora a anterior; não descartamos progresso parcial.
            if (candidateIsValid || candidateImproves) {
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
    const report = qualityReport(quality);
    return json({
      html,
      quality: { checked: true, autoRepairAttempted: repairAttempted, autoRepairApplied: repairApplied, repairStatus: !repairAttempted ? "not-needed" : repairApplied ? "applied" : "not-applied", sectionCount: quality.sections, warnings: quality.issues, ...report, note: "A nota mede verificações automáticas de estrutura, conteúdo e responsividade; a aparência final e os links devem ser conferidos na prévia." }
    }, 200, origin);
  }
};
