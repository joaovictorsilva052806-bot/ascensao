import os; SP=os.path.dirname(os.path.abspath(__file__))+'/'
import re
s=open('index.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:60],s.count(a));s=s.replace(a,b)
rep('<title>Ascensão Bellardi</title>','<title>Ascensão</title>')
rep('<h2>Quests de hoje</h2>','<h2>Tarefas de hoje</h2>')
rep('href="icon-180.png"','href="../icon-180.png"');rep('<link rel="icon" href="icon-192.png">','<link rel="icon" href="../icon-192.png">')
s=s.replace('"ascensao-prog"','"asc-u-prog"').replace('"ascensao-cfg"','"asc-u-cfg"').replace('"ascensao-sync"','"asc-u-sync"')
rep('placeholder="Ex.: mandar a proposta pro cliente"','placeholder="Ex.: entregar a lista de Cálculo"')
rep('placeholder="Ex.: mandar mensagem pro corretor que eu travo de chamar"','placeholder="Ex.: tirar minha dúvida com o professor"')
rep('class="panel faith">','class="panel faith" id="faithPanel">')
rep('<h2>Sincronizar com a Eva</h2>\n    <label for="syncUrl" class="sm muted">Endereço da planilha (a Eva te passa uma vez)</label>\n    <div class="add"><input id="syncUrl" placeholder="https://script.google.com/macros/s/.../exec" autocomplete="off"><button class="go" type="button" id="syncSave">Salvar</button></div>\n    <div class="sm muted" id="sync">Sem sincronização: o progresso fica só neste aparelho.</div>',
 '<h2>Ajustes e backup</h2>\n    <div class="row"><button type="button" class="ghost" id="redo">Refazer meu perfil (recria as quests, mantém o XP)</button></div>\n    <div class="sm muted" id="sync">Seu progresso fica só neste aparelho.</div>\n    <details>\n      <summary>Sincronizar com planilha (opcional)</summary>\n      <label for="syncUrl" class="sm muted">Endereço do Apps Script /exec</label>\n      <div class="add"><input id="syncUrl" placeholder="https://script.google.com/macros/s/.../exec" autocomplete="off"><button class="go" type="button" id="syncSave">Salvar</button></div>\n    </details>')
rep('a Eva lê seu placar.','placar atualizado.')
rep('<li><b>Chefe da semana:</b> abordagens e follow-ups tiram vida dele.','<li><b>Chefe da semana:</b> suas quests de estudo tiram vida dele.')
rep('const STATS={foco:"Foco",vendas:"Vendas",mente:"Mente",corpo:"Corpo"};','const STATS={foco:"Foco",vendas:"Carreira",mente:"Mente",corpo:"Corpo"};')
rep('[20,"A","Mestre de obra"],[30,"S","Lenda Bellardi"]','[20,"A","Mestre"],[30,"S","Lenda"]')
rep('ou peça à Eva para montar as suas.','ou toque em Refazer meu perfil.')
s=re.sub(r'Suas quests aparecem aqui assim que a Eva carregar\.','Responda o perfil para montar suas quests.',s)
rep('["a_pix","Primeiro Pix","Registrar a 1ª entrada de dinheiro",50,()=>(prog.money||[]).length>0],','["a_pix","Primeira entrada","Registrar o 1º valor da meta de dinheiro",50,()=>(prog.money||[]).length>0,()=>!!(cfg&&cfg.money)],')
rep('["a_faith","Fé sobre o medo","7 dias com o painel de fé",40,()=>Object.keys(prog.faith||{}).length>=7],','["a_faith","Fé sobre o medo","7 dias com o painel de fé",40,()=>Object.keys(prog.faith||{}).length>=7,()=>!!(cfg&&cfg.faith)],')
rep('["a_once","Missão cumprida","Concluir as 3 missões únicas",60,()=>["u_dommo","u_konstit","u_catalogo"].every(id=>entries().some(e=>e.q===id))]];',
    '["a_once","Missão cumprida","Concluir todas as missões únicas",60,()=>{const o=((cfg&&cfg.quests)||[]).filter(q=>q.once);return o.length>0&&o.every(q=>entries().some(e=>e.q===q.id));}]].filter(a=>!a[5]||a[5]());')
# ACH is a const evaluated once at load; cfg may change after onboarding -> make it a function-backed getter
rep('const ACH=[','let ACH=[];function achList(){return [')
rep(']].filter(a=>!a[5]||a[5]());',']].filter(a=>!a[5]||a[5]());}')
rep('for(const [id,name,desc,xp] of ACH)','for(const [id,name,desc,xp] of (ACH=achList()))')
rep('for(const [id,name,,xp,test] of ACH)','for(const [id,name,,xp,test] of (ACH=achList()))')
rep('$("achCount").textContent=got+" / "+ACH.length;','$("achCount").textContent=got+" / "+ACH.length;$("faithPanel").hidden=!(cfg&&cfg.faith);')
rep('"serviceWorker" in navigator','"serviceWorker" in navigator&&location.protocol==="https:"')
# replace default cfg with blank
s=re.sub(r'const DEFAULT_CFG=\{.*?\};\n','const DEFAULT_CFG={"version":1,"quests":[],"blank":true};\n',s,count=1,flags=re.S)
onb_html=open(SP+'onb.html').read()
onb_js=open(SP+'onb.js').read()
onb_css=open(SP+'onb.css').read()
rep('<div class="wrap">\n','<div class="wrap">\n'+onb_html,1)
rep('</style></head>',onb_css+'</style></head>')
rep('  <section data-tab="prog" class="panel">\n    <h2>Atributos</h2>','  <section data-tab="prog" class="panel" id="rankPanel">\n    <div class="qhead"><h2>🏆 Ranking da semana</h2><span class="sm muted">zera toda segunda</span></div>\n    <ol class="rk" id="rkList"></ol>\n    <div class="row"><button class="go" type="button" id="rkJoin">Entrar no ranking</button><button class="link" type="button" id="rkLeave" hidden>Sair do ranking</button></div>\n  </section>\n\n  <section data-tab="prog" class="panel">\n    <h2>Atributos</h2>')
fb_html=open(SP+'fb.html').read();fb_js=open(SP+'fb.js').read()
rep('  <section data-tab="mais" class="panel">',fb_html+'  <section data-tab="mais" class="panel">')
rep('<button class="go" type="submit">Adicionar</button>\n    </form>','<button class="go" type="submit">Adicionar</button>\n    </form>\n    <button class="link" type="button" id="fbQuick">💡 Sugerir uma melhoria no app</button>')
rep('  <section data-tab="hoje" class="panel">\n    <div class="status">','  <section data-tab="hoje" class="panel tip" id="pingCard" hidden>\n    <h2>🏆 Ranking da semana</h2>\n    <div class="sm">Compare seu XP com quem também usa o Ascensão. Aparece só seu primeiro nome e seu XP. Nenhuma tarefa ou horário sai do seu celular.</div>\n    <div class="row"><button class="go" type="button" id="pingYes">Entrar no ranking</button><button class="ghost" type="button" id="pingNo">Agora não</button></div>\n  </section>\n\n  <section data-tab="hoje" class="panel tip" id="installTip" hidden>\n    <h2>Instale como app</h2>\n    <div class="sm" id="tipText">No Safari, toque em <b>Compartilhar</b> (quadrado com a seta) e depois em <b>Adicionar à Tela de Início</b>. Ele abre em tela cheia, como um app.</div>\n    <button class="go" type="button" id="tipInstall" hidden>Instalar agora</button>\n    <button class="link" type="button" id="tipClose">Entendi</button>\n  </section>\n\n  <section data-tab="hoje" class="panel">\n    <div class="status">')
rep('render();\nsetInterval(','if(!cfg||cfg.blank||!cfg.quests||!cfg.quests.length)openOnb();\nrender();\nsetInterval(')
rep("\nlet saveTimer=null, SYNC=\"\";",onb_js+fb_js+"\nlet saveTimer=null, SYNC=\"\";")
open('comecar/index.html','w').write(s)
pass
