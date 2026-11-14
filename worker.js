const ALLOWED_ORIGIN = "https://angelalves-dev.github.io";

function corsHeaders(origin) {
  const headers = new Headers();
  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  headers.set("Content-Type", "application/json; charset=utf-8");
  return headers;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}



function inferBusinessType(business = {}, prompt = "") {
const n=v=>String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const supplied=n(business.type), text=n([prompt,business.name,business.tagline,business.offerings,business.description].join(" "));
const has=(...terms)=>terms.some(t=>text.includes(n(t)));
const explicitArchitecture=/\b(?:escritorio de arquitetura|arquiteto|arquiteta|projeto arquitetonico|arquitetura residencial|arquitetura comercial|studio de arquitetura)\b/.test(text);
if(explicitArchitecture)return {...business,type:"arquitetura",detectedType:"arquitetura",originalType:supplied||"não informado"};
if(has("clinica veterinaria","hospital veterinario","medicina veterinaria","medico veterinario","medica veterinaria","consulta veterinaria","saude animal")||supplied==="veterinaria")return {...business,type:"veterinaria",detectedType:"veterinaria",originalType:supplied||"não informado"};
if(has("fisioterapia","fisioterapeuta","reabilitacao fisica","reabilitacao motora","terapia manual","recuperacao de movimento")||supplied==="fisioterapia")return {...business,type:"fisioterapia",detectedType:"fisioterapia",originalType:supplied||"não informado"};
if(has("odontologia","odontologica","odontologico","dentista","consultorio odontologico","saude bucal","implante dentario","ortodontia")||supplied==="odontologia")return {...business,type:"odontologia",detectedType:"odontologia",originalType:supplied||"não informado"};
// Clínica de estética deve ser classificada como beleza antes do sinal genérico de clínica/saúde.
if(has("clinica de estetica","clinica estetica","estetica facial","estetica corporal","tratamentos esteticos","procedimentos esteticos","harmonizacao facial","limpeza de pele","design de sobrancelhas","depilacao a laser","spa estetico")||["estetica","clinica de estetica","clinica estetica"].includes(supplied))return {...business,type:"beleza",detectedType:"beleza",originalType:supplied||"não informado"};
const signals={academia:["academia","musculacao","treino","treinamento","fitness","halteres","esteira","crossfit","funcional"],restaurante:["restaurante","lanchonete","cardapio","comida","gastronomia","delivery","pizzaria","hamburgueria","chef","cozinha"],barbearia:["barbearia","barbeiro","corte masculino","barba"],beleza:["salao de beleza","cabeleireiro","manicure","estetica","unhas","maquiagem","cabeleireira","clinica de estetica","clinica estetica","estetica facial","estetica corporal","harmonizacao facial","limpeza de pele","depilacao a laser"],clinica:["clinica medica","consultorio medico","medico","medicina","saude","atendimento clinico","consultorio"],loja:["loja","roupas","vestuario","ecommerce","produtos","vitrine","moda"],petshop:["pet shop","petshop","banho e tosa","racao","acessorios pet","produtos para pets"],veterinaria:["veterinaria","veterinario","clinica veterinaria","hospital veterinario","medicina veterinaria","saude animal"],imobiliaria:["imobiliaria","imoveis","corretor","apartamentos","aluguel de imoveis"],fotografo:["fotografo","fotografia","ensaio fotografico","estudio fotografico"],arquitetura:["escritorio de arquitetura","arquiteto","arquiteta","projeto arquitetonico","arquitetura residencial","arquitetura comercial","design de interiores"],construcao:["construcao","construtora","reforma","engenharia","obra","empreiteira"],educacao:["curso","escola","educacao","aulas","professor","ensino","colegio"]};
const known=new Set(["academia","restaurante","barbearia","beleza","clinica","odontologia","fisioterapia","veterinaria","loja","petshop","imobiliaria","fotografo","construcao","arquitetura","educacao","servicos"]);
const scores=Object.entries(signals).map(([type,words])=>({type,score:words.reduce((x,w)=>x+(text.includes(n(w))?1:0),0)})).sort((a,b)=>b.score-a.score||(a.type===supplied?-1:b.type===supplied?1:a.type.localeCompare(b.type)));
const best=scores[0], ss=scores.find(x=>x.type===supplied)?.score||0, strong=/\b(escritorio de arquitetura|arquiteto|arquiteta|projeto arquitetonico|arquitetura residencial|arquitetura comercial)\b/.test(text);
if(known.has(supplied)&&supplied!=="servicos"){const conflict=best&&best.type!==supplied&&best.score>=Math.max(2,ss+1);if(!conflict||(best.type==="arquitetura"&&!strong))return {...business,type:supplied,detectedType:supplied,originalType:supplied};}
if(best&&best.score>=1&&(best.type!=="arquitetura"||strong||supplied==="arquitetura"))return {...business,type:best.type,detectedType:best.type,originalType:supplied||"não informado"};
return {...business,type:known.has(supplied)?supplied:"servicos",detectedType:known.has(supplied)?supplied:"servicos"};
}

function segmentVisualBrief(type) {
  const key = String(type || "servicos").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const profiles = {
    academia: ["photo-1534438327276-14e5300c3a48", "photo-1571019613454-1cb2f99b2d8b", "photo-1583454110551-21f2fa2afe61", "photo-1517836357463-d25dfeac3438", "photo-1534258936925-c58bed479fcb"],
    restaurante: ["photo-1517248135467-4c7edcad34c4", "photo-1414235077428-338989a2e8c0", "photo-1515003197210-e0cd7184f8b2", "photo-1559339352-11d035aa65de", "photo-1514933651103-005eec06c04b"],
    barbearia: ["photo-1503951914875-452162b0f3f1", "photo-1599351431202-1e0f0137899a", "photo-1621605815971-fbc98d665033", "photo-1622296089863-eb7fc530daa8", "photo-1593702295094-aea8c9c8f2d1"],
    beleza: ["photo-1560066984-138dadb4c035", "photo-1522337360788-8b13dee7a37e", "photo-1487412720507-e7ab37603c6f", "photo-1521590832167-7bcbfaa6381f", "photo-1516975080664-ed2fc6a32937"],
    clinica: ["photo-1559757175-0eb30cd8c063", "photo-1579684385127-1ef15d508118", "photo-1584515933487-779824d29309", "photo-1576091160550-2173dba999ef", "photo-1584820927498-cfe5211fd8bf"],
    odontologia: ["photo-1629909613654-28e377c37b09", "photo-1576091160399-112ba8d25d1d", "photo-1584982751601-97d4b6c8b6c5", "photo-1631815588090-d4bfec5b1ccb", "photo-1511174511562-5f7f18b874f8"],
    fisioterapia: ["photo-1571019613454-1cb2f99b2d8b", "photo-1581009146145-b5ef050c2e1e", "photo-1579758629938-03607ccdbaba", "photo-1517836357463-d25dfeac3438", "photo-1534438327276-14e5300c3a48"],
    veterinaria: ["photo-1628009368231-7bb7cfcb0def", "photo-1583337130417-3346a1be7dee", "photo-1543466835-00a7907e9de1", "photo-1552053831-71594a27632d", "photo-1516734212186-a967f81ad0d7"],
    loja: ["photo-1441986300917-64674bd600d8", "photo-1472851294608-062f824d29cc", "photo-1490481651871-ab68de25d43d", "photo-1523275335684-37898b6baf30", "photo-1490312278390-ab64016e0aa9"],
    petshop: ["photo-1548199973-03cce0bbc87b", "photo-1583337130417-3346a1be7dee", "photo-1543466835-00a7907e9de1", "photo-1552053831-71594a27632d", "photo-1516734212186-a967f81ad0d7"],
    imobiliaria: ["photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687920-4e2a09cf159d", "photo-1600607687644-c7171b42498f"],
    fotografo: ["photo-1452587925148-ce544e77e70d", "photo-1516035069371-29a1b244cc32", "photo-1492691527719-9d1e07e534b4", "photo-1500530855697-b586d89ba3ee", "photo-1542038784456-1ea8e935640e"],
    arquitetura: ["photo-1600210492486-724fe5c67fb0", "photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687920-4e2a09cf159d", "photo-1600607687644-c7171b42498f"],
    construcao: ["photo-1503387762-592deb58ef4e", "photo-1504307651254-35680f356dfd", "photo-1541888946425-d81bb19240f5", "photo-1487958449943-2429e8be8625", "photo-1511818966892-d7d671e672a2"],
    educacao: ["photo-1509062522246-3755977927d7", "photo-1523050854058-8df90110c9f1", "photo-1503676260728-1c00da094a0b", "photo-1522202176988-66273c2fd55f", "photo-1498243691581-b145c3f54a5a"],
    servicos: ["photo-1497366754035-f200968a6e72", "photo-1497366216548-37526070297c", "photo-1497366811353-6870744d04b2", "photo-1521737711867-e3b97375f902", "photo-1524758631624-e2822e304c36"]
  };
  const aliases = { "salao": "beleza", "salao de beleza": "beleza", "gym": "academia", "fitness": "academia", "musculacao": "academia", "academia de ginastica": "academia", "restaurante / lanchonete": "restaurante", "pet shop": "petshop", "pet-shop": "petshop", "clinica medica": "clinica", "clinica odontologica": "odontologia", "consultorio odontologico": "odontologia", "odontologia": "odontologia", "dentista": "odontologia", "fisioterapia": "fisioterapia", "clinica veterinaria": "veterinaria", "veterinaria": "veterinaria", "veterinario": "veterinaria", "loja virtual": "loja", "fotografia": "fotografo", "imoveis": "imobiliaria", "escritorio de arquitetura": "arquitetura", "design de interiores": "arquitetura" };
  const selected = aliases[key] || key;
  const ids = profiles[selected] || profiles.servicos;
  const urls = ids.map((id, index) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=" + (index === 0 ? "1500" : "900") + "&q=85");
  return [
    "DIREÇÃO VISUAL ESPECÍFICA DO SEGMENTO (" + selected + "):",
    "Priorize fotografia editorial real como base visual, não uma galeria de ícones ou quatro SVGs esquemáticos. URLs de fotografia pública selecionadas para este segmento:",
    ...urls.map((url, index) => (index + 1) + ". " + url),
    "Use a primeira imagem exclusivamente no hero e as quatro imagens seguintes, todas diferentes, exclusivamente nos quatro painéis da galeria. Não repita nenhuma fotografia entre hero e galeria nem dentro da galeria. Use object-fit:cover, proporções variadas, recortes editoriais e alt em português começando por 'Imagem ilustrativa'. Não afirme que as imagens mostram o estabelecimento, equipe ou clientes reais: são referências ilustrativas do segmento.",
    "Crie composição premium: hero com foto grande + título e CTA; mosaico com pelo menos quatro fotos; alterne seções editoriais, listas e faixas com fundos diferentes. Não force seção de planos para negócios que não vendem planos/assinaturas. Não invente depoimentos, avaliações, números ou resultados.",
    selected === "arquitetura" ? "DIREÇÃO DE ARQUITETURA: priorize fachadas residenciais contemporâneas, interiores, salas, cozinhas, materiais, iluminação e detalhes construtivos. Não use restaurantes, pratos, mesas de restaurante, bares ou imagens de gastronomia. A galeria deve representar referências visuais arquitetônicas, não alegar que são obras executadas pelo escritório." : selected === "odontologia" ? "DIREÇÃO DE ODONTOLOGIA: use consultório odontológico contemporâneo e saúde bucal humana; não use animais ou fisioterapia." : selected === "clinica" ? "DIREÇÃO DE CLÍNICA MÉDICA: use ambiente de saúde humana e consulta médica geral; não use cadeira odontológica, animais ou restaurantes." : selected === "beleza" ? "DIREÇÃO DE CLÍNICA DE ESTÉTICA E BELEZA: fotografia de cuidados faciais, pele, skincare, ambiente de estética elegante e detalhes de beleza; jamais use comida, restaurante, pratos, mesas ou imagens de gastronomia. Para clínicas de estética, adote paleta clara e sofisticada: branco, off-white, bege, nude e rosé suave, com dourado apenas como detalhe; evite roxo dominante, neon e visual de salão genérico. Não prometa resultados clínicos, não sugira procedimentos não confirmados e identifique todas as fotos como referências ilustrativas." : selected === "fisioterapia" ? "DIREÇÃO DE FISIOTERAPIA: mostre reabilitação do movimento, exercício terapêutico, mobilidade e recuperação funcional; não use odontologia, veterinária ou academia como foco." : selected === "veterinaria" ? "DIREÇÃO DE CLÍNICA VETERINÁRIA: mostre veterinário examinando cães ou gatos, cuidado animal e ambiente clínico veterinário; não use cadeira odontológica ou instrumentos dentários humanos." : ""
  ].join("\n");
}


function enforceSegmentPhotography(html, business = {}) {
  let output = String(html || "");
  const resolvedType = inferBusinessType(business, business.userBrief || "").type;
  const key = String(resolvedType || "servicos").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const profiles = {
    academia: ["photo-1534438327276-14e5300c3a48", "photo-1571019613454-1cb2f99b2d8b", "photo-1583454110551-21f2fa2afe61", "photo-1517836357463-d25dfeac3438", "photo-1534258936925-c58bed479fcb"],
    restaurante: ["photo-1517248135467-4c7edcad34c4", "photo-1414235077428-338989a2e8c0", "photo-1515003197210-e0cd7184f8b2", "photo-1559339352-11d035aa65de", "photo-1514933651103-005eec06c04b"],
    barbearia: ["photo-1503951914875-452162b0f3f1", "photo-1599351431202-1e0f0137899a", "photo-1621605815971-fbc98d665033", "photo-1622296089863-eb7fc530daa8", "photo-1593702295094-aea8c9c8f2d1"],
    beleza: ["photo-1560066984-138dadb4c035", "photo-1522337360788-8b13dee7a37e", "photo-1487412720507-e7ab37603c6f", "photo-1521590832167-7bcbfaa6381f", "photo-1516975080664-ed2fc6a32937"],
    clinica: ["photo-1559757175-0eb30cd8c063", "photo-1579684385127-1ef15d508118", "photo-1584515933487-779824d29309", "photo-1576091160550-2173dba999ef", "photo-1584820927498-cfe5211fd8bf"],
    odontologia: ["photo-1629909613654-28e377c37b09", "photo-1576091160399-112ba8d25d1d", "photo-1584982751601-97d4b6c8b6c5", "photo-1631815588090-d4bfec5b1ccb", "photo-1511174511562-5f7f18b874f8"],
    fisioterapia: ["photo-1571019613454-1cb2f99b2d8b", "photo-1581009146145-b5ef050c2e1e", "photo-1579758629938-03607ccdbaba", "photo-1517836357463-d25dfeac3438", "photo-1534438327276-14e5300c3a48"],
    veterinaria: ["photo-1628009368231-7bb7cfcb0def", "photo-1583337130417-3346a1be7dee", "photo-1543466835-00a7907e9de1", "photo-1552053831-71594a27632d", "photo-1516734212186-a967f81ad0d7"],
    loja: ["photo-1441986300917-64674bd600d8", "photo-1472851294608-062f824d29cc", "photo-1490481651871-ab68de25d43d", "photo-1523275335684-37898b6baf30", "photo-1490312278390-ab64016e0aa9"],
    petshop: ["photo-1548199973-03cce0bbc87b", "photo-1583337130417-3346a1be7dee", "photo-1543466835-00a7907e9de1", "photo-1552053831-71594a27632d", "photo-1516734212186-a967f81ad0d7"],
    imobiliaria: ["photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687920-4e2a09cf159d", "photo-1600607687644-c7171b42498f"],
    fotografo: ["photo-1452587925148-ce544e77e70d", "photo-1516035069371-29a1b244cc32", "photo-1492691527719-9d1e07e534b4", "photo-1500530855697-b586d89ba3ee", "photo-1542038784456-1ea8e935640e"],
    arquitetura: ["photo-1600210492486-724fe5c67fb0", "photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687920-4e2a09cf159d", "photo-1600607687644-c7171b42498f"],
    construcao: ["photo-1503387762-592deb58ef4e", "photo-1504307651254-35680f356dfd", "photo-1541888946425-d81bb19240f5", "photo-1487958449943-2429e8be8625", "photo-1511818966892-d7d671e672a2"],
    educacao: ["photo-1509062522246-3755977927d7", "photo-1523050854058-8df90110c9f1", "photo-1503676260728-1c00da094a0b", "photo-1522202176988-66273c2fd55f", "photo-1498243691581-b145c3f54a5a"],
    servicos: ["photo-1497366754035-f200968a6e72", "photo-1497366216548-37526070297c", "photo-1497366811353-6870744d04b2", "photo-1521737711867-e3b97375f902", "photo-1524758631624-e2822e304c36"]
  };
  const aliases = { "gym": "academia", "fitness": "academia", "musculacao": "academia", "academia de ginastica": "academia", "restaurante / lanchonete": "restaurante", "pet shop": "petshop", "salao": "beleza", "salao de beleza": "beleza", "clinica odontologica": "odontologia", "consultorio odontologico": "odontologia", "odontologia": "odontologia", "dentista": "odontologia", "fisioterapia": "fisioterapia", "clinica veterinaria": "veterinaria", "veterinaria": "veterinaria", "veterinario": "veterinaria", "escritorio de arquitetura": "arquitetura", "design de interiores": "arquitetura" };
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
  const heroRe = /<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"']*\bhero\b))[^>]*>[\s\S]*?<\/section>/i;
  output = output.replace(heroRe, section => {
    let found = false;
    section = section.replace(/<img\b[^>]*>/i, tag => {
      found = true;
      return replaceImage(tag, makeUrl(ids[0], 0), "Imagem ilustrativa do segmento " + selected, true);
    });
    if (!found) {
      const image = '<img src="' + makeUrl(ids[0], 0) + '" alt="Imagem ilustrativa do segmento ' + selected + '" loading="eager" decoding="async" style="width:100%;height:100%;object-fit:cover">';
      section = section.replace(/<\/section>/i, image + "</section>");
    }
    return section;
  });
  const galleryRe = /<section\b(?=[^>]*(?:\bid=["'](?:galeria|gallery|estrutura)["']|\bclass=["'][^"']*(?:galeria|gallery|portfolio)[^"']*["']))[^>]*>[\s\S]*?<\/section>/i;
  const galleryMatch = output.match(galleryRe);
  const galleryHeading = galleryMatch
    ? ((galleryMatch[0].match(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/i) || [])[1] || "Espaço")
        .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : "Conheça nosso espaço";
  const galleryOpening = galleryMatch ? galleryMatch[0].match(/^<section\b[^>]*>/i)[0] : '<section id="galeria">';
  const galleryId = (galleryOpening.match(/\bid=["']([^"']+)["']/i) || [])[1] || "galeria";
  const safeHeading = galleryHeading.replace(/[<>]/g, "").slice(0, 90) || "Galeria";
  const galleryMarkup = '<section id="' + galleryId + '" class="criasite-gallery-section">' +
    '<div class="container criasite-gallery-wrap"><h2>' + safeHeading + '</h2>' +
    '<div class="criasite-gallery" aria-label="Galeria de imagens ilustrativas">' +
    ids.slice(1, 5).map((id, i) =>
      '<figure class="criasite-gallery__item criasite-gallery__item--' + (i + 1) + '">' +
      '<img src="' + makeUrl(id, i + 1) + '" alt="' + (selected === "arquitetura" ? ["Fachada residencial contemporânea, referência arquitetônica ilustrativa", "Sala de estar com composição de interiores, referência ilustrativa", "Ambiente interno com materiais e iluminação, referência ilustrativa", "Detalhe de projeto arquitetônico e acabamentos, referência ilustrativa"][i] : selected === "odontologia" ? ["Consultório odontológico ilustrativo", "Atendimento odontológico ilustrativo", "Equipamento de cuidado bucal ilustrativo", "Ambiente de saúde bucal ilustrativo"][i] : selected === "fisioterapia" ? ["Sessão de fisioterapia e reabilitação do movimento ilustrativa", "Exercício terapêutico orientado ilustrativo", "Prática de mobilidade e alongamento ilustrativa", "Atividade de recuperação funcional ilustrativa"][i] : selected === "veterinaria" ? ["Consulta veterinária com animal de estimação ilustrativa", "Cuidado veterinário de cão ilustrativo", "Animal em contexto de saúde veterinária ilustrativo", "Atendimento clínico veterinário ilustrativo"][i] : selected === "clinica" ? ["Ambiente de atendimento médico ilustrativo", "Consulta de saúde humana ilustrativa", "Espaço clínico contemporâneo ilustrativo", "Cuidado em saúde ilustrativo"][i] : selected === "petshop" ? ["Cães em atividade ao ar livre, fotografia ilustrativa", "Cão recebendo cuidados, fotografia ilustrativa", "Retrato de cão, fotografia ilustrativa", "Animal de estimação em ambiente externo, fotografia ilustrativa"][i] : "Fotografia ilustrativa de " + selected + ", cena " + (i + 1)) + '" loading="lazy" decoding="async">' +
      '</figure>'
    ).join("") +
    '</div><p class="criasite-gallery__note">Imagens ilustrativas do segmento.</p></div></section>';
  if (galleryMatch) output = output.replace(galleryRe, galleryMarkup);
  else {
    const contactStart = output.search(/<section\b[^>]*\bid=["']contato["'][^>]*>/i);
    if (contactStart >= 0) output = output.slice(0, contactStart) + galleryMarkup + output.slice(contactStart);
    else output = output.replace(/<\/body>/i, galleryMarkup + "</body>");
  }
  if (selected === "arquitetura") {
    const referenceRe = /<section\b(?=[^>]*\bid=["'](?:referencias|referências|portfolio|projetos)["'])[^>]*>[\s\S]*?<\/section>/i;
    output = output.replace(referenceRe, section => {
      const opening = section.match(/^<section\b[^>]*>/i)?.[0] || '<section id="referencias">';
      const id = (opening.match(/\bid=["']([^"']+)["']/i) || [,"referencias"])[1];
      return '<section id="' + id + '" class="criasite-reference-section"><div class="criasite-reference-wrap">' +
        '<p class="criasite-eyebrow">LINGUAGEM ARQUITETÔNICA</p>' +
        '<h2>Referências de projeto</h2>' +
        '<p class="criasite-reference-intro">Princípios visuais e espaciais que podem orientar um projeto. Os itens abaixo são referências conceituais, não obras executadas pelo escritório.</p>' +
        '<div class="criasite-reference-grid">' +
        '<article><span>01</span><h3>Fachadas e volumetria</h3><p>Composição de volumes, proporção, relação com a luz e integração com o entorno.</p></article>' +
        '<article><span>02</span><h3>Interiores e circulação</h3><p>Organização dos ambientes, fluidez dos percursos e equilíbrio entre função e conforto.</p></article>' +
        '<article><span>03</span><h3>Materiais e iluminação</h3><p>Texturas, acabamentos e luz como elementos de unidade visual e identidade espacial.</p></article>' +
        '</div></div></section>';
    });
  }
  const galleryCss = "/* CriaSite: mosaico editorial consistente e responsivo */\n" +
    ".criasite-gallery-section{padding:clamp(3.5rem,7vw,6rem) 0;overflow:hidden}\n" +
    ".criasite-gallery-wrap{width:min(1100px,calc(100% - 40px));margin-inline:auto}\n" +
    ".criasite-gallery{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);grid-template-rows:repeat(3,minmax(150px,1fr));gap:12px;min-height:590px}\n" +
    ".criasite-gallery__item{position:relative;min-width:0;min-height:0;margin:0;overflow:hidden;border-radius:14px;background:#e9e9e9}\n" +
    ".criasite-gallery__item--1{grid-column:1;grid-row:1/4}\n" +
    ".criasite-gallery__item--2{grid-column:2;grid-row:1}\n" +
    ".criasite-gallery__item--3{grid-column:2;grid-row:2}\n" +
    ".criasite-gallery__item--4{grid-column:2;grid-row:3}\n" +
    ".criasite-gallery__item img{display:block;width:100%;height:100%;min-height:0;object-fit:cover;transition:transform .65s cubic-bezier(.2,.7,.2,1)}\n" +
    ".criasite-gallery__item:hover img{transform:scale(1.035)}\n" +
    ".criasite-gallery__note{margin-top:12px;font-size:.78rem;opacity:.65}\n" +
    "@media(max-width:700px){.criasite-gallery{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:auto;min-height:0;gap:9px}.criasite-gallery__item{aspect-ratio:4/3;min-height:0}.criasite-gallery__item--1{grid-column:1/-1;grid-row:auto;aspect-ratio:16/10}.criasite-gallery__item--2,.criasite-gallery__item--3,.criasite-gallery__item--4{grid-column:auto;grid-row:auto}}\n" +
    "@media(max-width:420px){.criasite-gallery{grid-template-columns:minmax(0,1fr)}.criasite-gallery__item--1,.criasite-gallery__item--2,.criasite-gallery__item--3,.criasite-gallery__item--4{grid-column:1;aspect-ratio:16/10}}\n" +
    "@media(prefers-reduced-motion:reduce){.criasite-gallery__item img{transition:none}}\n";
  if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(output)) output = output.replace(/<\/style>/i, galleryCss + "\n</style>");
  else output = output.replace(/<\/head>/i, "<style>" + galleryCss + "</style></head>");
  if (selected === "arquitetura") {
    const referenceCss = ".criasite-reference-section{padding:clamp(3rem,7vw,6rem) 0;background:#f5f1eb;color:#292722}.criasite-reference-wrap{width:min(1100px,calc(100% - 40px));margin:auto}.criasite-eyebrow{font-size:.72rem;letter-spacing:.16em;font-weight:700;color:#9a704c;margin-bottom:1rem}.criasite-reference-intro{max-width:650px;margin-bottom:2rem;color:#68635c}.criasite-reference-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.criasite-reference-grid article{padding:1.5rem;border:1px solid #d9d0c4;background:#fff;min-height:190px}.criasite-reference-grid article span{color:#9a704c;font-size:.75rem;letter-spacing:.12em}.criasite-reference-grid h3{margin:1rem 0 .5rem;font-size:1.15rem}.criasite-reference-grid p{font-size:.92rem;color:#68635c}@media(max-width:700px){.criasite-reference-grid{grid-template-columns:1fr}}";
    if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(output)) output = output.replace(/<\/style>/i, referenceCss + "\n</style>");
    else output = output.replace(/<\/head>/i, "<style>" + referenceCss + "</style></head>");
  }
  return output;
}


function enforceArchitectureFinalPolish(html, business = {}) {
  let output = String(html || "");
  const resolved = inferBusinessType(business, business.userBrief || "").type;
  if (resolved !== "arquitetura") return output;

  const colorMap = {
    "#6f42c1":"#9a704c","#7c3aed":"#9a704c","#8b5cf6":"#b18a67",
    "#a855f7":"#b18a67","#9333ea":"#9a704c","#6d28d9":"#76563b",
    "#5b21b6":"#76563b","#4c1d95":"#292722","#7e22ce":"#9a704c",
    "#a78bfa":"#c9b49d","#c4b5fd":"#ded3c5","#ddd6fe":"#e9e1d7",
    "#f3e8ff":"#f5f1eb","#ede9fe":"#eee8df","#e9d5ff":"#e6ddd1",
    "#faf5ff":"#f7f5f0","#f5f3ff":"#f7f5f0"
  };
  for (const [from, to] of Object.entries(colorMap)) {
    output = output.replace(new RegExp(from.replace("#","\\#"), "gi"), to);
  }
  output = output.replace(/\b(?:purple|violet)\b/gi, "copper");
  output = output.replace(/hsl\(\s*(?:25[0-9]|26[0-9]|27[0-9]|28[0-9]|29[0-9]|3[0-1][0-9])\s*,\s*([^)]*)\)/gi, "hsl(28, 24%, 46%)");

  const serviceRe = /<section\b(?=[^>]*\bid=["'](?:servicos|serviços|services)["'])[^>]*>[\s\S]*?<\/section>/i;
  if (serviceRe.test(output)) {
    output = output.replace(serviceRe, section => {
      const opening = section.match(/^<section\b[^>]*>/i)?.[0] || '<section id="servicos">';
      const id = (opening.match(/\bid=["']([^"']+)["']/i) || [,"servicos"])[1];
      return '<section id="' + id + '" class="criasite-architecture-scope"><div class="criasite-architecture-wrap">' +
        '<p class="criasite-architecture-kicker">PENSAMENTO E PROCESSO</p>' +
        '<h2>Um projeto começa pelas perguntas certas</h2>' +
        '<p class="criasite-architecture-lead">Cada espaço tem contexto, limites e possibilidades próprios. Estas frentes apresentam temas que podem ser explorados durante a conversa inicial — o escopo efetivamente oferecido deve ser confirmado pelo escritório.</p>' +
        '<div class="criasite-architecture-services">' +
        '<article><span>01</span><h3>Leitura do espaço</h3><p>Observar dimensões, luz natural, circulação, necessidades de uso e relação com o entorno antes de propor soluções.</p></article>' +
        '<article><span>02</span><h3>Estudo de possibilidades</h3><p>Comparar alternativas de organização, volumetria, materiais e linguagem visual considerando as prioridades do projeto.</p></article>' +
        '<article><span>03</span><h3>Coerência nos detalhes</h3><p>Conectar escolhas funcionais e estéticas para que ambientes, acabamentos e iluminação formem uma solução integrada.</p></article>' +
        '</div><p class="criasite-architecture-disclaimer">Conteúdo informativo: confirme diretamente com o escritório quais serviços e etapas fazem parte de sua atuação.</p>' +
        '</div></section>';
    });
  }

  const refRe = /<section\b(?=[^>]*\bid=["'](?:referencias|referências|portfolio|projetos)["'])[^>]*>[\s\S]*?<\/section>/i;
  if (refRe.test(output)) {
    output = output.replace(refRe, section => {
      const opening = section.match(/^<section\b[^>]*>/i)?.[0] || '<section id="referencias">';
      const id = (opening.match(/\bid=["']([^"']+)["']/i) || [,"referencias"])[1];
      return '<section id="' + id + '" class="criasite-reference-section"><div class="criasite-reference-wrap">' +
        '<p class="criasite-eyebrow">LINGUAGEM ARQUITETÔNICA</p><h2>Referências e princípios de projeto</h2>' +
        '<p class="criasite-reference-intro">Um repertório de ideias para orientar conversas e estudos. Os itens abaixo são referências conceituais, não projetos executados ou clientes do escritório.</p>' +
        '<div class="criasite-reference-grid">' +
        '<article><span>01 / ESPAÇO</span><h3>Fachadas e volumetria</h3><p>Proporção, ritmo, escala e relação entre a construção e seu entorno.</p></article>' +
        '<article><span>02 / EXPERIÊNCIA</span><h3>Interiores e circulação</h3><p>Fluxos, ergonomia, luz e organização dos ambientes a partir dos usos previstos.</p></article>' +
        '<article><span>03 / MATÉRIA</span><h3>Materiais e iluminação</h3><p>Texturas, desempenho, manutenção e temperatura visual como parte da identidade do espaço.</p></article>' +
        '</div></div></section>';
    });
  }

  // Protege o conteúdo contra promessas comerciais não confirmadas.
  const faqRe = /<section\b(?=[^>]*\bid=["']faq["'])[^>]*>[\s\S]*?<\/section>/i;
  if (faqRe.test(output)) {
    output = output.replace(faqRe, () =>
      '<section id="faq" class="criasite-architecture-faq">' +
      '<p class="criasite-architecture-kicker">DÚVIDAS INICIAIS</p><h2>Perguntas para orientar a conversa</h2>' +
      '<details><summary>Como começa a definição de um projeto?</summary><p>O primeiro passo é reunir informações sobre o espaço, as necessidades, as prioridades e as condições do projeto.</p></details>' +
      '<details><summary>Quais informações devo preparar?</summary><p>Se possível, reúna medidas disponíveis, fotografias do local, referências visuais e uma descrição do que deseja resolver.</p></details>' +
      '<details><summary>O escritório atende reformas?</summary><p>O atendimento a reformas precisa ser confirmado diretamente com o Studio Forma.</p></details>' +
      '<details><summary>Quais serviços estão disponíveis?</summary><p>O escopo de serviços, as etapas incluídas e as entregas devem ser confirmados em uma conversa com o escritório.</p></details>' +
      '<details><summary>Qual é o prazo de desenvolvimento?</summary><p>O prazo depende do escopo, da complexidade e das informações necessárias. Solicite uma estimativa antes de iniciar.</p></details>' +
      '<details><summary>Como solicitar uma proposta?</summary><p>Utilize os canais oficiais do escritório depois que telefone, WhatsApp ou e-mail forem informados nesta página.</p></details></section>'
    );
  }

  const differentiatorsRe = /<section\b(?=[^>]*\bid=["']diferenciais["'])[^>]*>[\s\S]*?<\/section>/i;
  if (differentiatorsRe.test(output)) {
    output = output.replace(differentiatorsRe, () =>
      '<section id="diferenciais" class="criasite-architecture-principles">' +
      '<p class="criasite-architecture-kicker">CRITÉRIOS DE PROJETO</p><h2>O que observar em uma boa solução</h2>' +
      '<div class="criasite-architecture-services">' +
      '<article><span>01</span><h3>Clareza</h3><p>Organizar prioridades, necessidades e limites antes de escolher uma direção.</p></article>' +
      '<article><span>02</span><h3>Contexto</h3><p>Considerar o local, a incidência de luz, a circulação e a relação com o entorno.</p></article>' +
      '<article><span>03</span><h3>Coerência</h3><p>Buscar equilíbrio entre uso, materiais, conforto e expressão visual.</p></article>' +
      '</div><p class="criasite-architecture-disclaimer">Princípios conceituais; não representam certificações, resultados ou diferenciais comerciais comprovados.</p></section>'
    );
  }

  const contactRe = /<section\b(?=[^>]*\bid=["']contato["'])[^>]*>[\s\S]*?<\/section>/i;
  if (contactRe.test(output)) {
    output = output.replace(contactRe, section => {
      const verified = /https?:\/\/(?:www\.)?wa\.me\/[0-9]{10,15}|mailto:[^"'\s<>]+|tel:[^"'\s<>]+/i.test(section);
      if (verified) return section;
      return '<section id="contato" class="criasite-architecture-contact">' +
        '<p class="criasite-architecture-kicker">PRÓXIMO PASSO</p><h2>Vamos conversar sobre seu espaço?</h2>' +
        '<p>Os dados de contato oficiais ainda precisam ser adicionados pelo responsável pelo escritório antes da publicação.</p>' +
        '<p class="criasite-architecture-disclaimer">Inclua somente um telefone, WhatsApp ou e-mail confirmado. Nenhum canal foi inventado nesta demonstração.</p></section>';
    });
  }

  // Evita dois botões concorrentes no hero: mantém uma chamada principal.
  const heroFinalRe = /<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"]*\bhero\b))[^>]*>[\s\S]*?<\/section>/i;
  if (heroFinalRe.test(output)) {
    output = output.replace(heroFinalRe, hero => {
      hero = hero.replace(/<a\b[^>]*class=["'][^"']*criasite-architecture-hero-cta[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "");
      const first = hero.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
      if (first) {
        let attrs = first[1].replace(/\sclass=["'][^"']*["']/i, "").replace(/\shref=["'][^"']*["']/i, "");
        hero = hero.replace(first[0], '<a' + attrs + ' class="criasite-architecture-hero-cta" href="#servicos">' + first[2] + '</a>');
        return hero;
      }
      return hero.replace(/<\/section>/i, '<a class="criasite-architecture-hero-cta" href="#servicos">Conheça o processo</a></section>');
    });
  }

  // Normaliza seções mesmo quando a IA usa IDs ou títulos alternativos.
  const replaceArchitectureSection = (source, idPattern, headingPattern, replacement) => {
    let replaced = false;
    const result = source.replace(/<section\b[^>]*>[\s\S]*?<\/section>/gi, section => {
      if (replaced) return section;
      const opening = section.match(/^<section\b[^>]*>/i)?.[0] || "";
      const id = (opening.match(/\bid=["']([^"']+)["']/i) || [,""])[1];
      const heading = ((section.match(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i) || [,""])[1] || "")
        .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
      if ((idPattern && idPattern.test(id)) || (headingPattern && headingPattern.test(heading))) {
        replaced = true;
        return replacement;
      }
      return section;
    });
    return { html: result, replaced };
  };

  const servicesMarkup = '<section id="servicos" class="criasite-architecture-scope"><div class="criasite-architecture-wrap">' +
    '<p class="criasite-architecture-kicker">POSSIBILIDADES DE PROJETO</p><h2>Um espaço pensado a partir da sua realidade</h2>' +
    '<p class="criasite-architecture-lead">Antes de definir soluções, é importante compreender o local, as prioridades e o que precisa funcionar melhor no dia a dia. Os tópicos abaixo são frentes de reflexão, não uma lista de serviços confirmados.</p>' +
    '<div class="criasite-architecture-services">' +
    '<article><span>01 / CONTEXTO</span><h3>Leitura do espaço</h3><p>Observar dimensões, iluminação natural, circulação, acessos e relação com o entorno para entender as condições existentes.</p></article>' +
    '<article><span>02 / ALTERNATIVAS</span><h3>Estudo de possibilidades</h3><p>Comparar caminhos de organização, volumetria, materiais e linguagem visual de acordo com as necessidades apresentadas.</p></article>' +
    '<article><span>03 / DECISÕES</span><h3>Coerência nos detalhes</h3><p>Considerar uso, conforto, manutenção e expressão estética em conjunto, evitando decisões isoladas do contexto.</p></article>' +
    '</div><p class="criasite-architecture-disclaimer">A contratação, o escopo e as entregas disponíveis devem ser confirmados diretamente com o escritório.</p></div></section>';

  const processMarkup = '<section id="processo" class="criasite-architecture-scope"><div class="criasite-architecture-wrap">' +
    '<p class="criasite-architecture-kicker">ETAPAS DE DESENVOLVIMENTO</p><h2>Da compreensão do espaço às decisões do projeto</h2>' +
    '<div class="criasite-architecture-services">' +
    '<article><span>ETAPA 01</span><h3>Escuta e levantamento</h3><p>Reunir objetivos, referências, medidas disponíveis, condicionantes do local e prioridades para estabelecer um ponto de partida claro.</p></article>' +
    '<article><span>ETAPA 02</span><h3>Estudos e escolhas</h3><p>Organizar alternativas espaciais e discutir proporções, circulação, iluminação e materiais conforme o contexto apresentado.</p></article>' +
    '<article><span>ETAPA 03</span><h3>Definição do escopo</h3><p>Alinhar quais desenhos, documentos, detalhamentos e etapas poderão fazer parte da proposta antes de qualquer contratação.</p></article>' +
    '</div><p class="criasite-architecture-disclaimer">As etapas efetivas, os documentos entregues e os prazos variam conforme o escopo contratado e precisam ser confirmados.</p></div></section>';

  const referencesMarkup = '<section id="referencias" class="criasite-reference-section"><div class="criasite-reference-wrap">' +
    '<p class="criasite-eyebrow">REPERTÓRIO VISUAL</p><h2>Referências para explorar possibilidades</h2>' +
    '<p class="criasite-reference-intro">Uma seleção de temas que pode orientar conversas sobre linguagem, uso e atmosfera. Esta seção é conceitual e não apresenta obras executadas ou clientes do escritório.</p>' +
    '<div class="criasite-reference-grid">' +
    '<article><span>01 / VOLUMETRIA</span><h3>Fachadas e proporção</h3><p>Relação entre cheios e vazios, escala, ritmo e integração visual com o entorno.</p></article>' +
    '<article><span>02 / EXPERIÊNCIA</span><h3>Interiores e circulação</h3><p>Organização dos ambientes, percursos, ergonomia e aproveitamento da luz natural.</p></article>' +
    '<article><span>03 / MATERIALIDADE</span><h3>Texturas e iluminação</h3><p>Combinação de superfícies, tonalidades e luz para construir uma atmosfera coerente.</p></article>' +
    '</div><p class="criasite-architecture-disclaimer">Referências conceituais ilustrativas; não representam portfólio de projetos realizados.</p></div></section>';

  const principlesMarkup = '<section id="principios" class="criasite-architecture-principles"><div class="criasite-architecture-wrap">' +
    '<p class="criasite-architecture-kicker">PRINCÍPIOS DE PROJETO</p><h2>Critérios que ajudam a orientar boas decisões</h2>' +
    '<div class="criasite-architecture-services">' +
    '<article><span>01</span><h3>Clareza</h3><p>Definir prioridades, necessidades e limites antes de escolher uma direção de projeto.</p></article>' +
    '<article><span>02</span><h3>Contexto</h3><p>Considerar o local, a incidência de luz, a circulação e a relação entre os ambientes.</p></article>' +
    '<article><span>03</span><h3>Coerência</h3><p>Buscar equilíbrio entre funcionalidade, conforto, materiais e expressão visual.</p></article>' +
    '</div><p class="criasite-architecture-disclaimer">Princípios conceituais; não representam certificações, resultados ou diferenciais comerciais comprovados.</p></div></section>';

  let normalized = replaceArchitectureSection(output, /^processo$/i, /processo de projeto|etapas do projeto/i, processMarkup);
  output = normalized.html;
  normalized = replaceArchitectureSection(output, /^(?:referencias|referências|portfolio|projetos)$/i, /refer[eê]ncias conceituais|portf[oó]lio|projetos realizados/i, referencesMarkup);
  output = normalized.html;
  normalized = replaceArchitectureSection(output, /^(?:principios|princípios|criterios|critérios|diferenciais)$/i, /princ[ií]pios|crit[eé]rios de qualidade|diferenciais/i, principlesMarkup);
  output = normalized.html;

  if (!/<section\b(?=[^>]*\bid=["']servicos["'])/i.test(output)) {
    const aboutRe = /(<section\b(?=[^>]*\bid=["']sobre["'])[^>]*>[\s\S]*?<\/section>)/i;
    if (aboutRe.test(output)) output = output.replace(aboutRe, "$1" + servicesMarkup);
    else output = output.replace(/<main\b[^>]*>/i, match => match + servicesMarkup);
  }
  if (!/<section\b(?=[^>]*\bid=["']processo["'])/i.test(output)) {
    output = output.replace(/(<section\b(?=[^>]*\bid=["']servicos["'])[^>]*>[\s\S]*?<\/section>)/i, "$1" + processMarkup);
  }
  if (!/<section\b(?=[^>]*\bid=["']principios["'])/i.test(output)) {
    const refSectionRe = /(<section\b(?=[^>]*\bid=["']referencias["'])[^>]*>[\s\S]*?<\/section>)/i;
    if (refSectionRe.test(output)) output = output.replace(refSectionRe, "$1" + principlesMarkup);
    else output = output.replace(/<\/main>/i, principlesMarkup + "</main>");
  }

  const heroSectionRe = /<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"]*\bhero\b))[^>]*>[\s\S]*?<\/section>/i;
  output = output.replace(heroSectionRe, hero => hero.replace(/(<a\b[^>]*class=["'][^"']*criasite-architecture-hero-cta[^"']*["'][^>]*href=["'])#[^"']*(["'][^>]*>)/i, "$1#servicos$2"));
  output = output.replace(
    /document\.querySelector\(this\.getAttribute\('href'\)\)\.scrollIntoView\(\s*\{\s*behavior:\s*'smooth'\s*\}\s*\);/g,
    "var target=document.querySelector(this.getAttribute('href'));if(target){target.scrollIntoView({behavior:'smooth'});}"
  );

  const css = [
    ":root{--cs-ink:#292722;--cs-paper:#f7f5f0;--cs-sand:#e9e1d7;--cs-copper:#9a704c;--cs-muted:#68635c}",
    "body{color:var(--cs-ink)}",
    ".criasite-architecture-scope{padding:clamp(3.5rem,7vw,6rem) 0;background:var(--cs-paper);color:var(--cs-ink)}",
    ".criasite-architecture-wrap{width:min(1100px,calc(100% - 40px));margin-inline:auto}",
    ".criasite-architecture-kicker{font-size:.72rem;letter-spacing:.16em;font-weight:700;color:var(--cs-copper);margin:0 0 1rem}",
    ".criasite-architecture-scope h2,.criasite-reference-section h2{max-width:760px;font-size:clamp(2rem,4vw,3.6rem);line-height:1.06;letter-spacing:-.04em;margin:0 0 1rem}",
    ".criasite-architecture-lead,.criasite-reference-intro{max-width:700px;color:var(--cs-muted);line-height:1.75}",
    ".criasite-architecture-services{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin-top:2.25rem;background:#d8cfc3;border:1px solid #d8cfc3}",
    ".criasite-architecture-services article{background:#fff;padding:clamp(1.25rem,2.5vw,2rem);min-height:220px}",
    ".criasite-architecture-services article span{color:var(--cs-copper);font-size:.75rem;letter-spacing:.14em}",
    ".criasite-architecture-services h3{font-size:1.2rem;margin:1.5rem 0 .65rem}",
    ".criasite-architecture-services p,.criasite-architecture-disclaimer{color:var(--cs-muted);line-height:1.7;font-size:.94rem}",
    ".criasite-architecture-disclaimer{font-size:.78rem;margin-top:1rem}",
    ".criasite-reference-section{padding:clamp(3.5rem,7vw,6rem) 0;background:#eee8df!important;color:var(--cs-ink)}",
    ".criasite-reference-wrap{width:min(1100px,calc(100% - 40px));margin-inline:auto}",
    ".criasite-reference-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2rem}",
    ".criasite-reference-grid article{background:#fff;border:1px solid #d8cfc3;padding:1.5rem;min-height:190px}",
    ".criasite-reference-grid article span{color:var(--cs-copper);font-size:.72rem;letter-spacing:.12em}",
    ".criasite-reference-grid h3{margin:1rem 0 .5rem;font-size:1.15rem}",
    ".criasite-reference-grid p{color:var(--cs-muted);line-height:1.65}",
    "a:focus-visible,button:focus-visible{outline:3px solid var(--cs-copper);outline-offset:4px}",
    "@media(max-width:760px){.criasite-architecture-services,.criasite-reference-grid{grid-template-columns:1fr}.criasite-architecture-services article{min-height:0}}",
    ".criasite-architecture-hero-cta{display:inline-flex;align-items:center;justify-content:center;margin-top:1rem;padding:.9rem 1.25rem;background:#292722;color:#fff;text-decoration:none;border:1px solid #292722;transition:background .2s,color .2s}",
    ".criasite-architecture-hero-cta:hover{background:#9a704c;border-color:#9a704c}",
    ".criasite-architecture-faq,.criasite-architecture-principles,.criasite-architecture-contact{width:min(1100px,calc(100% - 40px));margin-inline:auto;padding:clamp(3rem,7vw,5rem) 0}",
    ".criasite-architecture-faq h2,.criasite-architecture-principles h2,.criasite-architecture-contact h2{font-size:clamp(2rem,4vw,3rem);line-height:1.1;margin:0 0 1.5rem}",
    ".criasite-architecture-faq details{padding:1.1rem 0;border-bottom:1px solid #d8cfc3}",
    ".criasite-architecture-faq summary{cursor:pointer;font-weight:650;min-height:44px;display:flex;align-items:center}",
    ".criasite-architecture-contact{background:#292722;color:#fff;padding:clamp(2rem,5vw,4rem);margin-block:2rem}",
    ".criasite-architecture-contact .criasite-architecture-kicker{color:#c9a989}",
    ".criasite-architecture-contact p{max-width:680px;line-height:1.75}",
    ".criasite-architecture-contact .criasite-architecture-disclaimer{color:#ddd3c8}"
  ].join("\n");
  if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(output)) output = output.replace(/<\/style>/i, css + "\n</style>");
  else output = output.replace(/<\/head>/i, "<style>" + css + "</style></head>");

  const heroRe = /<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"]*\bhero\b))[^>]*>[\s\S]*?<\/section>/i;
  if (heroRe.test(output)) {
    output = output.replace(heroRe, hero => {
      if (/<a\b[^>]*href=["']#(?:servicos|serviços|contato)["']/i.test(hero)) return hero;
      const cta = '<a class="criasite-architecture-hero-cta" href="#servicos">Conheça o processo</a>';
      return hero.replace(/<\/section>/i, cta + "</section>");
    });
  }
  return output;
}


function enforceBeautyFinalPolish(html, business = {}) {
  let output = String(html || "");
  const resolved = inferBusinessType(business, business.userBrief || "").type;
  if (resolved !== "beleza") return output;

  const digits = String(business.whatsapp || "").replace(/\D/g, "");
  const hasWhatsApp = digits.length >= 10 && digits.length <= 15 && !/^0+$/.test(digits);
  const serviceRe = /<section\b(?=[^>]*\bid=["'](?:servicos|serviços|services)["'])[^>]*>[\s\S]*?<\/section>/i;
  if (serviceRe.test(output) && !String(business.offerings || business.services || "").trim()) {
    output = output.replace(serviceRe,
      '<section id="servicos" class="criasite-beauty-services">' +
      '<div class="criasite-beauty-wrap">' +
      '<p class="criasite-beauty-eyebrow">CUIDADO COM INFORMAÇÃO</p>' +
      '<h2>Uma escolha começa com uma boa conversa</h2>' +
      '<p class="criasite-beauty-lead">Cada pessoa tem necessidades e expectativas diferentes. Antes de considerar qualquer cuidado, vale compreender o objetivo, conhecer as informações disponíveis e confirmar o que realmente faz parte da atuação da clínica.</p>' +
      '<div class="criasite-beauty-grid">' +
      '<article><span>01 / ESCUTA</span><h3>Entender suas necessidades</h3><p>Compartilhe suas dúvidas, expectativas e prioridades. Uma conversa inicial ajuda a esclarecer o que você procura, sem presumir que uma opção seja adequada para todas as pessoas.</p></article>' +
      '<article><span>02 / INFORMAÇÃO</span><h3>Conhecer possibilidades</h3><p>Peça explicações sobre cada opção considerada, incluindo objetivos, limites, cuidados necessários e informações que devem ser avaliadas por um profissional habilitado.</p></article>' +
      '<article><span>03 / DECISÃO</span><h3>Confirmar antes de escolher</h3><p>Verifique quais atendimentos estão efetivamente disponíveis, quem é responsável por realizá-los e quais condições se aplicam antes de tomar qualquer decisão.</p></article>' +
      '</div><p class="criasite-beauty-note">Conteúdo informativo. Os serviços, procedimentos, profissionais e condições da clínica precisam ser confirmados diretamente com o estabelecimento.</p>' +
      '</div></section>'
    );
  }

  const contactRe = /<section\b(?=[^>]*\bid=["']contato["'])[^>]*>[\s\S]*?<\/section>/i;
  if (contactRe.test(output) && !hasWhatsApp && !/\b(?:mailto:|tel:)/i.test((output.match(contactRe) || [""])[0])) {
    output = output.replace(contactRe,
      '<section id="contato" class="criasite-beauty-contact">' +
      '<div class="criasite-beauty-wrap">' +
      '<p class="criasite-beauty-eyebrow">INFORMAÇÕES E PRÓXIMO PASSO</p>' +
      '<h2>Conheça a proposta da clínica</h2>' +
      '<p>Antes de agendar ou escolher um atendimento, confirme diretamente com a clínica os canais oficiais, os serviços disponíveis e as condições atualizadas.</p>' +
      '<p class="criasite-beauty-note">Esta demonstração não possui um canal direto de contato configurado. Nenhum telefone, endereço ou agendamento foi inventado.</p>' +
      '</div></section>'
    );
  }

  const heroRe = /<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"']*\bhero\b))[^>]*>[\s\S]*?<\/section>/i;
  if (heroRe.test(output)) {
    output = output.replace(heroRe, hero => {
      if (/<a\b[^>]*href=["']#(?:servicos|serviços|sobre|contato)["']/i.test(hero)) return hero;
      return hero.replace(/<\/section>/i,
        '<a class="criasite-beauty-hero-cta" href="#servicos">Conheça nossa abordagem</a></section>');
    });
  }

  const css = [
    "/* CriaSite AI — acabamento comercial para beleza e estética */",
    ".criasite-beauty-wrap{width:min(1100px,calc(100% - 40px));margin-inline:auto}",
    ".criasite-beauty-services{padding:clamp(4rem,8vw,7rem) 0;background:#f6f1ec;color:#39332f}",
    ".criasite-beauty-services h2,.criasite-beauty-contact h2{max-width:760px;font-size:clamp(2.1rem,4.5vw,3.8rem);line-height:1.05;letter-spacing:-.04em;margin:0 0 1rem}",
    ".criasite-beauty-eyebrow{font-size:.72rem;letter-spacing:.17em;font-weight:700;color:#a47e69;margin:0 0 1rem}",
    ".criasite-beauty-lead{max-width:720px;color:#6d625b;line-height:1.8;font-size:1.04rem}",
    ".criasite-beauty-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin-top:2.5rem;background:#dfd2c8;border:1px solid #dfd2c8}",
    ".criasite-beauty-grid article{background:#fff;padding:clamp(1.4rem,3vw,2.2rem);min-height:245px}",
    ".criasite-beauty-grid article span{font-size:.7rem;letter-spacing:.15em;color:#a47e69;font-weight:700}",
    ".criasite-beauty-grid h3{font-size:1.25rem;line-height:1.2;margin:1.5rem 0 .75rem;color:#39332f}",
    ".criasite-beauty-grid p,.criasite-beauty-contact>div>p:not(.criasite-beauty-eyebrow){color:#6d625b;line-height:1.75}",
    ".criasite-beauty-note{margin-top:1.25rem;font-size:.82rem;color:#776b63;line-height:1.7}",
    ".criasite-beauty-contact{padding:clamp(4rem,8vw,7rem) 0;background:#eee4dc;color:#39332f}",
    ".criasite-beauty-contact>div>p:not(.criasite-beauty-eyebrow){max-width:700px}",
    ".criasite-beauty-hero-cta{display:inline-flex;align-items:center;justify-content:center;margin-top:1.4rem;min-height:48px;padding:.9rem 1.35rem;background:#8f6d5a;color:#fff;text-decoration:none;border-radius:3px;font-weight:650;transition:background .2s,transform .2s}",
    ".criasite-beauty-hero-cta:hover{background:#725442;transform:translateY(-2px)}",
    "@media(max-width:760px){.criasite-beauty-grid{grid-template-columns:1fr}.criasite-beauty-grid article{min-height:0}.criasite-beauty-wrap{width:min(100% - 32px,1100px)}}",
    "@media(prefers-reduced-motion:reduce){.criasite-beauty-hero-cta{transition:none}}"
  ].join("\n");
  if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(output)) output = output.replace(/<\/style>/i, css + "\n</style>");
  else output = output.replace(/<\/head>/i, "<style>" + css + "</style></head>");
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
  const heroMatch = html.match(/<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"']*hero[^"']*["']))[^>]*>[\s\S]*?<\/section>/i) || html.match(/<header\b[\s\S]*?<\/header>/i);
  const hero = heroMatch ? heroMatch[0] : "";
  const heroVisuals = (hero.match(/<svg\b|<img\b|<picture\b/gi) || []).length;
  const galleryMatch = html.match(/<section\b(?=[^>]*(?:galeria|gallery|portfolio|estrutura))[^>]*>[\s\S]*?<\/section>/i) || html.match(/<div\b(?=[^>]*(?:galeria|gallery|portfolio|estrutura))[^>]*>[\s\S]*?<\/div>/i);
  const gallerySvgCount = galleryMatch ? (galleryMatch[0].match(/<svg\b/gi) || []).length : 0;
  const hasVisualStyling = /(?:clip-path|mask-image|background-image|linear-gradient|radial-gradient|filter:\s*drop-shadow|::before|::after)/i.test(html);
  const hasAsymmetricGallery = /(?:gallery|galeria)[^{]*\{[^}]*grid-template-areas|(?:gallery|galeria)[^{]*\{[^}]*masonry|(?:gallery|galeria)[^{]*\{[^}]*grid-template-columns[^}]*1\.4fr|(?:gallery|galeria)[^{]*\{[^}]*aspect-ratio/i.test(html) ||
    /(?:gallery|galeria)[^{]*:nth-child\s*\(/i.test(html);
  const hasEditorialMoment = /<blockquote\b[^>]*(?:font-size\s*:\s*(?:1\.[8-9]|[2-9]rem)|class=["'][^"']*(?:manifesto|quote|editorial))/i.test(html) ||
    /class=["'][^"']*(?:manifesto|editorial-band|feature-band|timeline)/i.test(html) ||
    /<(?:section|div)\b[^>]*style=["'][^"']*(?:background:\s*(?:#|linear-gradient)|padding:\s*[4-9]\dpx)/i.test(html);
  const galleryHasMobileHeightOverride = /@media\s*\([^)]*(?:max-width|max-inline-size)[^)]*\)[\s\S]{0,5000}(?:gallery-item|gallery-grid|galeria)[^{]*\{[^}]*(?:height\s*:|aspect-ratio\s*:)/i.test(html);
  const galleryUsesFixedTallImages = /\.gallery-item\s*\{[^}]*height\s*:\s*(?:3\d\d|4\d\d|5\d\d)px/i.test(html);
  const whatsappDigits = String(business.whatsapp || "").replace(/[^0-9]/g, "");
  const hasWhatsAppContact = whatsappDigits.length >= 10 && whatsappDigits.length <= 15 &&
    new RegExp("wa\\.me/" + whatsappDigits + "(?:[?\\\"'])?", "i").test(html);
  const hasRealContact = hasWhatsAppContact;
  const contactBlock = (html.match(/<section\b(?=[^>]*\bid=["']contato["'])[^>]*>[\s\S]*?<\/section>/i) || [""])[0];
  const fakeContact = /(?:mailto:|href=["'][^"']*(?:example\.com|powerfit\.com|seudominio|seuemail)|contato@(?:powerfit|exemplo|example)\.)/i.test(contactBlock);
  const waLinks = Array.from(contactBlock.matchAll(/https?:\/\/(?:www\.)?wa\.me\/([0-9+]+)/gi), match => match[1].replace(/\D/g, ""));
  const hasDummyWhatsApp = waLinks.some(number => number.length < 10 || number.length > 15 || /^0+$/.test(number) || /^(1234567890|11999999999|5511999999999)$/.test(number));
  const sourceFacts = String([business.userBrief, business.name, business.tagline, business.description, business.offerings, business.services, business.modalities, business.plans, business.benefits].filter(Boolean).join(" ")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const visibleText = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const unverifiedClaims = ["acesso livre","acesso total","nasceu da necessidade","fundada em","anos de experiencia","mais de 10 anos","mais de 15 anos","acompanhamento geriatrico","protocolos de vacinacao atualizados","ambiente pensado para reduzir o estresse","ambiente desenhado para minimizar o estresse","estrutura pensada para reduzir o estresse","clinica veterinaria especializada","acompanhamento especializado","medicina baseada em evidencias","excelencia clinica","equipe multidisciplinar","equipe veterinaria","equipe odontologica","profissionais certificados","atendimento humanizado","referencia na regiao","lider no mercado","resultados comprovados","resultados garantidos","centenas de clientes","projetos realizados","clientes satisfeitos","avaliacao inicial","avaliacao mensal","acompanhamento total","acompanhamento individual","acompanhamento continuo","horario de funcionamento","horario de atendimento","equipe tecnica","equipe especializada","treino supervisionado","avaliacao periodica","reavaliacao periodica","planilha de treino personalizada","visita guiada","tour guiado","suporte tecnico","prioridade em agendamentos","prioridade no suporte","visite nossa unidade","nossa recepcao","recepcao da academia","profissionais certificados","instrutores acompanham","atendimento personalizado","consultoria de treino","consultoria completa","desconto progressivo","aula experimental","aulas experimentais","avaliacao fisica","personal trainer","professor a disposicao","estacionamento gratuito","vestiario","ar condicionado","ambiente climatizado","biomecanica","periodizacao","forca maxima","hipertrofia","prevencao de lesoes","acompanhamento constante","treino livre","treino orientado","treino de forca","treinamento funcional","musculacao orientada","condicionamento metabolico","condicionamento fisico","condicionamento","mobilidade","integracao","execucao tecnica","orientacao tecnica constante","orientacao tecnica","estrutura otimizada","estrutura completa","equipamentos modernos","equipamentos profissionais","ambiente focado em performance","seriedade tecnica","metodologia propria","metodo exclusivo","resultados reais","resultados garantidos","equipe qualificada","equipe experiente","profissionais especializados","profissionais qualificados","acompanhamento de evolucao","cronograma personalizado","planejamento individual","planos flexiveis","horarios flexiveis"].filter(claim => visibleText.includes(claim) && !sourceFacts.includes(claim));
  const unsupportedCommercialClaims = unverifiedClaims.length > 0;
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
  if (!/<footer\b[\s\S]*?<\/footer>/i.test(html)) issues.push("Falta um rodapé completo com identidade do negócio, navegação ou informação institucional útil.");
  if (!/<title>\s*[^<]+<\/title>/i.test(html) || !/<meta\s+name=["']description["']/i.test(html)) issues.push("Complete title e meta description para SEO básico.");
  if (!hasMobileRules) issues.push("Falta uma media query real para adaptar o layout a telas pequenas.");
  const heroMobileRules = Array.from(html.matchAll(/@media\s*\([^)]*(?:max-width|max-inline-size)[^)]*\)([\s\S]{0,5000})/gi), match => match[1]).join("\n");
  if (/\.hero(?:-img|-image|-visual)?[^}]*display\s*:\s*none/i.test(heroMobileRules)) issues.push("A imagem principal do hero desaparece no celular. Reorganize o hero em uma coluna e mantenha a fotografia visível.");
  if (!hasNav || !/<header[\s\S]*?<nav\b/i.test(html)) issues.push("Inclua nav semântico dentro do cabeçalho.");
  if (!/<nav\b[^>]*aria-label|<nav\b[^>]*aria-labelledby/i.test(html)) issues.push("Identifique a navegação principal com aria-label ou aria-labelledby.");
  if (!hasMenuButton) issues.push("Adicione botão de menu móvel acessível e funcional.");
  if (hasMenuButton && !/aria-controls=/i.test(html)) issues.push("Associe o botão do menu à navegação com aria-controls.");
  const baseCss = (html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i) || ["", ""])[1].split(/@media/i)[0];
  if (hasMenuButton && /id=["']menu-toggle["']/i.test(html) && !/#menu-toggle[^{]*\{[^}]*display\s*:\s*none/i.test(baseCss)) issues.push("O botão do menu móvel deve ficar oculto no desktop e aparecer somente no breakpoint mobile.");
  if (hasMenuButton && !/aria-expanded=["'](?:true|false)["']/i.test(html)) issues.push("O botão do menu precisa expor aria-expanded.");
  if (hasMenuButton && !/keydown/i.test(html)) issues.push("O menu móvel deve fechar ao pressionar Escape.");
  if (hasMenuButton && !/(?:querySelectorAll|querySelector)\(["'][^"']*a[^"']*["']\)[\s\S]{0,900}addEventListener\(["']click|addEventListener\(["']click[\s\S]{0,900}(?:querySelectorAll|querySelector)\(["'][^"']*a/i.test(html)) issues.push("Feche o painel mobile depois que qualquer link do menu for selecionado.");
  const mobileCss = Array.from(html.matchAll(/@media\s*\([^)]*\)([\s\S]{0,5000})/gi), match => match[1]).join("\n");
  const galleryMobileRule = /(?:gallery|galeria|mosaic)[^{]*\{[^}]*grid-template-columns\s*:\s*(?:1fr|repeat\(\s*1)/i.test(mobileCss);
  if (galleryMatch && !galleryMobileRule) issues.push("A galeria não tem adaptação mobile específica. Em telas pequenas, reorganize o mosaico em uma coluna ou grade fluida sem cortes nem rolagem horizontal.");
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
  const resolvedSegmentType = inferBusinessType(business, business.userBrief || "").type;
  const expectedPhotoIds = Array.from(segmentVisualBrief(resolvedSegmentType).matchAll(/images\.unsplash\.com\/(photo-[^?]+)/g), match => match[1]);
  const galleryImageTags = galleryMatch ? Array.from(galleryMatch[0].matchAll(/<img\b[^>]*>/gi), match => match[0]) : [];
  const galleryPhotoIds = galleryImageTags.map(tag => ((tag.match(/src=["'][^"']*images\.unsplash\.com\/(photo-[^?]+)/i) || [])[1] || ""));
  const repeatedGalleryPhotos = galleryPhotoIds.filter((id, index) => id && galleryPhotoIds.indexOf(id) !== index);
  if (repeatedGalleryPhotos.length) issues.push("A galeria repete fotografias. Use quatro imagens diferentes dentro da própria galeria, mantendo a foto do hero independente.");
  const correctSegmentPhotos = galleryPhotoIds.filter(id => expectedPhotoIds.includes(id)).length;
  if (hasGallery && galleryImagesWithAlt < 4) issues.push("Galeria precisa conter quatro fotografias reais com texto alternativo útil.");
  if (hasGallery && expectedPhotoIds.length && correctSegmentPhotos < 4) issues.push("Galeria usa fotos ausentes ou incompatíveis com o segmento. Use exatamente as quatro URLs de fotografia fornecidas para este tipo de negócio.");

  const segmentType = String(resolvedSegmentType || "servicos").toLowerCase();
  if (segmentType === "arquitetura") {
    const servicesSection = (html.match(/<section\b(?=[^>]*\bid=["'](?:servicos|serviços)["'])[^>]*>[\s\S]*?<\/section>/i) || [""])[0];
    const serviceCards = (servicesSection.match(/<(?:article|li)\b|class=["'][^"']*(?:service-card|servico-card|card-servico)[^"']*["']/gi) || []).length;
    const portfolioSection = (html.match(/<section\b(?=[^>]*\bid=["'](?:portfolio|projetos|referencias|referências)["'])[^>]*>[\s\S]*?<\/section>/i) || [""])[0];
    const portfolioItems = (portfolioSection.match(/<(?:article|figure)\b|class=["'][^"']*(?:project-card|projeto-card|portfolio-item)[^"']*["']/gi) || []).length;
    const heroHasAction = /<a\b[^>]*href=["']#(?:servicos|contato)["'][^>]*>/i.test(hero);
    if (!servicesSection || servicesSection.replace(/<[^>]+>/g," ").trim().length < 420 || serviceCards < 3) issues.push("Arquitetura: a seção de serviços precisa apresentar pelo menos três blocos desenvolvidos, com explicação útil e sem inventar serviços não confirmados.");
    if (!portfolioSection || portfolioItems < 3) issues.push("Arquitetura: crie uma seção de referências visuais com pelo menos três itens identificados; não apresente imagens ilustrativas como obras executadas.");
    if (!heroHasAction) issues.push("Arquitetura: o hero precisa de uma chamada visível que leve a #servicos ou #contato.");
  }
  const navList = (html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/i) || [""])[0];
  if (hasMenuButton && navList.includes("<ul") && !/list\.classList\.toggle\(['"]active['"],\s*!!open\)/.test(html)) issues.push("O menu mobile não controla a própria lista nav ul. O botão precisa abrir/fechar ul.active e sincronizar aria-expanded.");
  if (hasMenuButton && /header nav(?:\s*\{[^}]*display\s*:\s*none|\s+\{[^}]*display\s*:\s*none)/i.test(html) && !/header nav\.criasite-menu-open\s*\{[^}]*display\s*:\s*block!important/i.test(html)) issues.push("O contêiner nav permanece oculto mesmo quando a lista de links é aberta no celular.");
  if (hasMenuButton && /header nav ul\{[^}]*display\s*:\s*none!important/i.test(html) && !/header nav ul\.active[^}]*display\s*:\s*flex!important/i.test(html)) issues.push("O CSS do menu esconde os links sem uma regra correspondente para exibir a lista ativa.");
  const heroPhotoId = ((hero.match(/<img\b[^>]*src=["'][^"']*images\.unsplash\.com\/(photo-[^?]+)/i) || [])[1] || "");
  if (heroPhotoId && galleryPhotoIds.includes(heroPhotoId)) issues.push("A fotografia do hero está repetida na galeria. Reserve quatro imagens distintas para a galeria e mantenha a foto principal independente.");
  if (expectedPhotoIds.length && !expectedPhotoIds.includes(heroPhotoId)) issues.push("Foto principal do hero incompatível com o segmento selecionado. Substitua pela primeira fotografia oficial do perfil do negócio.");
  if (hasGallery && gallerySemanticSvgs + galleryImagesWithAlt < 4) issues.push("Galeria precisa de quatro imagens com alt útil ou ilustrações SVG acessíveis.");
  if (hasGallery && galleryImageCount >= 4 && !hasAsymmetricGallery) issues.push("Galeria sem composição editorial: as quatro fotografias estão organizadas como grade uniforme. Crie mosaico assimétrico com pelo menos um painel de destaque, sem esconder imagens.");
  if (hasGallery && galleryUsesFixedTallImages && !galleryHasMobileHeightOverride) issues.push("A galeria mantém imagens com altura fixa em celulares. Use aspect-ratio responsivo ou ajuste a altura no breakpoint mobile.");
  if (hasGallery && !hasEditorialMoment) issues.push("Falta um segundo momento visual editorial além do hero. Crie uma faixa de destaque, manifesto tipográfico, timeline ou seção de contraste com composição própria.");
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
  if (unsupportedCommercialClaims) issues.push("O conteúdo apresenta alegações comerciais ou técnicas não encontradas nos dados fornecidos pelo cliente (" + unverifiedClaims.slice(0, 8).join(", ") + "). Remova-as ou transforme-as em orientação geral sem afirmar que o negócio oferece isso.");
  if (!whatsappDigits && /(?:wa\.me\/|tel:|mailto:)/i.test(contactBlock)) issues.push("Não foi fornecido canal de contato: remova links de WhatsApp, telefone e e-mail que não vieram dos dados do cliente.");
  const fakeContactCta = /<(?:span|div|button)\b[^>]*class=["\'][^"\']*(?:btn|cta|contact-link)/i.test(contactBlock) && /falar com|fale conosco|entre em contato|iniciar jornada|solicite|agende/i.test(contactBlock);
  if (!whatsappDigits && !/<form\b/i.test(contactBlock) && fakeContactCta) issues.push("A seção de contato apresenta uma chamada sem ação funcional. Sem canal real fornecido, transforme o encerramento em conteúdo editorial neutro e remova o falso botão.");
  if (whatsappDigits.length >= 10 && whatsappDigits.length <= 15 && !hasWhatsAppContact) issues.push("O WhatsApp informado pelo cliente precisa estar conectado em um link https://wa.me/ com o número correto.");
  if (/agende uma visita|fale conosco|entre em contato|solicite um or[cç]amento/i.test(contactBlock || html) && !hasRealContact && whatsappDigits.length > 0) issues.push("A chamada comercial precisa usar o WhatsApp real informado pelo cliente.");
  if (/<img\b/i.test(html) && /<img\b(?![^>]*\bloading=["']lazy["'])/i.test(html)) issues.push("Imagens fora do hero devem usar loading=lazy para melhorar o carregamento.");
  if (/(?:min-width\s*:\s*(?:280|300|320|350)px|width\s*:\s*(?:300|320|350)px)/i.test(html) && !/overflow-x\s*:\s*hidden|overflow-x\s*:\s*clip/i.test(html)) issues.push("Revise larguras mínimas fixas que podem causar rolagem horizontal em celulares; use grids fluidos com minmax(0, 1fr).");

  if (!/<html\b[^>]*\blang=["']pt-BR["']/i.test(html)) issues.push("Documento sem idioma pt-BR declarado. Adicione lang=\"pt-BR\" à tag html.");
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count > 1) issues.push("Há mais de um h1. Mantenha um único título principal e organize o restante com h2/h3.");
  if (!/<main\b/i.test(html)) issues.push("Falta landmark main. Envolva o conteúdo principal em <main> para melhorar semântica e navegação assistiva.");
  if (/<a\b[^>]*href=["']\s*["']/i.test(html)) issues.push("Há link com href vazio. Dê um destino real a cada link ou transforme o texto em elemento não clicável.");
  if (/<button\b(?![^>]*\btype=)/i.test(html)) issues.push("Há botão sem atributo type. Defina type=\"button\" ou type=\"submit\" para evitar envios acidentais.");
  if (/<a\b(?=[^>]*target=["']_blank["'])(?![^>]*rel=["'][^"']*noopener)[^>]*>/i.test(html)) issues.push("Links que abrem nova aba precisam de rel=\"noopener noreferrer\".");
  const blankAltImages = Array.from(html.matchAll(/<img\b[^>]*>/gi), match => match[0]).filter(tag => !/\balt=["'][^"']+["']/i.test(tag));
  if (blankAltImages.length) issues.push("Há imagens sem texto alternativo descritivo. Preencha alt em todas as imagens informativas.");
  const description = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [,""])[1];
  if (description && (description.length < 70 || description.length > 170)) issues.push("A meta description está fora do tamanho recomendado. Ajuste para aproximadamente 70 a 170 caracteres, sem repetir palavras-chave.");
  const emptyButtons = Array.from(html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi), match => match[1].replace(/<[^>]+>/g, "").trim()).filter(label => !label);
  if (emptyButtons.length) issues.push("Há botão sem nome acessível. Adicione texto visível ou aria-label que descreva sua ação.");

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
  const requestedType = String(inferBusinessType(business, normalizedHtml).type || business.type || "").trim().toLowerCase();
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
  const isVeterinarySite = requestedType === "veterinaria";
  if (isVeterinarySite) {
    const serviceBlock = sectionBlocks.find(section => /id=["']servicos["']/i.test(section.attrs));
    const differentiatorBlock = sectionBlocks.find(section => /id=["']diferenciais["']|id=["']porque-escolher["']/i.test(section.attrs));
    if (!serviceBlock) issues.push("Site veterinário sem seção própria de serviços: crie uma seção id=servicos com pelo menos três áreas de cuidado descritas com profundidade, sem afirmar que a clínica oferece procedimentos não informados.");
    else {
      const serviceCards = (serviceBlock.body.match(/<(?:article|li)\b|class=["'][^"']*(?:card|service|servico)[^"']*["']/gi) || []).length;
      const serviceText = serviceBlock.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (serviceCards < 3 || serviceText.length < 260) issues.push("A seção de serviços veterinários está superficial: desenvolva pelo menos três áreas de cuidado com explicações úteis, sem inventar procedimentos, especialidades ou estrutura.");
    }
    if (!differentiatorBlock) issues.push("Site veterinário sem seção de diferenciais: crie uma seção id=diferenciais com princípios de cuidado, sem inventar equipe, certificações ou equipamentos.");
    const heroBlock = sectionBlocks.find(section => /id=["']hero["']/i.test(section.attrs));
    if (heroBlock && !/<a\b[^>]*href=["']#(?:servicos|contato)["']/i.test(heroBlock.body)) issues.push("O hero precisa de uma chamada funcional que leve aos serviços ou ao contato, sem criar canal de contato fictício.");
    if (!/\b(?:tutor|pet|animal|c[aã]o|gato)\b/i.test(normalizedHtml)) issues.push("O conteúdo veterinário precisa falar diretamente com tutores e contextualizar o cuidado animal.");
  }
  const plansBlock = sectionBlocks.find(section => /id=["']planos["']/i.test(section.attrs));
  if (isFitnessSite && plansBlock) {
    const planText = plansBlock.body.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const explicitPlanData = /\b(?:mensal|trimestral|semestral|anual|por semana|por mês|por mes|plano [a-z0-9]+|R\$\s*\d)/i.test(sourceFacts);
    const inventedPlanPresentation = /\b(?:plano|planos|treino livre|treino orientado|performance|premium|basic|pro)\b/i.test(planText);
    if (!explicitPlanData && inventedPlanPresentation) issues.push("A seção planos apresenta opções comerciais sem dados confirmados. Substitua por uma composição editorial sobre critérios para avaliar opções, sem nomes de planos, benefícios, preços ou condições.");
    if (explicitPlanData && planText.length < 100) issues.push("A seção de planos informados está superficial. Organize somente as condições fornecidas pelo cliente, sem acrescentar benefícios ou regras.");
  }
  const faqBlock = sectionBlocks.find(section => /id=["']faq["']/i.test(section.attrs));
  if (faqBlock) {
    const faqText = faqBlock.body.replace(/<[^>]+>/g, " ");
    const questionCount = (faqText.match(/\?/g) || []).length;
    const detailCount = (faqBlock.body.match(/<details\b/gi) || []).length;
    if (Math.max(questionCount, detailCount) < 5) issues.push("FAQ superficial: inclua pelo menos cinco perguntas úteis com respostas completas.");
  }
  if (/\*\*[^*]{2,80}\*\*|(?<!\*)\*[^*\n]{2,80}\*(?!\*)/.test(visibleText)) issues.push("Há marcação Markdown visível no texto; converta para tags HTML.");
  if (/minmax\(\s*(?:280|300|320|350)px\s*,/i.test(html)) issues.push("Há colunas com largura mínima rígida que podem estourar a tela; use grids fluidos.");
  if (/(?:agende|marque)\s+(?:uma\s+)?(?:visita|avaliação|aula experimental)/i.test(html) && !hasWhatsAppContact && !/<form\b/i.test(contactBlock)) issues.push("A chamada promete agendamento, mas não há canal funcional; troque por convite neutro.");
  if (faqBlock && /(?:a partir de\s*\d{1,2}\s*anos|segunda.{0,30}sexta|\b(?:abre|aberto|funciona|funcionamento)\b.{0,50}\b(?:h\b|horário|\d{1,2}:\d{2})|cancelamento.{0,80}(?:presencial|multa|aviso prévio)|\b(?:obrigatório|permitido|proibido)\b)/i.test(faqBlock.body)) issues.push("O FAQ contém regras, horários ou políticas específicas não confirmadas; substitua por perguntas neutras.");
  if (faqBlock && !hasRealContact && /canais oficiais|entre em contato|fale com nossa equipe|agendar uma visita|agende uma visita/i.test(faqBlock.body)) issues.push("O FAQ promete contato, visita ou suporte de equipe sem existir canal funcional. Reescreva as respostas com orientações neutras e sem promessas de atendimento.");
  if (faqBlock && (faqBlock.body.match(/<details\b/gi) || []).length < 5) issues.push("O FAQ precisa de cinco perguntas em details/summary, com respostas úteis e sem regras inventadas.");
   // Não exigir cards comerciais quando o cliente não forneceu planos reais.
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

  if (hasMenuButton && !/setAttribute\(\s*["']aria-expanded["']/i.test(html)) issues.push("O menu não atualiza aria-expanded dinamicamente ao abrir e fechar.");
  if (hasMenuButton && !/querySelectorAll\(["']a["']\)[\s\S]{0,500}addEventListener\(["']click["']/i.test(html)) issues.push("O menu não fecha ao selecionar um link.");
  if (hasMenuButton && !/e\.key\s*===?\s*["']Escape["']/i.test(html)) issues.push("O menu não fecha ao pressionar Escape.");
  if (galleryMatch) {
    const alts = Array.from(galleryMatch[0].matchAll(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/gi), m => m[1].toLowerCase().trim());
        if (alts.length >= 3 && alts.filter(alt => /^(imagem ilustrativa|imagem|foto)(\s+\d+)?(\s+do segmento)?(\s+\w+)?$/.test(alt)).length >= 3) issues.push("Os textos alternativos da galeria são genéricos; descreva cada cena ilustrativa.");
    const segmentKey = String(business.type || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const dentalAlt = alts.some(alt => /odontolog|dentista|cadeira odontologica|saude bucal/.test(alt));
    const veterinaryAlt = alts.some(alt => /veterin|cao|cachorro|gato|animal/.test(alt));
    const physioAlt = alts.some(alt => /fisioterapia|reabilitacao|exercicio terapeutico|mobilidade/.test(alt));
    if (segmentKey.includes("veterin") && dentalAlt) issues.push("Galeria incompatível: site veterinário contém texto alternativo odontológico. Refaça as descrições e fotografias para veterinária.");
    if (segmentKey.includes("fisioterapia") && dentalAlt) issues.push("Galeria incompatível: site de fisioterapia contém texto alternativo odontológico. Use cenas de reabilitação e movimento.");
    if (segmentKey.includes("odontologia") && veterinaryAlt) issues.push("Galeria incompatível: site odontológico contém descrições de animais. Use cenas de odontologia humana.");
    if (segmentKey.includes("veterin") && alts.length >= 3 && !veterinaryAlt) issues.push("Galeria sem contexto veterinário: descreva cenas ilustrativas de atendimento e cuidado animal.");
    if (segmentKey.includes("fisioterapia") && alts.length >= 3 && !physioAlt) issues.push("Galeria sem contexto de fisioterapia: descreva reabilitação, exercício terapêutico e mobilidade.");
  }
  const paragraphTexts = [];
  for (const section of sectionBlocks) for (const m of section.body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const value=m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().toLowerCase();
    if(value.length>=65) paragraphTexts.push(value);
  }
  if (paragraphTexts.some((value,index)=>paragraphTexts.indexOf(value)!==index)) issues.push("Há parágrafos repetidos entre seções; dê uma finalidade própria a cada bloco.");

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
    output = output.replace(/(<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"']*\bhero\b))[^>]*>[\s\S]*?<a\b[^>]*href=["'])#contato(["'][^>]*>)[\s\S]*?<\/a>/i,
      (whole, before, after) => before + "https://wa.me/" + digits + "?text=" + encodeURIComponent("Olá! Gostaria de saber mais sobre " + String(business.name || "seus serviços").slice(0, 80) + ".") + after + "Fale conosco</a>");
  } else {
    output = output.replace(/(<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"']*\bhero\b))[^>]*>[\s\S]*?)<a\b([^>]*href=["'])#contato(["'][^>]*>)[\s\S]*?<\/a>/i,
      (whole, heroStart, before, after) => heroStart + '<a' + before + '#sobre' + after + 'Conheça a proposta</a>');
  }
  return output;
}


function enforceContactIntegrity(html, business = {}) {
  let output = String(html || "");
  const digits = String(business.whatsapp || "").replace(/\D/g, "");
  const validWhatsApp = digits.length >= 10 && digits.length <= 15 && !/^0+$/.test(digits);
  const contactPattern = /<section\b(?=[^>]*\bid=["']contato["'])[^>]*>[\s\S]*?<\/section>/i;
  if (!contactPattern.test(output)) return output;

  const cleanText = value => String(value || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim();
  const contactIntent = /whats(?:app)?|fale conosco|fale com|entre em contato|ligue|telefone|e-?mail|mensagem|agende|solicite|orçamento|orcamento|contato/i;

  return output.replace(contactPattern, section => {
    section = section.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi,
      '<p class="criasite-contact-note">As informações comerciais devem ser confirmadas diretamente com o estabelecimento.</p>');

    if (validWhatsApp) {
      const waUrl = "https://wa.me/" + digits + "?text=" + encodeURIComponent("Olá! Gostaria de saber mais sobre " + String(business.name || "seus serviços").slice(0, 80) + ".");
      section = section.replace(/https?:\/\/(?:www\.)?wa\.me\/[0-9+]+(?:\?[^"'\s<>]*)?/gi, waUrl);
      if (!section.includes('href="https://wa.me/' + digits) && !section.includes("href='https://wa.me/" + digits)) {
        const cta = '<a class="criasite-contact-cta" href="' + waUrl + '" target="_blank" rel="noopener noreferrer">Conversar pelo WhatsApp</a>';
        const heading = section.match(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/i);
        if (heading) section = section.replace(heading[0], heading[0] + cta);
        else section = section.replace(/<\/section>$/i, cta + "</section>");
      }
      return section;
    }

    section = section.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (whole, attrs, inner) => {
      const label = cleanText(inner);
      const href = (attrs.match(/\bhref=["']([^"']*)["']/i) || [])[1] || "";
      const isContactLink = contactIntent.test(label + " " + attrs);
      const unsafeDestination = /^(?:#|javascript:)|^mailto:|^tel:|wa\.me\//i.test(href) ||
        /(?:example\.com|seudominio|seuemail|powerfit\.com)/i.test(href);
      if (unsafeDestination || (isContactLink && /^#/i.test(href))) {
        return '<span class="criasite-contact-neutral">' + inner + "</span>";
      }
      return whole;
    });

    section = section.replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi, (whole, attrs, inner) => {
      if (!contactIntent.test(cleanText(inner) + " " + attrs)) return whole;
      return '<span class="criasite-contact-neutral">' + inner + "</span>";
    });
    return section;
  });
}


function enforceResponsiveLayout(html) {
  let output = String(html || "");
  if (!output) return output;
  output = output.replace(/<html\b([^>]*)>/i, (tag, attrs) => {
    if (/\blang\s*=/i.test(attrs)) return "<html" + attrs.replace(/\blang\s*=\s*(["'])[^"']*\1/i, 'lang="pt-BR"') + ">";
    return '<html lang="pt-BR"' + attrs + ">";
  });
  output = output.replace(/<nav\b(?![^>]*\baria-label=)(?![^>]*\baria-labelledby=)([^>]*)>/gi, '<nav aria-label="Navegação principal"$1>');
  output = output.replace(/<button\b(?![^>]*\btype\s*=)([^>]*)>/gi, (tag, attrs, offset, source) => {
    const before = source.slice(0, offset);
    const insideForm = before.lastIndexOf("<form") > before.lastIndexOf("</form>");
    return '<button type="' + (insideForm ? "submit" : "button") + '"' + attrs + ">";
  });
  output = output.replace(/<a\b([^>]*\btarget=["']_blank["'][^>]*)>/gi, tag => {
    if (/\brel=["'][^"']*noopener/i.test(tag)) return tag;
    return tag.replace(/>$/, ' rel="noopener noreferrer">');
  });
  output = output.replace(/<img\b(?![^>]*\balt\s*=)([^>]*)>/gi, '<img alt="Imagem ilustrativa do segmento"$1>');
  output = output.replace(/<img\b(?![^>]*\bdecoding\s*=)([^>]*)>/gi, '<img decoding="async"$1>');
  let mainTarget = "main-content";
  const existingMain = output.match(/<main\b([^>]*)>/i);
  if (!existingMain) {
    const headerMatch = output.match(/<\/header\s*>/i);
    const footerStart = output.search(/<footer\b/i);
    if (headerMatch && footerStart > output.indexOf(headerMatch[0])) {
      const afterHeader = output.indexOf(headerMatch[0]) + headerMatch[0].length;
      output = output.slice(0, afterHeader) + '<main id="main-content">' +
        output.slice(afterHeader, footerStart) + '</main>' + output.slice(footerStart);
    }
  } else {
    const existingId = (existingMain[1].match(/\bid=["']([^"']+)["']/i) || [])[1];
    if (existingId) mainTarget = existingId;
    else output = output.replace(/<main\b/i, '<main id="main-content"');
  }
  if (!/class=["'][^"']*criasite-skip-link/i.test(output) && /<body\b[^>]*>/i.test(output)) {
    output = output.replace(/<body\b[^>]*>/i, function(opening) {
      return opening + '<a class="criasite-skip-link" href="#' + mainTarget + '">Pular para o conteúdo</a>';
    });
  }
  const css = [
    "/* CriaSite AI — camada final de robustez responsiva e acessibilidade */",
    "html{max-width:100%;scroll-behavior:smooth}",
    ".criasite-skip-link{position:fixed;left:12px;top:12px;z-index:10000;padding:12px 16px;background:#111;color:#fff;transform:translateY(-160%);border-radius:8px}",
    ".criasite-skip-link:focus{transform:translateY(0)}",
    ".menu-toggle,#menu-btn,#menu-toggle,.nav-toggle,#menu-button{display:none}",
    "body{max-width:100%;overflow-x:clip}",
    "img,picture,video,svg{max-width:100%}",
    "img{height:auto}",
    ".hero,#hero{min-width:0}",
    ".hero>*,#hero>*{min-width:0}",
    ".hero img,#hero img,.hero-img,.hero-image{display:block;width:100%;max-width:100%;height:clamp(260px,46vw,560px);min-height:0;object-fit:cover;object-position:center}",
    "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid currentColor;outline-offset:3px}",
    "@media(max-width:760px){.hero,#hero{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto;gap:clamp(1.25rem,5vw,2rem);width:100%;max-width:100%;padding-inline:clamp(1rem,5vw,1.5rem)}.hero img,#hero img,.hero-img,.hero-image{height:clamp(220px,68vw,380px)!important;min-height:0!important;aspect-ratio:16/11;object-fit:cover}.hero h1,#hero h1{font-size:clamp(2.15rem,9vw,3.5rem)!important;overflow-wrap:anywhere}nav ul{display:flex;flex-direction:column;align-items:stretch;gap:12px}nav a{display:flex;align-items:center;min-height:44px}.menu-toggle,#menu-btn,#menu-toggle,.nav-toggle,#menu-button{min-width:44px;min-height:44px;align-items:center;justify-content:center}}",
    "@media(max-width:420px){.hero img,#hero img,.hero-img,.hero-image{height:clamp(210px,72vw,310px)!important}}",
    "@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}"
  ].join("\n");
  if (!/CriaSite AI — camada final de robustez responsiva/i.test(output)) {
    if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(output)) output = output.replace(/<\/style>/i, css + "\n</style>");
    else output = output.replace(/<\/head>/i, "<style>" + css + "</style></head>");
  }
  const heroMatch = output.match(/<section\b(?=[^>]*(?:\bid=["']hero["']|\bclass=["'][^"']*\bhero\b))[^>]*>[\s\S]*?<\/section>/i);
  const heroHtml = heroMatch ? heroMatch[0] : "";
  output = output.replace(/<img\b[^>]*>/gi, tag => {
    const inHero = heroHtml && heroHtml.includes(tag);
    const next = tag.replace(/\sloading=["'][^"']*["']/i, "");
    return next.replace(/<img\b/i, '<img loading="' + (inHero ? "eager" : "lazy") + '"');
  });
  return output;
}


function enforceNavigationAccessibility(html) {
  let output = String(html || "");
  if (!output) return output;
  const navMatch = output.match(/<nav\b([^>]*)>/i);
  if (!navMatch) return output;
  const navId = (navMatch[1].match(/\bid=["']([^"']+)["']/i) || [])[1] || "criasite-primary-nav";
  if (!/\bid=/i.test(navMatch[1])) output = output.replace(navMatch[0], '<nav id="' + navId + '"' + navMatch[1] + '>');
  const selector = ".menu-btn,.menu-toggle,#menu-btn,#menu-toggle,.nav-toggle,#menu-button";
  let buttonMatch = output.match(/<button\b(?=[^>]*(?:class=["'][^"']*(?:menu|nav)[^"']*["']|id=["'][^"']*(?:menu|nav)[^"']*["']|aria-controls=["']))[^>]*>[\s\S]*?<\/button>/i);
  if (!buttonMatch) buttonMatch = output.match(/<button\b[^>]*>[\s\S]*?(?:☰|≡|menu)[\s\S]*?<\/button>/i);
  if (!buttonMatch) {
    const generatedButton = '<button type="button" class="menu-toggle" aria-label="Abrir menu de navegação" aria-controls="' + navId + '" aria-expanded="false"><span aria-hidden="true">☰</span></button>';
    output = output.replace(/<nav\b/i, generatedButton + '<nav');
    buttonMatch = output.match(/<button\b[^>]*class=["'][^"']*menu-toggle[^"']*["'][^>]*>[\s\S]*?<\/button>/i);
  }
  if (!buttonMatch) return output;
  let button = buttonMatch[0];
  if (!/\btype=/i.test(button)) button = button.replace("<button", '<button type="button"');
  if (!/\baria-label=/i.test(button)) button = button.replace("<button", '<button aria-label="Abrir menu de navegação"');
  if (!/\baria-controls=/i.test(button)) button = button.replace("<button", '<button aria-controls="' + navId + '"');
  if (!/\baria-expanded=/i.test(button)) button = button.replace("<button", '<button aria-expanded="false"');
  output = output.replace(buttonMatch[0], button);
  const css = [
    "/* CriaSite navigation accessibility v6 — painel mobile funcional */",
    ".menu-btn,.menu-toggle,#menu-btn,#menu-toggle,.nav-toggle,#menu-button{display:none}",
    "@media(max-width:760px){",
    ".menu-btn,.menu-toggle,#menu-btn,#menu-toggle,.nav-toggle,#menu-button{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px}",
    "header nav{position:relative}",
    "header nav.criasite-menu-open{display:block!important;position:absolute!important;top:100%;left:0;right:0;z-index:1001;width:100%;padding:12px 16px;background:#fff;box-shadow:0 16px 32px rgba(15,23,42,.12)}",
    "header nav ul{display:none!important;position:static!important;width:100%;flex-direction:column!important;align-items:stretch;gap:8px;padding:8px 0;background:#fff;list-style:none;margin:0}",
    "header nav ul.active,header nav ul.is-open{display:flex!important}",
    "header nav ul li{width:100%}",
    "header nav ul a{display:flex;align-items:center;min-height:44px;padding:8px 12px}",
    "}",
    "@media(min-width:761px){.menu-btn,.menu-toggle,#menu-btn,#menu-toggle,.nav-toggle,#menu-button{display:none!important}header nav.criasite-menu-open{display:block!important;position:static!important;padding:0;box-shadow:none}}"
  ].join("\n");
  output = output.replace(/\/\* CriaSite navigation accessibility v5 — controlador único \*\/[\s\S]*?(?=@media|<\/style>)/i, "");
  if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(output)) output = output.replace(/<\/style>/i, css + "\n</style>");
  else output = output.replace(/<\/head>/i, "<style>" + css + "</style></head>");
  const controller = [
    "(function(){function init(){",
    "var original=document.querySelector('" + selector + "');",
    "var nav=document.getElementById(original&&original.getAttribute('aria-controls'))||document.querySelector('header nav');",
    "if(!original||!nav||original.dataset.criasiteMenuV6)return;",
    "var button=original.cloneNode(true);button.removeAttribute('onclick');button.dataset.criasiteMenuV6='1';original.replaceWith(button);",
    "var list=nav.querySelector('ul')||nav;",
    "function setOpen(open){list.classList.toggle('active',!!open);list.classList.toggle('is-open',!!open);nav.classList.toggle('criasite-menu-open',!!open);button.setAttribute('aria-expanded',String(!!open));button.setAttribute('aria-label',open?'Fechar menu de navegação':'Abrir menu de navegação');}",
    "button.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();setOpen(button.getAttribute('aria-expanded')!=='true');});",
    "list.addEventListener('click',function(event){if(event.target&&event.target.closest&&event.target.closest('a'))setOpen(false);});",
    "document.addEventListener('keydown',function(event){if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}});",
    "document.addEventListener('click',function(event){if(button.getAttribute('aria-expanded')==='true'&&!nav.contains(event.target)&&!button.contains(event.target))setOpen(false);});",
    "setOpen(false);}",
    "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();"
  ].join("");
  output = output.replace(/<script>\s*\/\* CriaSite navigation accessibility v5 controller \*\/[\s\S]*?<\/script>/i, "");
  output = output.replace(/<\/body>/i, "<script>/* CriaSite navigation accessibility v6 controller */" + controller + "</script></body>");
  return output;
}

function enforceInternalAnchorIntegrity(html) {
  let output = String(html || "");
  const ids = new Set(Array.from(output.matchAll(/\bid=["']([^"']+)["']/gi), match => match[1]));
  const galleryId = (output.match(/<section\b[^>]*\bid=["']([^"']+)["'][^>]*class=["'][^"']*(?:gallery|galeria)[^"']*["']/i) || [])[1] ||
    (output.match(/<section\b[^>]*\bclass=["'][^"']*(?:gallery|galeria)[^"']*["'][^>]*\bid=["']([^"']+)["']/i) || [])[1];
  const referenceId = ["referencias", "portfolio", "projetos"].find(id => ids.has(id));
  const serviceId = ["servicos", "services", "sobre"].find(id => ids.has(id));
  const contactId = ["contato", "contact"].find(id => ids.has(id));
  output = output.replace(/\bhref=(["'])#([^"']+)\1/gi, (whole, quote, target) => {
    if (ids.has(target)) return whole;
    const key = target.toLowerCase();
    let fallback = "";
    if (/galeria|gallery|portfolio|projetos|referencias/.test(key)) fallback = galleryId || referenceId || serviceId;
    else if (/servic|service|modalidade|planos/.test(key)) fallback = serviceId || referenceId || contactId;
    else if (/contato|contact|whatsapp|agendar/.test(key)) fallback = contactId || serviceId || referenceId;
    else fallback = serviceId || referenceId || contactId || Array.from(ids).find(id => id !== "main-content");
    return fallback ? 'href=' + quote + '#' + fallback + quote : 'href=' + quote + '#main-content' + quote;
  });
  return output;
}

function qualityReport(quality) {
  const criticalPattern = /O menu mobile não controla a própria lista|O CSS do menu esconde os links|O contêiner nav permanece oculto|Arquitetura: a seção de serviços|Arquitetura: crie uma seção de referências|Arquitetura: o hero precisa|Documento sem idioma pt-BR|Há mais de um h1|Falta landmark main|Há link com href vazio|Há botão sem nome acessível|O FAQ promete contato, visita ou suporte de equipe|O menu não atualiza aria-expanded|O menu não fecha ao selecionar um link|O menu não fecha ao pressionar Escape|Há parágrafos repetidos entre seções|textos alternativos da galeria são genéricos|A galeria repete fotografias|A fotografia do hero está repetida na galeria|alegações comerciais ou técnicas não encontradas|O conteúdo apresenta alegações comerciais ou técnicas não encontradas|Há afirmações sobre equipe, equipamentos, instalações ou serviços|O conteúdo apresenta como fatos serviços|A imagem principal do hero desaparece no celular|HTML com estrutura inválida|IDs duplicados|Links internos sem destino|Falta meta viewport|Falta um título principal h1|Contato contém e-mail|chamada sem ação funcional|Foto principal do hero incompatível|Galeria usa fotos ausentes ou incompatíveis|WhatsApp fictício|WhatsApp informado pelo cliente precisa estar conectado|afirmações sobre equipe|afirmações comerciais específicas|afirmações não comprovadas|placeholder|instrução provisória|Formulário sem tratamento|Formulário bloqueia|Markdown visível|script externo|dependência externa/i;
  const majorPattern = /O menu mobile não controla a própria lista|O CSS do menu esconde os links|O contêiner nav permanece oculto|Arquitetura: a seção de serviços|Arquitetura: crie uma seção de referências|Arquitetura: o hero precisa|Galeria sem composição editorial|A galeria mantém imagens com altura fixa em celulares|Falta um segundo momento visual editorial além do hero|A fotografia do hero está repetida na galeria|A galeria não tem adaptação mobile específica|A imagem principal do hero desaparece no celular|Falta um rodapé completo|botão do menu móvel deve ficar oculto|menu não atualiza aria-expanded|menu não fecha ao selecionar|menu não fecha ao pressionar Escape|parágrafos repetidos|textos alternativos da galeria são genéricos|afirmações comerciais específicas|Poucas seções|Há seções demais|Seções superficiais|Profundidade editorial|Falta uma media query|adaptação responsiva|Galeria|Hero sem|direção de arte|composição|FAQ|Planos|modalidades|lista nav ul|menu móvel|Seção obrigatória|benefícios|manifesto|método|links sem destino/i;
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
    try {
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
    const businessInput = body.business && typeof body.business === "object" ? body.business : {};
    const business = { ...inferBusinessType(businessInput, prompt), userBrief: prompt };
    if (prompt.length < 15) return json({ error: "Descreva o site com pelo menos 15 caracteres." }, 400, origin);
    if (prompt.length > 5000) return json({ error: "A descrição deve ter no máximo 5.000 caracteres." }, 400, origin);

    const visualBrief = segmentVisualBrief(business.type);
    const instructions = `Você é uma equipe sênior de design UX/UI, desenvolvimento front-end, conversão e SEO. Veterinária, fisioterapia, odontologia e clínica médica são segmentos distintos: nunca reutilize imagens, descrições ou vocabulário entre eles. Veterinária exige contexto de atendimento animal; fisioterapia exige reabilitação e movimento; odontologia exige saúde bucal humana.  Crie um site comercial realmente profissional, rico e personalizado para o negócio descrito, em português do Brasil. Entregue SOMENTE um documento HTML completo começando com <!doctype html>, com CSS dentro de <style> e JavaScript puro dentro de <script>. Tudo deve funcionar em um único arquivo, sem frameworks, bibliotecas externas, fontes externas ou scripts de terceiros. Não faça uma página genérica curta. Para clínica veterinária, crie 8 a 12 seções reais e substanciais, incluindo serviços, diferenciais, galeria, FAQ e contato; nunca reduza o conteúdo a pilares genéricos. Para arquitetura, inclua serviços desenvolvidos em pelo menos três blocos, processo de projeto, referências visuais claramente identificadas como ilustrativas quando não forem obras comprovadas e CTA do hero para #servicos ou #contato; não transforme possibilidades em fatos comerciais. O hero precisa de CTA que leve a uma seção útil. Não invente serviços, especialidades, equipe, endereço, avaliações, preços, horários ou canais de contato. REGRA DE FIDELIDADE: não invente história de fundação, tempo de mercado, especialização, protocolos, estrutura física, instalações, equipamentos, equipe, processos internos, parcerias, prêmios ou resultados. Desejos descritos como 'quero', 'gostaria' ou 'inclua' são requisitos de design, não fatos sobre a empresa. Use como fatos somente os dados explicitamente fornecidos; apresente o restante como conteúdo educativo geral, possibilidade a confirmar ou omita.

${visualBrief}

DIREÇÃO DE ARTE E QUALIDADE VISUAL OBRIGATÓRIA: aja como um estúdio digital profissional. Não entregue apenas wireframe ou coleção de cards. O resultado deve parecer um site comercial pronto para apresentação ao cliente, com identidade visual própria, composição forte e acabamento consistente. Escolha um conceito visual específico do segmento e mantenha consistência em cores, tipografia, formas, ícones e fotografia/ilustração. Não entregue template genérico. Crie um sistema visual autoral com paleta limitada, tipografia expressiva, escala tipográfica consistente, largura controlada e respiro generoso. Varie deliberadamente as composições: uma seção editorial assimétrica, uma faixa de contraste, uma seção com número/dado apenas se fornecido, uma galeria em mosaico e uma seção de encerramento memorável. Evite repetir três cards lado a lado em seções consecutivas. Use bordas, linhas, recortes, sobreposições e fundos alternados com moderação. Cada seção deve ter uma hierarquia visual própria e parecer parte da mesma marca. HERO: layout assimétrico, título grande com quebra intencional, etiqueta curta e CTA principal. Use uma das fotografias exatas do bloco de segmento como imagem dominante do hero, com recorte editorial e tratamento visual premium; SVG/CSS é apenas detalhe complementar, nunca substitui a foto. Crie pelo menos DOIS momentos visuais memoráveis além do hero: mosaico assimétrico com quatro fotografias reais ilustrativas do segmento; faixa editorial de destaque; timeline desenhada; manifesto tipográfico ou composição especial de serviços. Não use a mesma grade de cartões em todas as seções. Não substitua fotografias por painéis SVG; use ilustrações vetoriais apenas como apoio visual. Use ícones SVG coerentes, estados hover/focus e microinterações discretas. Evite excesso de gradientes, emojis como ícones principais, sombras pesadas e bordas em todos os elementos. O resultado deve ter acabamento autoral e excelente adaptação a desktop e celular. Use prioritariamente as cinco URLs Unsplash selecionadas no bloco DIREÇÃO VISUAL ESPECÍFICA DO SEGMENTO como imagens reais ilustrativas no hero e na galeria; não substitua essas fotos por quatro SVGs esquemáticos. SVG/CSS pode complementar a direção de arte, não substituir as fotografias. NÃO use via.placeholder.com, placehold.co, placekitten.com, URLs inventadas ou imagens quebradas. Nunca use e-mail fictício como contato@nomedonegocio.com, contato@powerfit.com ou exemplo@example.com. Se não houver telefone/WhatsApp/e-mail real fornecido, não crie mailto, tel ou botão de contato falso: use uma chamada editorial neutra sem ação enganosa. Se houver WhatsApp informado, use exatamente esse número em https://wa.me/NUMERO. Se usar imagem remota, ela deve ser uma URL pública real e estável que você conheça; caso contrário, não use imagem remota. O resultado deve ser visualmente rico e excelente em desktop e celular. Não basta cumprir contagem de seções: nenhuma seção pode ser apenas um título e uma frase genérica. Desenvolva cada seção com um bloco informativo específico, exemplos de opções/etapas quando cabíveis e hierarquia visual própria. Em serviços/modalidades, apresente somente opções explicitamente descritas nos dados fornecidos. Se nenhuma modalidade foi informada, não invente nomes de aulas, técnicas ou serviços: crie uma seção editorial explicando critérios gerais para conhecer as opções, sem sugerir que são oferecidas pelo negócio. O hero deve empilhar texto e arte no celular, mantendo a fotografia visível; nunca esconda a imagem principal com display:none. A seção de contato sem dados confirmados deve ser um encerramento editorial profissional e atraente, com convite neutro para conhecer o negócio. Não escreva “a configurar”, “adicionar contato”, “canais serão adicionados” nem qualquer instrução técnica visível; não invente telefone, e-mail ou WhatsApp. Em telas pequenas, o menu deve abrir como painel vertical legível; a própria lista nav ul deve usar display:flex e flex-direction:column, com links empilhados, espaçamento de toque adequado, fundo sólido e z-index correto; nunca deixe links em linha espremida ou sobrepostos. O botão deve atualizar aria-expanded e aria-controls, fechar ao selecionar link e ao pressionar Escape. Implemente EXATAMENTE um controlador de menu; não crie listeners concorrentes nem dois scripts que alternem o mesmo estado. A camada final deve impedir handlers conflitantes. Inclua :focus-visible em links, botões e campos. PROIBIDO deixar retângulos pretos/cinzas vazios ou caixas que pareçam imagens ausentes: crie uma ilustração SVG/CSS completa dentro delas, ou remova o bloco e reorganize o layout. Nunca deixe navegação escondida no celular sem botão hambúrguer acessível e funcional. Não publique preços como R$ XXX,XX nem frases como 'unidade a definir'; se os dados faltarem, omita-os ou use um aviso de edição discreto que não pareça conteúdo final.

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

    let html = enforceInternalAnchorIntegrity(enforceBeautyFinalPolish(enforceArchitectureFinalPolish(enforceNavigationAccessibility(enforceResponsiveLayout(enforceSegmentPhotography(enforceContactIntegrity(enforceBusinessIntegrity(polishHtml(extractHtml(result)), business), business), business))), business)));
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
        "REGRA DE FIDELIDADE COMERCIAL: não invente história da empresa, anos de experiência, especialidades, protocolos, equipe, instalações, equipamentos, parcerias, prêmios, certificações, clientes, projetos executados ou resultados. Desejos do usuário são requisitos do site, não fatos existentes. Só trate como fato aquilo que estiver explicitamente nos dados fornecidos. Conteúdo não confirmado deve ser educativo e neutro, ou removido.",
        "INTEGRIDADE SEMÂNTICA: veterinária, fisioterapia, odontologia e clínica médica são segmentos distintos. Em veterinária, use cães/gatos e consulta veterinária; nunca cadeira odontológica, dentista ou saúde bucal. Em fisioterapia, use reabilitação, movimento e exercício terapêutico; nunca vocabulário odontológico, veterinário ou de academia. Em odontologia, use saúde bucal humana. Não misture bancos de imagens e descreva corretamente cada foto.",
        "DIREÇÃO DE ARTE: reconstrua como estúdio digital profissional. Antes de escrever, defina um conceito visual específico, uma paleta curta, uma escala tipográfica e uma composição própria. A primeira dobra deve ter impacto e hierarquia; alterne seções editoriais, mosaicos, faixas e listas visuais. Não repita o mesmo cartão em todas as seções. Cada seção deve parecer desenhada para este negócio, não um template trocando cores. Não use emoji como ícone principal, nem formas aleatórias para fingir fotografia. Use a primeira URL de fotografia selecionada no visualBrief no hero e as quatro URLs seguintes, distintas, na galeria; SVG/CSS complementa, mas não substitui essas fotos.",
        visualBrief,
        "SEÇÕES OBRIGATÓRIAS: para academia entregue exatamente 10 elementos <section> reais, nesta ordem: hero, sobre, modalidades, benefícios, método/etapas, galeria, planos, manifesto/filosofia, FAQ e contato. Para clínica veterinária entregue de 8 a 12 seções reais, incluindo obrigatoriamente hero, sobre, serviços (id=servicos), diferenciais (id=diferenciais), galeria (id=galeria), FAQ (id=faq) e contato (id=contato). Para arquitetura, entregue de 8 a 12 seções com hero, sobre, serviços (id=servicos), referências visuais/portfólio (id=portfolio), processo, princípios, FAQ, galeria e contato. A seção serviços deve ter no mínimo três blocos com descrições específicas, mas só trate como serviços oferecidos aquilo que o cliente confirmou; quando não houver dados, explique etapas e possibilidades de projeto como conteúdo informativo. O portfólio deve ter pelo menos três itens de referências visuais, claramente rotulados como imagens ilustrativas quando não forem obras reais; nunca invente nome de cliente, obra, endereço, cidade, metragem, orçamento ou resultado. O hero deve ter um CTA visível e funcional para #servicos ou #contato. A seção de serviços deve desenvolver pelo menos três áreas de cuidado em textos úteis, sem inventar procedimentos, especialidades, exames, equipe, equipamentos, endereço, preços ou horários. A seção de diferenciais deve apresentar princípios e abordagem, não fatos não fornecidos. O hero deve ter CTA funcional para #servicos ou #contato. Para outros segmentos, entregue 8 a 12 seções úteis. Não omita nem funda seções. Cada seção precisa ter conteúdo desenvolvido, id próprio e composição visual variada.",
        "SEGMENTO ACADEMIA: use linguagem visual esportiva premium. A primeira fotografia selecionada no visualBrief deve ser usada exclusivamente no hero. As quatro fotografias seguintes devem ser usadas exclusivamente na galeria, sem repetição entre si ou com o hero. As fotos são referências ilustrativas, não prova de que a academia possui os equipamentos ou espaços mostrados. Use alt descritivo e não invente instalações próprias.",
        "HERO: composição editorial assimétrica, título grande com quebra intencional, etiqueta curta, CTA destacado e uma das fotografias exatas do visualBrief como imagem principal. Em celular, mantenha a foto visível e empilhe o texto e a imagem em uma coluna; não use display:none na imagem do hero. Use camadas, recortes, escala e profundidade; SVG inline pode complementar, mas não substituir a fotografia.",
        'O hero deve usar uma das quatro fotografias exatas do visualBrief. Se adicionar SVG, ele é apenas um detalhe complementar, não um requisito nem substituto da foto.',
        "GALERIA: crie quatro painéis fotográficos usando exatamente as quatro URLs de galeria do visualBrief (segunda até quinta URL). As quatro imagens devem ser diferentes entre si e diferentes da foto do hero. Use mosaico assimétrico com um painel de destaque e três complementares, object-fit:cover, aspect-ratio variado, recortes editoriais e legendas curtas. No mobile, ajuste altura e proporções para evitar imagens excessivamente altas ou cortes ruins. Cada img deve ter alt iniciando por 'Imagem ilustrativa'. Não substitua fotos por ícones, SVGs, círculos ou quadrados. Nunca use caixas vazias com rótulos.",
        'SVGs decorativos não contam como fotografias e não devem substituir os quatro painéis fotográficos exigidos.',
        "VARIEDADE: entre 9 e 12 seções úteis, com pelo menos seis seções realmente desenvolvidas (150+ caracteres de conteúdo útil cada, sem contar código SVG). Para academia, não omita benefícios, método/etapas e manifesto/filosofia da marca. Inclua pelo menos dois momentos visuais memoráveis além do hero: mosaico assimétrico, faixa editorial, timeline ou manifesto tipográfico. Evite repetir cartões iguais.",
        "CONTEÚDO: nenhuma seção pode ficar em título + frase genérica. A seção obrigatória planos não obriga a criar produtos: sem planos explicitamente informados, use conteúdo editorial sobre critérios de avaliação, nunca pacotes fictícios. Não invente benefícios, serviços inclusos, avaliações, suporte, descontos, consultoria, acompanhamento, horários, estrutura física, modalidades, tipos de plano, técnicas, metodologias, resultados, certificações, equipamentos ou políticas comerciais. Trate somente os dados fornecidos pelo cliente como fatos. O restante deve ser apresentado como orientação geral, possibilidade a confirmar ou omitido. Nunca transforme uma sugestão criativa em afirmação sobre o negócio. Não invente planos mensal, trimestral, anual, nomes comerciais, vantagens ou condições se isso não estiver explicitamente nos dados do cliente. Se não houver planos informados, transforme a seção em “Como escolher” com três blocos informativos neutros (objetivo, frequência desejada e condições a consultar), sem apresentá-los como produtos ou planos já vendidos. Em serviços/modalidades, só liste opções fornecidas; se não houver, explique de forma geral como conhecer as opções, sem afirmar que são oferecidas. Não crie condições comerciais fictícias para preencher cards. Desenvolva somente os serviços e modalidades que o cliente informou. Se não houver lista, escreva conteúdo educativo neutro sem sugerir que a empresa oferece modalidades específicas. Na seção planos, não crie nomes, cards de venda, itens inclusos, vantagens ou preços sem confirmação explícita. Se não houver planos informados, use uma seção editorial “Como avaliar as opções”, sem apresentar categorias fictícias como produtos existentes. Na FAQ, crie no mínimo cinco perguntas em details/summary, mas NÃO invente idade mínima, horários, regras de cancelamento, exigência de toalha, políticas ou condições operacionais. Se esses dados não foram fornecidos, faça perguntas neutras sobre conhecer serviços, escolher modalidade ou iniciar uma conversa.",
        "CONTATO: crie uma seção final com composição própria. Se houver WhatsApp real informado, o CTA principal do hero e o CTA da seção contato devem abrir esse número em https://wa.me/ com mensagem inicial contextual. Se não houver canal real informado, o CTA principal do hero deve levar a uma seção informativa real como #sobre, com texto “Conheça a proposta”, nunca sugerir contato ou disponibilidade. Se não houver canal real informado, não use botão visual, span estilizado, link vazio nem CTA com aparência clicável na seção de contato. Use apenas texto editorial claro, por exemplo “Para informações sobre disponibilidade e condições, consulte os canais oficiais do negócio”, sem fingir que existe um canal nesta página. O CTA do hero pode apontar para #contato, mas a seção final não pode simular WhatsApp ou formulário. Se houver WhatsApp no cadastro, use exatamente https://wa.me/ seguido dos dígitos fornecidos, com mensagem inicial contextual. Se não houver canal real, não invente e-mail, telefone, formulário ou botão; encerre com convite editorial sem ação enganosa. Nunca simule envio ou agendamento.",
        "RESPONSIVIDADE: se hero usar duas colunas no desktop, crie regra mobile explícita para empilhar texto e ilustração em uma coluna; revise grids e tipografia para telas estreitas. A galeria deve ter regra mobile própria: uma coluna em telas muito estreitas ou duas colunas fluidas, imagens com altura proporcional, sem overflow horizontal e sem esconder a fotografia. Não use minmax(300px, 1fr), min-width:300px ou larguras fixas em cards; prefira minmax(0,1fr) e minmax(min(100%, 16rem), 1fr).",
        'FOTOGRAFIA: confira se as quatro URLs da galeria correspondem exatamente ao segmento solicitado; não reutilize fotos de outro ramo comercial.',
        "ACABAMENTO: tipografia hierárquica, espaçamento generoso, grid consistente, contraste, ícones SVG coerentes, microinterações discretas e visual profissional em desktop e celular. Em desktop, esconda o botão hamburger/menu-toggle; mostre-o somente no breakpoint mobile. Inclua rodapé real com nome da marca, ano dinâmico ou aviso institucional discreto e links internos que existam. Nunca mostre um controle de menu duplicado no desktop. Use pelo menos dois layouts de seção diferentes, cards de planos somente quando planos reais tiverem sido informados; caso contrário, composição editorial sem produtos fictícios, galeria em mosaico e manifesto com composição tipográfica. Evite fundo escuro idêntico em todas as seções, cartões repetidos e textos genéricos como “transforme seu corpo” sem explicar como.",
        "MOBILE: menu em painel vertical, fundo sólido, position fixed/absolute, z-index alto. Use um único controlador JS de menu, sem handlers duplicados ou alternância dupla; aria-expanded deve refletir exatamente o estado visual. A lista nav ul (não apenas o elemento nav) deve usar display:flex e flex-direction:column, com links empilhados, espaçamento e boa área de toque. Botão com aria-label, aria-controls e aria-expanded atualizado. Fechar ao clicar em qualquer link e ao pressionar Escape. Nav com aria-label, :focus-visible e prefers-reduced-motion.",
        "FAQ acessível com details/summary ou botões que atualizem aria-expanded. Formulário só se houver destino real; caso contrário, remova-o e deixe aviso discreto sem campos nem botão falso.",
        "INTEGRIDADE: remova afirmações não comprovadas sobre instalações, equipamentos, equipe, certificações, tecnologia, atendimento, reputação ou resultados. Não invente endereço, telefone, horário, preço, avaliações, depoimentos, clientes ou credenciais. Não use placeholders, colchetes, imagens quebradas, URLs aleatórias, alertas falsos ou mensagens de sucesso falsas.",
        "Mantenha links internos válidos, IDs únicos, HTML semântico, title, meta description e responsividade.",
        "Problemas detectados que precisam ser corrigidos, em ordem de prioridade:\n- " + quality.issues.join("\n- ") + "\nNão invente dados comerciais para satisfazer verificações. Não remova funcionalidades existentes. Se um dado não foi fornecido, omita-o ou use conteúdo editorial neutro.",
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
          const candidate = enforceInternalAnchorIntegrity(enforceBeautyFinalPolish(enforceArchitectureFinalPolish(enforceNavigationAccessibility(enforceResponsiveLayout(enforceSegmentPhotography(enforceContactIntegrity(enforceBusinessIntegrity(polishHtml(extractHtml(repairResult)), business), business), business))), business)));
          if (candidate && /^<!doctype html/i.test(candidate) && /<html[\s>]/i.test(candidate) && candidate.length >= 500) {
            const candidateQuality = inspectHtml(candidate, business);
            const weight = issue => /IDs duplicados|Links internos sem destino|Seções superficiais|Estrutura incompleta|Seção obrigatória ausente|Galeria da academia|afirmações sobre equipe|lista nav ul|Seção de modalidades|Contato ainda parece|Hero sem composição detalhada|adaptação responsiva comprovada/i.test(issue) ? 30 : 12;
            const score = q => q.issues.reduce((total, issue) => total + weight(issue), 0) + Math.max(0, 8 - q.sections) * 12 + Math.max(0, q.sections - 12) * 12;
            const originalScore = score(quality);
            const candidateScore = score(candidateQuality);
            // Só bloqueia falhas estruturais graves. Avisos editoriais/visuais continuam
            // sendo contabilizados, mas não devem descartar uma reconstrução claramente melhor.
            const criticalPatterns = /A galeria repete fotografias|A fotografia do hero está repetida na galeria|O conteúdo apresenta alegações comerciais ou técnicas não encontradas|Há afirmações sobre equipe, equipamentos, instalações ou serviços|Galeria incompleta: use pelo menos quatro fotografias|Galeria precisa conter quatro fotografias|Documento sem idioma pt-BR|Há mais de um h1|Falta landmark main|Há link com href vazio|Há botão sem nome acessível|HTML com estrutura inválida|IDs duplicados|Links internos sem destino|Falta meta viewport|Falta um título principal h1|Poucas seções|Há seções demais|FAQ superficial|FAQ precisa de cinco perguntas|A seção planos apresenta opções comerciais sem dados confirmados|Planos sem hierarquia visual|FAQ contém regras|chamada promete agendamento|Markdown visível|largura mínima rígida|Seções superficiais|Estrutura incompleta para academia|Estrutura de academia incorreta|dez seções da academia precisam seguir a ordem|Seção obrigatória ausente|lista nav ul|links da lista de navegação|Seção de modalidades\/serviços sem opções|Galeria incompleta ou esquemática|Galeria da academia não comprova|Hero sem composição detalhada|Foto principal do hero incompatível|Galeria usa fotos ausentes ou incompatíveis|Contato contém e-mail ou domínio fictício|WhatsApp informado pelo cliente precisa estar conectado/;
            const candidateHasRequiredArt = !candidateQuality.issues.some(issue => /A galeria precisa de quatro painéis|Galeria sem quatro ilustrações|Galeria incompleta ou esquemática|Galeria incompleta: use pelo menos quatro fotografias|Galeria repete fotografias|fotografia do hero está repetida|fotos ausentes ou incompatíveis|Remova SVGs esquemáticos da galeria|Galeria da academia não comprova|Hero sem composição detalhada/.test(issue));
            const candidateHasNoCriticalIssues = !candidateQuality.issues.some(issue => criticalPatterns.test(issue));
            const improvement = originalScore - candidateScore;
            // A reconstrução não deve ser descartada só porque a pontuação estática
            // empatou: a validação estrutural e visual é o critério decisivo.
            const currentReport = qualityReport(quality);
            const candidateReport = qualityReport(candidateQuality);
            const candidateIsValid = candidateQuality.sections >= 8 &&
              candidateQuality.sections <= 12 &&
              candidateHasNoCriticalIssues &&
              candidateHasRequiredArt &&
              candidateReport.readyForClient;
            const candidateImproves = candidateReport.score > currentReport.score &&
              (candidateReport.criticalCount < currentReport.criticalCount ||
               (candidateReport.criticalCount === 0 && currentReport.criticalCount === 0)) &&
              candidateReport.majorCount <= currentReport.majorCount;
            // Só aceita uma reconstrução quando a nota objetiva melhora (ou empata sem piorar falhas críticas).
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
    } catch (error) {
      return json({
        error: "O Worker encontrou um erro interno ao processar a geração.",
        detail: String(error?.message || error).slice(0, 240)
      }, 500, origin);
    }
  }
};
