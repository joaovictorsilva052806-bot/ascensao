// Ponte nativa do Ascension (só entra no pacote da loja, via preparar.js; o site não muda).
// Usa os plugins do Capacitor que já vêm no app (window.Capacitor.Plugins), sem bundler.
// Regras do app: só ADICIONA, nunca apaga progresso, nada sai do aparelho.
(function(){
  var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
  var P=C.Plugins||{};
  // 1) Háptico de verdade no lugar do navigator.vibrate (o iPhone não vibra pela web)
  if(P.Haptics){
    navigator.vibrate=function(p){try{var n=Array.isArray(p)?p.reduce(function(a,b,i){return i%2?a:a+b;},0):+p||0;
      if(n>=40)P.Haptics.notification({type:"SUCCESS"});else P.Haptics.impact({style:n>=15?"MEDIUM":"LIGHT"});}catch(e){}return true;};
  }
  // 2) Compartilhar pelo menu nativo (convite, card do jogador)
  if(P.Share&&!navigator.share){
    navigator.share=function(d){d=d||{};return P.Share.share({title:d.title,text:d.text,url:d.url,dialogTitle:"Compartilhar"}).then(function(){});};
    navigator.canShare=function(d){return !(d&&d.files&&d.files.length);};
  }
  // 3) Avisos locais: o app usa a API Notification da web; aqui ela vira aviso nativo
  if(P.LocalNotifications){
    var LN=P.LocalNotifications,perm="default",nid=1000;
    var N=function(title,o){o=o||{};nid=nid>=1999?1000:nid+1;
      LN.schedule({notifications:[{id:nid,title:String(title||"Ascension"),body:String(o.body||""),schedule:{at:new Date(Date.now()+500)}}]}).catch(function(){});};
    N.requestPermission=function(){return LN.requestPermissions().then(function(r){perm=r&&r.display==="granted"?"granted":r&&r.display==="denied"?"denied":"default";return perm;}).catch(function(){return perm;});};
    Object.defineProperty(N,"permission",{get:function(){return perm;}});
    LN.checkPermissions().then(function(r){perm=r&&r.display==="granted"?"granted":r&&r.display==="denied"?"denied":"default";}).catch(function(){});
    window.Notification=N;
  }
  // 4) Cópia de segurança do progresso no armazenamento nativo (Preferences).
  //    O iOS pode limpar o armazenamento da WebView quando falta espaço; a cópia fica no app.
  //    Restaura SÓ se o aparelho estiver sem progresso (nunca sobrescreve o que existe).
  if(P.Preferences){
    var PR=P.Preferences,K="asc-copia-nativa",pref=/^asc(-u-|-mural-|-tab)/;
    var copia=function(){if(typeof restaurando!=="undefined"&&restaurando)return;try{var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(pref.test(k))o[k]=localStorage.getItem(k);}
      if(!o["asc-u-prog"]&&!o["asc-u-cfg"])return;o._em=new Date().toISOString();PR.set({key:K,value:JSON.stringify(o)}).catch(function(){});}catch(e){}};
    //    "Vazio" é medido ANTES do app abrir (o app pode criar um perfil em branco nesses milissegundos);
    //    o que estiver no aparelho na hora vai para "asc-copia-nativa-antes" antes da restauração.
    var vazio=false;try{vazio=!localStorage.getItem("asc-u-prog")&&!localStorage.getItem("asc-u-cfg");}catch(e){}
    if(vazio){var restaurando=true;
      PR.get({key:K}).then(function(r){if(!r||!r.value){restaurando=false;return;}var o=JSON.parse(r.value);var antes={},n=0;
        for(var i=0;i<localStorage.length;i++){var k0=localStorage.key(i);if(pref.test(k0))antes[k0]=localStorage.getItem(k0);}
        return PR.set({key:K+"-antes",value:JSON.stringify(antes)}).then(function(){
          for(var k in o){if(k!=="_em"&&pref.test(k)){localStorage.setItem(k,o[k]);n++;}}
          if(n)location.reload();else restaurando=false;});}).catch(function(){restaurando=false;});
    }
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")copia();});
    setInterval(copia,60000);setTimeout(copia,5000);
  }
  // 5) Barra de status clara sobre o fundo escuro
  if(P.StatusBar){try{P.StatusBar.setStyle({style:"DARK"});}catch(e){}}
  document.documentElement.classList.add("nativo");
})();
