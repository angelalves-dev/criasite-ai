CRIASITE AI — CONFIGURAÇÃO E PUBLICAÇÃO
========================================

O criador de modelos, prévia e download HTML funciona no GitHub Pages. A geração com IA precisa de um pequeno serviço seguro externo. A chave da IA NÃO deve ser colocada no index.html nem em qualquer arquivo público do GitHub.

O QUE JÁ ESTÁ NO REPOSITÓRIO
- Página principal responsiva.
- 12 modelos clicáveis para tipos de negócio.
- Prévia do site gerado e download HTML.
- Botões para o portfólio e WhatsApp.
- worker.js: backend pronto para usar a API Gemini com uma chave guardada como segredo.
- Esta documentação para configurar a integração.

PARTE 1 — CRIAR UMA CHAVE DE IA
1. Entre no Google AI Studio e crie uma API key: https://aistudio.google.com/apikey
2. Guarde a chave em local privado. Não a envie em conversas nem a publique no GitHub.
3. A disponibilidade, limites e cobrança da API dependem das condições atuais da conta e do provedor.

PARTE 2 — PUBLICAR O WORKER SEGURO
1. Entre em https://dash.cloudflare.com/ e crie/acesse sua conta.
2. Abra Workers & Pages e crie um Worker.
3. Copie o conteúdo do arquivo worker.js deste repositório para o editor do Worker e publique.
4. Nas configurações do Worker, adicione um segredo/secret com o nome exato GEMINI_API_KEY e cole sua chave da IA.
5. Opcional: adicione uma variável GEMINI_MODEL com o nome do modelo Gemini disponível para sua conta. O padrão atual do código é gemini-3.1-flash-lite; confirme no Google AI Studio quais modelos estão disponíveis para sua chave.
6. Publique e copie a URL pública do Worker (por exemplo, https://nome-do-worker.seu-subdominio.workers.dev).

PARTE 3 — CONECTAR A PÁGINA AO WORKER
1. No GitHub, abra index.html e clique no lápis para editar.
2. Procure esta linha:
   const AI_API_URL = "COLE_AQUI_URL_DO_WORKER";
3. Substitua somente o texto COLE_AQUI_URL_DO_WORKER pela URL pública do seu Worker, mantendo as aspas.
4. Salve/commit a alteração na branch main.
5. Abra https://angelalves-dev.github.io/criasite-ai/ e atualize com Ctrl+F5.
6. Teste a geração com uma descrição de site de pelo menos 15 caracteres.

SEGURANÇA E LIMITAÇÕES
- Nunca coloque a GEMINI_API_KEY no HTML, no JavaScript do navegador ou em um repositório público.
- O Worker só aceita chamadas POST e restringe o CORS à página do CriaSite AI. CORS não substitui autenticação e não impede todos os tipos de abuso; acompanhe o uso e os limites do provedor.
- A geração de IA NÃO fica ativa apenas por enviar worker.js ao GitHub. É necessário publicar o Worker, configurar o segredo e preencher a URL no index.html.
- Se receber erro de limite, aguarde e tente novamente mais tarde; não faça várias solicitações seguidas.
- Antes de publicar um site para um cliente, revise informações, preços, contatos, links e direitos sobre imagens/conteúdo.
- O CriaSite AI não publica automaticamente os sites gerados na internet; o download produz um arquivo HTML para revisar e publicar separadamente.

REPOSITÓRIO
https://github.com/angelalves-dev/criasite-ai

SITE
https://angelalves-dev.github.io/criasite-ai/

PORTFÓLIO
https://angelalves-dev.github.io/meu-portfolio/

CONTATO
https://wa.me/5592992619679
