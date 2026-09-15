'use strict';
let finalStage='',studentName='',certificateUrl='';
function finalScreen(stage,title,body){
 if(matchMedia('(max-width:750px)').matches)window.scrollTo({top:0,behavior:'instant'});
 finalStage=stage;game.dataset.finalStage=stage;game.className='finale';setScene('award');
 document.querySelector('#progress').textContent='Финал путешествия';
 panel.innerHTML=`<p class="eyebrow">Кислый</p><h1 id="title">${title}</h1>${body}<div class="actions"></div>`;
}
function showName(){
 finalScreen('name','Твоя грамота','<p>Все задания выполнены! Осталось подписать твою грамоту.</p><label for="student-name">Кому вручается грамота?</label><input id="student-name" maxlength="60" autocomplete="given-name"><p class="note">Напиши в дательном падеже: например, Федору Федорову. Можно указать только имя. Оно останется на твоём компьютере.</p><p id="award-status" role="status"></p>');
 const input=panel.querySelector('#student-name');input.value=studentName;
 panel.querySelector('.actions').append(button('Получить грамоту',()=>makeCertificate(input.value),'primary'),button('Без имени',()=>makeCertificate('')));
 input.onkeydown=e=>{if(e.key==='Enter')makeCertificate(input.value)};
}
async function makeCertificate(name){
 if(finalStage!=='name')return;
 finalStage='generating';studentName=name.trim().slice(0,60);
 try{
  const img=new Image();img.src=CERTIFICATE_IMAGE;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);ctx.fillStyle='#36250f';ctx.textAlign='center';
  let size=canvas.width*.034;ctx.font=`${size}px Georgia`;while(ctx.measureText(studentName).width>canvas.width*.60&&size>12){size--;ctx.font=`${size}px Georgia`}
  ctx.fillText(studentName,canvas.width/2,canvas.height*.392);
  // The author credit sits in the clear gap above the decorative paw divider.
  ctx.font=`${canvas.width*.017}px Georgia`;ctx.fillText('Автор игры Бочарова Л.А. (учитель химии)',canvas.width/2,canvas.height*.628);
  const qr=new Image();qr.src=CHANNEL_QR_IMAGE;await qr.decode();
  const q=canvas.height*.16,pad=canvas.height*.016,x=(canvas.width-q)/2,y=canvas.height*.737;
  ctx.fillStyle='#fff';ctx.fillRect(x-pad,y-pad,q+pad*2,q+pad*2+canvas.height*.03);
  ctx.drawImage(qr,x,y,q,q);ctx.fillStyle='#36250f';ctx.font=canvas.width*.013+'px Georgia';ctx.fillText('Канал по химии',canvas.width/2,y+q+canvas.height*.026);
  certificateUrl=canvas.toDataURL('image/png');showAward();
 }catch{finalStage='name';panel.querySelector('#award-status').textContent='Не удалось подготовить грамоту. Попробуй нажать кнопку ещё раз.'}
}
function showAward(){
 finalScreen('award','Поздравляю!','<p>Ты прошёл путь исследователя двух дорог!</p><img id="certificate-preview" alt="Грамота исследователя двух дорог"><p class="note">Сохрани грамоту. Если захочешь, её можно распечатать позже.</p>');
 panel.querySelector('#certificate-preview').src=certificateUrl;
 const link=document.createElement('a');link.textContent='Скачать грамоту';link.href=certificateUrl;link.download='Грамота — Две дороги.png';link.className='download primary';
 panel.querySelector('.actions').append(link,button('Изменить имя',showName));
 const channel=document.createElement('a');channel.href='https://t.me/+jiLAsBgHJmMxNWQy';channel.target='_blank';channel.rel='noopener noreferrer';channel.className='channel-link';channel.textContent='Канал по химии';panel.append(channel);
}






