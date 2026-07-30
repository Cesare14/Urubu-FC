var LEGAL_CONTENT={
  privacy:{
    title:'Política de Privacidade',
    body:`<h3>1. Informações que Coletamos</h3>
Esta plataforma utiliza armazenamento local (<em>localStorage</em>) exclusivamente no seu navegador para salvar as configurações do elenco, escalações e metas de mercado. Nenhuma informação pessoal é coletada, transmitida ou armazenada em servidores externos.
<h3>2. Cookies e Tecnologias de Rastreamento</h3>
Utilizamos cookies estritamente necessários para o funcionamento da plataforma. Podemos utilizar ferramentas de análise agregada (como Google Analytics) para compreender padrões de uso sem identificar usuários individualmente. Ao aceitar, você consente com o uso de cookies analíticos.
<h3>3. Publicidade</h3>
Esta plataforma não exibe anúncios publicitários.
<h3>4. Seus Direitos (LGPD)</h3>
Nos termos da Lei nº 13.709/2018 (LGPD), você tem direito a: acessar, corrigir e excluir seus dados. Como todos os dados são armazenados localmente no seu navegador, você pode limpá-los a qualquer momento pelo gerenciador de armazenamento do navegador.
<h3>5. Contato</h3>
Dúvidas sobre esta política podem ser enviadas para: <em>privacidade@urubufc.com.br</em>`
  },
  terms:{
    title:'Termos de Uso',
    body:`<h3>1. Aceitação dos Termos</h3>
Ao acessar e utilizar a plataforma Urubu FC, você concorda com estes Termos de Uso. Caso não concorde, por favor, não utilize a plataforma.
<h3>2. Descrição do Serviço</h3>
A plataforma Urubu FC é uma ferramenta de gestão de elenco de futebol destinada a fins recreativos e informativos. Todos os dados inseridos são de responsabilidade exclusiva do usuário.
<h3>3. Uso Permitido</h3>
É permitido o uso pessoal e não-comercial desta plataforma. É proibida a reprodução, distribuição ou modificação do código-fonte sem autorização expressa.
<h3>4. Isenção de Responsabilidade</h3>
A Urubu FC não se responsabiliza por decisões tomadas com base nos dados inseridos na plataforma. As informações sobre jogadores, valores de mercado e níveis são inseridas manualmente pelos usuários e não refletem dados oficiais.
<h3>5. Propriedade Intelectual</h3>
O design, código e identidade visual da plataforma Urubu FC são propriedade de seus criadores. Os dados sobre jogadores e clubes são de domínio público ou inseridos pelos próprios usuários.
<h3>6. Alterações</h3>
Estes termos podem ser atualizados periodicamente. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.`
  }
};
function openLegal(type){
  var c=LEGAL_CONTENT[type];if(!c)return;
  document.getElementById('legal-title').textContent=c.title;
  document.getElementById('legal-body').innerHTML=c.body;
  document.getElementById('legal-over').classList.add('open');
}
function closeLegal(){document.getElementById('legal-over').classList.remove('open');}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLegal();});

// SOBRE / AJUDA
var INFO_CONTENT={
  sobre:{
    title:'Sobre o Urubu FC',
    tabs:[
      {label:'Sobre',body:`<div class="info-section-title">Sobre o Urubu FC</div>
<p>Todo torcedor do Flamengo já montou a escalação ideal na cabeça, discutiu com amigos sobre formações ideais ou quem devia ser vendido na próxima janela de transferências.</p>
<p>O criador do Urubu FC é do tipo que gosta de fazer uma mistura de "balanço" com "planejamento" do elenco, no papel mesmo, escalando times titular e reserva em campinhos desenhados, anotando quem deveria sair, quem deveria ser vendido e quais posições precisavam de reforços.</p>
<p>Este site transforma essa conversa de bar e esse "passatempo" numa ferramenta de verdade, interativa, completa e totalmente pensada para servir ao torcedor do Flamengo.</p>
<p>Aqui você monta o time titular arrastando os jogadores pro campo ou simplesmente tocando no jogador e depois no card desejado do campo de jogo, testa formações diferentes, organiza o elenco completo com filtros e ordenação, projeta alvos de mercado com prioridade e visualiza tudo isso em gráficos e análises. Tudo salvo automaticamente no seu navegador — sem cadastro, sem enviar dados pra lugar nenhum.</p>
<p>O Urubu FC não tem vínculo oficial com o Clube de Regatas do Flamengo. É um projeto independente, feito por um torcedor comum para ser compartilhado com outros torcedores.</p>`},
      {label:'Metodologia',body:`<div class="info-section-title">Como funciona o Nível dos jogadores</div>
<p>Cada jogador no Urubu FC tem uma nota de <strong>Nível</strong> (0 a 100), que é a base de todos os gráficos e análises do site — dos donuts de nível médio às barras de valor de mercado.</p>
<p>Essa nota segue uma metodologia própria, o <strong>Scout Rating</strong>, pensada pra equilibrar critérios objetivos com uma dose de julgamento pessoal — do jeito que um scout de verdade avalia um atleta.</p>
<p><strong>A fórmula combina 4 pilares técnicos, com peso igual entre eles:</strong></p>
<p>• <strong>Técnica</strong> — qualidade de execução com a bola: passe, finalização, controle.<br>
• <strong>Tática</strong> — posicionamento, leitura de jogo, inteligência dentro de campo.<br>
• <strong>Físico</strong> — resistência, velocidade, disputa física.<br>
• <strong>Mental</strong> — concentração, liderança, frieza em momentos decisivos.</p>
<p>A média desses 4 pilares é ajustada por um quinto fator, o <strong>FC (Fator de Contexto)</strong> — um ajuste manual que reflete coisas que número nenhum captura sozinho: momento de forma, adaptação ao sistema tático, valorização recente no mercado, ou simplesmente a visão do usuário sobre aquele atleta.</p>
<p><strong>Por que assim, e não uma nota única?</strong> Porque decompor em pilares deixa a avaliação mais transparente e mais fácil de comparar entre jogadores de posições diferentes — um zagueiro forte fisicamente e um meia técnico podem ter o mesmo Nível final por caminhos bem diferentes, e isso fica visível.</p>
<p>O elenco padrão que vem pré-carregado no site já foi calculado com essa metodologia. Você pode ajustar qualquer nota manualmente a qualquer momento, direto no modal do jogador.</p>`}
    ]
  },
  ajuda:{
    title:'Ajuda',
    tabs:[
      {label:'Como usar',body:`<div class="info-section-title">Como usar o Urubu FC</div>
<p>Arraste jogadores da tabela do Elenco direto pro campo tático, ou selecione um jogador e toque na posição desejada (no celular, os dois métodos funcionam). Use os filtros de Posição e Status para organizar rapidamente quem está disponível.</p>
<p>Na aba Mercado/Alvos, marque prioridade em estrelas pros jogadores que você gostaria de contratar. Ao final, use o botão Compartilhar para gerar uma imagem do seu campo tático ou um link direto da sua escalação.</p>
<p>Na aba Análise você tem acesso a informações aprofundadas do elenco, como idade, nível, valor, nacionalidade e potencial de convocação de jogadores, detalhados e agrupados por posição e status. Ainda é possível comparar o nível com os demais elencos da Série A. Cada gráfico — ou todos eles — pode ser compartilhado para suas conversas, discussões e postagens nas redes sociais.</p>`},
      {label:'FAQ',body:`<div class="info-section-title">Perguntas frequentes</div>
<div class="info-faq-q">O Urubu FC é um site ou produto oficial do Flamengo?</div>
<p>Não. É um projeto independente, feito por um torcedor comum, sem qualquer vínculo oficial com o clube.</p>
<div class="info-faq-q">Meus dados ficam salvos onde?</div>
<p>Tudo é salvo localmente no seu próprio navegador. Nenhum dado é enviado para nenhum servidor. Se limpar os dados do navegador, o elenco monta de novo do zero — por isso existe a opção de Exportar/Importar, para fazer backup ou levar seus dados para outro aparelho.</p>
<div class="info-faq-q">Preciso criar conta ou fazer login?</div>
<p>Não. O site funciona sem cadastro.</p>
<div class="info-faq-q">Como é calculado o Nível dos jogadores?</div>
<p>Veja a seção Metodologia. Em resumo, é uma média de 4 pilares (Técnica, Tática, Físico, Mental) ajustada por um fator de contexto manual.</p>
<div class="info-faq-q">Posso editar os jogadores e criar meu próprio elenco?</div>
<p>Sim. Todo jogador pode ter nome, posição, nível, valor de mercado e status editados livremente, e você pode adicionar ou remover jogadores do elenco.</p>
<div class="info-faq-q">O site funciona no celular?</div>
<p>Sim, com toque-toque (selecionar jogador → tocar na posição) ou arrasto contínuo, como preferir.</p>
<div class="info-faq-q">Dá para compartilhar minha escalação?</div>
<p>Sim — tem botão de compartilhar que gera uma imagem do campo tático, além de compartilhamento via link.</p>`},
      {label:'Guia de Botões',body:`<div class="info-section-title">Guia de Botões</div>
<h3>Campo Tático</h3>
<div class="info-btn-item"><div class="ib-title">Titulares / Reservas / Projeção</div>Alternam entre os três cenários de escalação. "Titulares" é o time principal, "Reservas" o banco, e "Projeção" um cenário livre para simular formações diferentes.</div>
<div class="info-btn-item"><div class="ib-title">Alternar tema claro/escuro</div>Troca a aparência visual do site entre modo escuro (padrão) e modo claro.</div>
<div class="info-btn-item"><div class="ib-title">Escalação (compartilhar)</div>Gera uma imagem (PNG) do campo tático com a escalação atual, pronta para enviar ou salvar.</div>
<h3>Elenco</h3>
<div class="info-btn-item"><div class="ib-title">+ Jogador</div>Abre o formulário para cadastrar um novo jogador no elenco.</div>
<div class="info-btn-item"><div class="ib-title">Exportar elenco (JSON)</div>Baixa um arquivo com todo o elenco cadastrado, para backup ou para transferir os dados a outro aparelho.</div>
<div class="info-btn-item"><div class="ib-title">Importar elenco (JSON)</div>Carrega um arquivo exportado anteriormente, substituindo os dados atuais pelos do arquivo.</div>
<div class="info-btn-item"><div class="ib-title">Filtros de Posição / Status</div>Filtram a lista de jogadores exibida pela posição em campo ou pelo status (Titular, Importante etc.), pelo ícone ▾ no cabeçalho da coluna.</div>
<div class="info-btn-item"><div class="ib-title">Ordenação por coluna</div>Toque no cabeçalho de uma coluna da tabela (Pos, Idade, Nível...) para ordenar o elenco por ela.</div>
<div class="info-btn-item"><div class="ib-title">Elenco (compartilhar)</div>Gera uma imagem (PNG) da tabela de elenco para compartilhar.</div>
<h3>Mercado</h3>
<div class="info-btn-item"><div class="ib-title">+ Alvo</div>Abre o formulário para cadastrar um novo alvo de contratação, com posição, prioridade e valor estimado.</div>
<div class="info-btn-item"><div class="ib-title">Filtros de Posição / Prioridade</div>Filtram a lista de alvos exibida pela posição desejada ou pelo nível de prioridade da contratação.</div>
<div class="info-btn-item"><div class="ib-title">Mercado (compartilhar)</div>Gera uma imagem (PNG) com a lista de alvos de mercado.</div>
<h3>Análise</h3>
<div class="info-btn-item"><div class="ib-title">Análise (compartilhar)</div>Gera uma imagem (PNG) de um card específico da seção Análise.</div>
<h3>Compartilhar (menu geral)</h3>
<div class="info-btn-item"><div class="ib-title">🔗 Compartilhar site</div>Envia o link do Urubu FC sem nenhum dado salvo — indicado para apresentar o app a alguém.</div>
<div class="info-btn-item"><div class="ib-title">🏟️ Compartilhar minha versão</div>Envia um link com seu elenco, escalação e alvos salvos, para que outra pessoa veja exatamente os seus dados.</div>
<div class="info-btn-item"><div class="ib-title">Baixar imagem</div>Salva a imagem gerada diretamente no aparelho.</div>
<div class="info-btn-item"><div class="ib-title">Cancelar / Fechar</div>Fecha o menu ou o card de compartilhamento sem realizar nenhuma ação.</div>
<h3>Modais de edição (jogador e alvo)</h3>
<div class="info-btn-item"><div class="ib-title">Salvar</div>Grava as informações preenchidas no formulário e atualiza o jogador ou alvo correspondente.</div>
<div class="info-btn-item"><div class="ib-title">Cancelar</div>Fecha o formulário sem salvar as alterações feitas.</div>`},
      {label:'Gráficos da Análise',body:`<div class="info-section-title">Sobre os gráficos da Análise</div>
<div class="info-btn-item"><div class="ib-title">Idade Média</div>A idade média do elenco é um indicador de janela competitiva: um time muito jovem tende a ganhar valor de mercado com o tempo, mas pode pecar em experiência decisiva; um elenco mais velho costuma entregar resultado imediato, com risco de perda de rendimento físico nas temporadas seguintes. O detalhamento por posição ajuda a enxergar onde o envelhecimento está concentrado.</div>
<div class="info-btn-item"><div class="ib-title">Nível por Status</div>Nível médio dos jogadores agrupados por status — Titular, Importante, Compõe elenco, Vender e Dispensável. É uma forma rápida de enxergar o equilíbrio geral do time: um Nível médio alto entre os Titulares indica um time competitivo; uma diferença grande entre Titulares e Reservas pode sinalizar falta de profundidade de elenco. A comparação entre escalações ajuda a decidir se vale reforçar o banco ou se a Projeção (com possíveis contratações) eleva o nível de forma significativa.</div>
<div class="info-btn-item"><div class="ib-title">Valor do Elenco</div>Pense nessas barras como "força relativa de investimento", não como proporção direta de euros. Já o ranking de "Top jogadores por valor" evidencia onde está concentrado o capital do elenco — útil para embasar decisões de venda ou renovação de contrato.</div>
<div class="info-btn-item"><div class="ib-title">Nacionalidade</div>Mostra a distribuição de nacionalidades no elenco. Útil pra planejar contratações e ficar de olho no limite de estrangeiros das competições.</div>
<div class="info-btn-item"><div class="ib-title">Jogadores por Status</div>Mede a quantidade de jogadores em cada categoria — Titular, Importante, Compõe elenco, Vender, Dispensável. Serve para avaliar o tamanho e a distribuição do elenco: um número baixo de Titulares em relação ao total pode indicar dependência de poucos jogadores-chave; um número alto em "Vender" ou "Dispensável" sinaliza necessidade de reformulação do elenco.</div>
<div class="info-btn-item"><div class="ib-title">Convocações Seleção</div>Mostra quantos jogadores do elenco podem ser convocados por suas seleções nacionais e o detalhamento por país. Jogadores convocados podem desfalcar o time em datas FIFA, e essa visão ajuda a antecipar esse impacto por origem.</div>
<div class="info-btn-item"><div class="ib-title">Comparativo Série A</div>Este painel permite comparar o nível médio do elenco do Flamengo com os demais times da Série A. O Flamengo é preenchido automaticamente com base no elenco cadastrado no site; os demais clubes ficam em aberto para você inserir manualmente, seja com base em avaliação própria ou em fontes externas de scouting. É uma forma de benchmarking direto contra a concorrência do campeonato. Clique no donut de um time para editar o nível.</div>`}
    ]
  }
};
function buildInfoDOM(){
  var tabsEl=document.getElementById('info-tabs');
  var bodyEl=document.getElementById('info-body');
  if(!tabsEl||!bodyEl||tabsEl.dataset.built)return;
  tabsEl.dataset.built='1';
  Object.keys(INFO_CONTENT).forEach(function(type){
    var c=INFO_CONTENT[type];
    var tabGroup=document.createElement('div');
    tabGroup.className='info-tabgroup';
    tabGroup.dataset.infoType=type;
    var panelGroup=document.createElement('div');
    panelGroup.className='info-panelgroup';
    panelGroup.dataset.infoType=type;
    c.tabs.forEach(function(t,idx){
      var b=document.createElement('button');
      b.className='info-tab-btn'+(idx===0?' active':'');
      b.textContent=t.label;
      b.onclick=function(){
        var allBtns=tabGroup.querySelectorAll('.info-tab-btn');
        for(var i=0;i<allBtns.length;i++)allBtns[i].classList.remove('active');
        b.classList.add('active');
        var allPanels=panelGroup.querySelectorAll('.info-panel');
        for(var j=0;j<allPanels.length;j++)allPanels[j].classList.remove('active');
        panel.classList.add('active');
      };
      tabGroup.appendChild(b);
      var panel=document.createElement('div');
      panel.className='info-panel'+(idx===0?' active':'');
      panel.innerHTML=t.body;
      panelGroup.appendChild(panel);
    });
    tabsEl.appendChild(tabGroup);
    bodyEl.appendChild(panelGroup);
  });
}
document.addEventListener('DOMContentLoaded',buildInfoDOM);
function openInfo(type){
  var c=INFO_CONTENT[type];if(!c)return;
  buildInfoDOM();
  document.getElementById('info-title').textContent=c.title;
  var allTabGroups=document.querySelectorAll('#info-tabs .info-tabgroup');
  for(var i=0;i<allTabGroups.length;i++)allTabGroups[i].style.display=(allTabGroups[i].dataset.infoType===type)?'flex':'none';
  var allPanelGroups=document.querySelectorAll('#info-body .info-panelgroup');
  for(var j=0;j<allPanelGroups.length;j++)allPanelGroups[j].style.display=(allPanelGroups[j].dataset.infoType===type)?'block':'none';
  document.getElementById('info-over').classList.add('open');
}
function closeInfo(){document.getElementById('info-over').classList.remove('open');}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeInfo();});

// COOKIE
function loadGA4(){
  if(window._ga4Loaded)return;
  window._ga4Loaded=true;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments);};
  gtag('js',new Date());
  gtag('config','G-X02RE64K4B');
  var s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id=G-X02RE64K4B';
  document.head.appendChild(s);
}
function acceptCookies(){
  localStorage.setItem('ufc_cookie','1');
  var cb=document.getElementById('cookie-bar');if(cb)cb.style.display='none';
  loadGA4();
}
function declineCookies(){
  localStorage.setItem('ufc_cookie','0');
  var cb=document.getElementById('cookie-bar');if(cb)cb.style.display='none';
  if(window._ga4Loaded&&typeof gtag==='function'){
    gtag('consent','update',{analytics_storage:'denied'});
  }
}
document.addEventListener('DOMContentLoaded',function initCookieBanner(){
  var consent=localStorage.getItem('ufc_cookie');
  if(consent==='1')loadGA4();
});
