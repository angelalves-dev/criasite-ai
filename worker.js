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
  if (sections < 8) issues.push('Poucas seções: crie pelo menos 8 seções úteis, específicas e sem repetição.');
  if (!/<meta\s+name=["']viewport["']/i.test(html)) issues.push('Falta meta viewport para celular.');
  if (!/<title>\s*[^<]+<\/title>/i.test(html) || !/<meta\s+name=["']description["']/i.test(html)) issues.push('Complete title e meta description para SEO básico.');
  if (!/@media\s*\(/i.test(html)) issues.push('Falta CSS responsivo com media query.');
  if (!/<nav\b/i.test(html) || !/<header[\s\S]*?<nav\b/i.test(html)) issues.push('Falta navegação semântica nav dentro do cabeçalho.');
  if (!/aria-expanded|aria-label=["'][^"']*(menu|navega)|menu-toggle|nav-toggle|hamburger/i.test(html)) issues.push('Adicione um controle acessível e funcional para o menu móvel.');
  if (/perguntas frequentes|\bfaq\b|d[uú]vidas frequentes/i.test(html) && !/aria-expanded|<details\b|addEventListener\s*\(\s*["']click|onclick=/i.test(html)) issues.push('FAQ sem interação aparente para abrir e fechar respostas.');
  if (/<form\b/i.test(html) && !/addEventListener\s*\(\s*["']submit|onsubmit=|mailto:|wa\.me\//i.test(html)) issues.push('Formulário sem tratamento de envio aparente; não finja que enviou dados.');
  if (/<form\b/i.test(html) && /onsubmit\s*=\s*["'][^"']*return\s+false|type\s*=\s*["']button["'][^>]*onclick\s*=\s*["'][^"']*alert/i.test(html)) issues.push('Formulário bloqueia o envio ou usa alerta falso; remova-o ou configure um destino real.');
  if (/<form\b/i.test(html) && !/<label\b/i.test(html)) issues.push('Formulário sem labels acessíveis; associe label e id a cada campo.');
  if (broken.length) issues.push('Links internos sem destino: ' + broken.slice(0, 6).map(id => '#' + id).join(', '));
  if (/<img\b/i.test(html) && /<img\b(?![^>]*\balt=)/i.test(html)) issues.push('Adicione alt às imagens.');
  if (/via\.placeholder\.com|placehold\.co|placekitten\.com/i.test(html)) issues.push('Remova imagens de placeholder que podem falhar; use composição visual em CSS ou imagens reais fornecidas e estáveis.');
  if (/©\s*202[0-5]\b/i.test(html)) issues.push('Atualize o ano antigo do rodapé dinamicamente com JavaScript ou use o ano atual.');
  if (/perguntas frequentes|\bfaq\b|d[uú]vidas frequentes/i.test(html) && !/aria-expanded/i.test(html) && !/<details\b/i.test(html)) issues.push('Torne as perguntas frequentes acessíveis com details/summary ou aria-expanded nos botões.');
  if (/<form\b/i.test(html) && /placeholder=/i.test(html) && !/<label\b/i.test(html)) issues.push('Adicione labels acessíveis aos campos do formulário; placeholder não substitui label.');
  if (/<form\b/i.test(html) && /enviado com sucesso|mensagem enviada|formulário enviado/i.test(html) && !/wa\.me\/|mailto:/i.test(html)) issues.push('O formulário aparenta confirmar envio sem um destino real; substitua por aviso claro de demonstração/configuração necessária.');
  if ((html.includes("wa.me/") || html.includes("api.whatsapp.com/send")) && /00000000000|123456789|5511999999999|55555555555/i.test(html)) issues.push('Link de WhatsApp com número fictício; remover o link e orientar configuração de número real.');
  if (/monitoramento 24.?h|climatiza[cç][aã]o|profissionais certificados|mais de [0-9]+ clientes|milhares de alunos/i.test(html)) issues.push('Possíveis alegações comerciais não fornecidas; remover ou marcar como conteúdo editável.');
  if (sections >= 8 && !/svg|<img|background-image|linear-gradient/i.test(html)) issues.push('Composição visual pouco rica; adicionar ilustrações próprias em CSS/SVG, sem placeholders.');
  if (sections >= 8 && (html.match(/class=["'][^"']*card[^"']*["']/gi) || []).length >= 6 && !/svg/i.test(html)) issues.push('Layout repetitivo de cartões; variar a composição das seções e adicionar detalhes gráficos.');
  if (!/<h1\b/i.test(html)) issues.push('Falta um título principal h1 claro no hero.');
  if (!/<nav\\b[^>]*aria-label|<nav\\b[^>]*aria-labelledby/i.test(html)) issues.push('Identifique a navegação principal com aria-label ou aria-labelledby.');
  if (/menu-toggle|nav-toggle|hamburger/i.test(html) && !/aria-controls=/i.test(html)) issues.push('Associe o botão do menu à navegação usando aria-controls.');
  if (/menu-toggle|nav-toggle|hamburger/i.test(html) && !/keydown|key\s*===?\s*["']escape["']|keycode\s*===?\s*27/i.test(html)) issues.push('O menu móvel deve fechar também ao pressionar Escape.');
  if (/menu-toggle|nav-toggle|hamburger/i.test(html) && !/addEventListener\s*\(\s*["']click["'][\s\S]{0,1200}(?:querySelectorAll|querySelector)\s*\(\s*["']a|\.addEventListener\s*\(\s*["']click["']/i.test(html)) issues.push('Confira se os links do menu fecham o painel após a navegação.');
  if (/id=["'](?:galeria|gallery|portfolio|estrutura)["']/i.test(html) && /gallery-item[^}]*background:\s*(?:#(?:111|121212|1a1a1a|222)|var\(--surface\))/i.test(html) && !/<svg\b|<img\b|background-image\s*:/i.test(html)) issues.push('A galeria parece conter caixas vazias; substitua-as por ilustrações SVG/CSS originais com composição visual real.');
  if (/hero/i.test(html) && /width:\s*300px[\s\S]{0,100}height:\s*300px[\s\S]{0,100}border:\s*20px/i.test(html)) issues.push('O hero usa apenas um quadrado decorativo simples; crie uma composição editorial mais marcante com SVG/CSS original, camadas e detalhes.');
  if (!/prefers-reduced-motion/i.test(html) && /scroll-behavior\s*:\s*smooth/i.test(html)) issues.push('Respeite prefers-reduced-motion para usuários que reduzem animações.');
  if (/@media\\s*\\(max-width:\\s*(?:768|767|800|900)px\\)/i.test(html) && /nav\\s*\\{[^}]*display\\s*:\\s*none/i.test(html) && !/nav(?:\\.active|\\[aria-expanded=["']true["']\\])\\s*\\{/i.test(html)) issues.push('Menu mobile pode ficar oculto sem regra de abertura consistente.');
  if (/<section\\b[^>]*(?:galeria|gallery|portfolio|estrutura)/i.test(html) === false && !/id=["'](?:galeria|gallery|portfolio|estrutura)["']/i.test(html)) issues.push('Considere uma seção visual de galeria, portfólio ou estrutura quando fizer sentido para o segmento.');
  if (/equipamentos de última geração|equipamentos de ponta|estrutura de ponta|tecnologia de ponta|instrutores acompanham|profissionais certificados|manutenção constante|atendimento personalizado|resultados garantidos|líder no mercado|referência na região/i.test(html)) issues.push('Revise afirmações comerciais específicas não comprovadas pelos dados fornecidos; remova ou reescreva sem promessas ou fatos inventados.');
  if (/\[[^\]]{2,80}\]|\b(?:inserir|adicionar|informar)\s+(?:aqui|horário|endereço|telefone|preço|valor)\b|(?:endereço|telefone|horário)\s+a\s+definir/i.test(html)) issues.push('Há placeholders ou instruções provisórias visíveis; remova-os. Quando faltar um dado comercial, omita-o ou use texto neutro como “Consulte a equipe”, sem colchetes.');
  if (/<button[^>]*(?:menu|nav)[^>]*>/i.test(html) && !/addEventListener\s*\(\s*["']click|onclick=/i.test(html)) issues.push('Botão de menu sem comportamento de clique identificável.');
  if (/onsubmit=["']return false;?["']/i.test(html)) issues.push('Formulário bloqueia o envio; substituir por contato funcional ou aviso claro de demonstração.');
  if (/href=["']#contato["']/i.test(html) && !/id=["']contato["']/i.test(html)) issues.push('CTA aponta para #contato, mas a seção de contato não existe.');
  if (/<button\b/i.test(html) && !/:focus-visible|:focus\b/i.test(html)) issues.push('Adicione estados de foco visíveis para navegação por teclado.');
  if (/R\$\s*(?:XXX|X{2,}|0{2,}|\[.*?pre[cç]o.*?\])/i.test(html)) issues.push('Há preços provisórios como R$ XXX; remova os preços ou use apenas valores informados pelo cliente.');
  if (/unidade a definir|endereço a definir|telefone a definir|inserir telefone|adicionar telefone/i.test(html)) issues.push('Há campos de configuração visíveis no rodapé; remover do site publicado ou apresentar uma instrução de edição discreta.');
  if (/display\s*:\s*none/i.test(html) && /nav-links|navlinks|menu-links|navigation-links/i.test(html) && !/menu-toggle|nav-toggle|hamburger|aria-expanded/i.test(html)) issues.push('A navegação pode desaparecer no celular sem um menu alternativo funcional.');
  if (/alert\s*\(.*(?:pronto para integração|configure o endpoint|não configurado)/i.test(html)) issues.push('O formulário ainda é apenas demonstrativo; deixe isso claro e ofereça um caminho de contato funcional se houver dados reais.');

  return { sections, issues: issues.slice(0, 12) };
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
      const repairPrompt = "Você é diretor de arte digital e engenheiro front-end sênior. Melhore substancialmente o HTML abaixo e devolva SOMENTE o documento completo começando por <!doctype html>, sem markdown. Não faça apenas uma correção superficial. Crie direção de arte personalizada e visivelmente premium. HERO: construa uma composição marcante, não um quadrado vazio ou forma geométrica solta; use SVG inline original com silhuetas/linhas/elementos relacionados ao segmento, camadas, tipografia editorial e CTA. GALERIA: nunca use caixas vazias com palavras como ÁREA PESOS, CARDIO ou FUNCIONAL; crie 3-5 painéis ilustrados diferentes com SVG/CSS originais, cada um com formas, detalhes e legenda visual integrada. MENU MOBILE: painel fixo/absoluto com fundo sólido, z-index alto, links empilhados verticalmente e espaçamento de toque; botão atualiza aria-expanded e aria-controls; ao clicar em qualquer link fecha o menu e restaura aria-expanded=false; pressionar Escape também fecha; não deixe nav ou ul em linha no celular. Adicione estados :focus-visible e respeite prefers-reduced-motion. Crie pelo menos dois momentos visuais memoráveis além do hero, com layouts variados e sem repetir cartões. Faça auditoria das afirmações comerciais: qualquer alegação sobre instalações, equipamentos, equipe, certificações, resultados, tecnologia, atendimento ou reputação que não esteja nos dados deve ser removida ou convertida em linguagem neutra. O cabeçalho deve conter <nav> semântico. Se não houver destino real de contato, remova o formulário e use aviso de demonstração sem botão de envio. Não invente fotos nem URLs externas. Corrija obrigatoriamente estes problemas: \\n- " +
        quality.issues.join("\\n- ") +
        "\\nNão invente endereço, telefone, preços, avaliações, depoimentos, certificações, instalações ou resultados. Sem WhatsApp real fornecido, não crie link wa.me; indique que o número precisa ser configurado. Não use imagens placeholder nem URLs aleatórias. Garanta responsividade, menu acessível, links internos válidos, FAQ acessível e não finja que backend existe. O resultado deve ficar visivelmente mais elaborado que o original. Pedido original: \\n" + prompt + "\\nHTML a melhorar:\\n" + html;
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
            if (candidateScore < originalScore) {
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
