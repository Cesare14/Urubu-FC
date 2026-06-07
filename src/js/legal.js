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
