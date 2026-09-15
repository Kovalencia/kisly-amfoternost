'use strict';
const salts=['NaAlO₂','Na[Al(OH)₄]','Na₂ZnO₂','Na₂[Zn(OH)₄]'];
const names=['Метаалюминат натрия','Тетрагидроксоалюминат натрия','Цинкат натрия','Тетрагидроксоцинкат натрия','Ортоалюминат натрия'];
let route='water',main=0,tick=0,queue=[],current=null,repeat=false,attempts=0,locked=false,options=[],last='',message='',visit=0;
const panel=document.querySelector('#panel'),game=document.querySelector('#game');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function button(label,fn,cls=''){const b=document.createElement('button');b.textContent=label;b.className=cls;b.onclick=fn;return b}
function data(){return [
{id:1,title:'ZnO + NaOH',condition:route==='water'?'Водный раствор, избыток щёлочи':'Сплавление',question:'Выберите формулу образующейся соли.',key:route==='water'?salts[3]:salts[2],metal:'цинк',aqueous:route==='water',wrong:route==='water'?'Na[Zn(OH)₄]':'NaZnO₂'},
{id:2,title:'Al₂O₃ + NaOH',condition:'Водный раствор, избыток щёлочи',question:'Выберите формулу образующейся соли.',key:salts[1],metal:'алюминий',aqueous:true,wrong:'Na₂[Al(OH)₄]'},
{id:3,title:'Оксид алюминия',condition:'Взаимодействует с избытком водного раствора гидроксида натрия.',question:'Выберите название образующейся соли.',key:names[1],metal:'алюминий',aqueous:true,named:true},
{id:4,title:'ZnO + NaOH',condition:'Сплавление',question:'Выберите название образующейся соли.',key:names[2],metal:'цинк',aqueous:false,named:true},
{id:5,title:'Название и формула',condition:'',question:'Выберите формулу тетрагидроксоалюмината натрия.',key:salts[1],metal:'алюминий',aqueous:true,wrong:'Na₂[Al(OH)₄]'},
{id:6,title:'Два условия — две соли',condition:'Гидроксид цинка реагирует с гидроксидом натрия.',question:'Выберите формулы солей, получаемые при сплавлении и в водном растворе.',type:'pair',key:{fusion:salts[2],water:salts[3]},metal:'цинк'},
{id:7,title:'Определи условия',condition:'При взаимодействии Al₂O₃ с NaOH образовалась соль NaAlO₂.',question:'В каких условиях проводили реакцию?',key:'Сплавление',choices:['Сплавление','Водный раствор'],metal:'алюминий',aqueous:false},
{id:8,title:'Алюминий ★',condition:'Алюминий взаимодействует с избытком гидроксида натрия в водном растворе.',question:'Выберите формулы всех продуктов реакции.',type:'multi',key:[salts[1],'H₂'],choices:[salts[0],salts[1],'Na₂[Al(OH)₄]','H₂O','H₂','O₂'],metal:'алюминий',aqueous:true,wrong:'Na₂[Al(OH)₄]'}];}
function shuffle(a){return a.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v)}
function welcome(){game.className='welcome';setScene('trail',0);panel.innerHTML='<p class="eyebrow">Кот-учёный Кислый</p><h1 id="title">Привет! Меня зовут Кислый.</h1><p>Приглашаю тебя в путешествие по двум дорогам — водному раствору и сплавлению.</p><p>Ты научишься различать соли, которые образуют соединения алюминия и цинка со щёлочью при разных условиях.</p><p>Я буду сопровождать тебя и давать подсказки. Ошибаться можно! Попробуй ещё, а если захочешь идти дальше после двух ошибок — мы повторим вопрос позже.</p><p>После всех восьми заданий и повторения ошибок ты получишь грамоту.</p><div class="actions"></div>';panel.querySelector('.actions').append(button('Отправиться в путь',intro,'primary'));const credit=document.createElement('p');credit.className='author-credit';credit.textContent='Автор игры Бочарова Л.А. (учитель химии)';panel.append(credit);const channel=document.createElement('div');channel.className='channel-card';channel.innerHTML='<a href="https://t.me/+jiLAsBgHJmMxNWQy" target="_blank" rel="noopener noreferrer" aria-label="Открыть канал по химии в Telegram"><img src="assets/channel-qr.jpg" alt="QR-код канала автора по химии"></a><p><a class="channel-link" href="https://t.me/+jiLAsBgHJmMxNWQy" target="_blank" rel="noopener noreferrer">Канал по химии</a><br><span>Нажми на ссылку или отсканируй QR-код.</span></p>';panel.append(channel);}
function setScene(scene,position=0){game.dataset.scene=scene;const bg=document.querySelector('#landscape');bg.style.setProperty('--scene-x',position+'%');const sameScene=(bg.style.backgroundImage||'').includes('/'+scene+'.png');bg.style.transition=sameScene?'background-position 1.05s ease':'none';bg.style.backgroundImage=`url('assets/${scene}.png')`;bg.style.backgroundSize=scene==='fork'?'cover':'cover';bg.style.backgroundPosition=scene==='fork'?'50% 50%':`${position}% 50%`;}
function intro(){game.className='start';document.querySelector('#progress').textContent='';setScene('fork');panel.innerHTML='<h1 id="title">Как играть</h1><p class="note">Нажимай на ответ. После ошибки Кислый поможет. После двух ошибок можно идти дальше — вопрос встретится снова. После верного ответа нажми «ДАЛЬШЕ».</p><div class="actions"></div>';for(const [r,label]of [['water','Водный раствор'],['fusion','Сплавление']])panel.querySelector('.actions').append(button(label,()=>{if(locked)return;route=r;game.className='';next()},'primary'));}
function next(){if(matchMedia('(max-width:750px)').matches)window.scrollTo({top:0,behavior:'instant'});locked=true;const due=queue.find(q=>q.due<=tick);repeat=!!due||main>=8;if(repeat){current=due?.q||queue[0]?.q;if(!current)return finish()}else current=data()[main++];game.classList.remove('answered');game.dataset.question=String(current.id);attempts=0;last='';message='';prepareAnswers();visit++;game.classList.add('moving');const stop=current.id-2;if(current.id===1)setScene(route==='water'?'waterfall':'forge');else setScene(stop<3?'trail':'trail-next',stop<3?stop*50:(stop-3)*100/3);setTimeout(()=>{game.classList.remove('moving');locked=false;render()},matchMedia('(prefers-reduced-motion: reduce)').matches?0:1050);}
function hint(value){if(current.id===7)return 'Сравни формулу этой соли с формулами солей, которые образуются в растворе и при сплавлении.';if(current.id===5&&value===salts[0])return 'В названии есть «тетрагидроксо». Какая часть формулы должна это отражать?';if(current.metal==='цинк'&&/Al|алюминат/i.test(value)||current.metal==='алюминий'&&/Zn|цинкат/i.test(value))return 'Проверь металл: исходное вещество содержит '+current.metal+'.';if(value===current.wrong)return current.aqueous?'Четыре группы OH⁻ дают заряд 4−. Ион металла: '+(current.metal==='цинк'?'2+':'3+')+'. Посчитай заряд комплекса и число Na⁺ для нейтральной соли. Рассуждаем так же, как при расчёте степени окисления по формуле.':'Мысленно запиши Zn(OH)₂ как H₂ZnO₂. Остаток ZnO₂²⁻ имеет заряд 2−. Сколько ионов Na⁺ нужно?';return 'Обрати внимание на условия: '+(current.aqueous?'здесь водный раствор. Как называется соль с гидроксогруппами?':'здесь сплавление. Какая соль образуется без воды в качестве растворителя?');}
function answer(value){if(locked)return;game.classList.add('answered');last=value;attempts++;if(value===current.key){locked=true;message='Верно!';if(repeat)queue=queue.filter(q=>q.q.id!==current.id);render(true)}else{if(!queue.some(q=>q.q.id===current.id))queue.push({q:current,due:tick+3});message=hint(value);render(false)}}
function advance(){tick++;next()}
function renderSingle(success=false){document.querySelector('#progress').textContent=(repeat?'Повторение':`Задание ${current.id} из 8`)+(queue.length?` · На повтор: ${queue.length}`:'');panel.innerHTML=`<p class="eyebrow">${repeat?'Вспомним ещё раз':'Кислый'}</p><h1 id="title">${esc(current.title)}</h1><p>${esc(current.condition)}</p><p>${esc(current.question)}</p>${message?`<div role="status" class="feedback ${success?'success':''}">${success?'✓':'✕'} ${esc(message)}</div>`:''}<div class="choices"></div><div class="actions"></div>`;for(const value of options){const b=button((last===value?(success?'✓ ':'✕ '):'')+value,()=>answer(value),last===value?(success?'good':'bad'):'');b.disabled=locked;panel.querySelector('.choices').append(b)}const actions=panel.querySelector('.actions');if(success)actions.append(button('ДАЛЬШЕ',advance,'primary'));else if(attempts>=2){actions.append(button('Попробую ещё',()=>{attempts=0;render()}));actions.append(button('Иду дальше',()=>{const q=queue.find(q=>q.q.id===current.id);if(q)q.due=tick+3;advance()},'primary'))}}
function finish(){locked=true;if(main>=8&&!queue.length)showName()}




let selected=new Set(),checked=new Set(),pair={fusion:'',water:''},pairOptions={},pairChecked={},solved=false;
function prepareAnswers(){
 selected=new Set();checked=new Set();pair={fusion:'',water:''};pairChecked={};solved=false;
 const zinc=current.metal==='цинк';
 const formulaChoices=zinc?[salts[2],salts[3],salts[current.aqueous?1:0],current.wrong]:[salts[0],salts[1],salts[3],current.wrong];
 const nameChoices=zinc?[names[2],names[3],names[0]]:[names[0],names[1],names[4],names[3]];
 options=current.type==='pair'?[]:shuffle(current.choices||(current.named?nameChoices:formulaChoices));
 pairOptions={fusion:shuffle([salts[2],salts[3],'NaZnO₂']),water:shuffle([salts[2],salts[3],'Na[Zn(OH)₄]'])};
}
function render(success=false){if(!current.type)return renderSingle(success);renderMultiple()}
function toggleProduct(value){if(locked)return;if(selected.has(value))selected.delete(value);else selected.add(value);render()}
function selectPair(side,value){if(locked)return;pair[side]=value;render()}
function completeCheck(ok,feedback){attempts++;message=feedback;solved=ok;if(ok){locked=true;if(repeat)queue=queue.filter(q=>q.q.id!==current.id)}else if(!queue.some(q=>q.q.id===current.id))queue.push({q:current,due:tick+3});render()}
function check(){
 if(locked)return;game.classList.add('answered');
 if(current.type==='pair'){
  if(!pair.fusion||!pair.water){message='Выбери по одной формуле для каждого условия.';render();return}
  pairChecked={...pair};const ok=pair.fusion===current.key.fusion&&pair.water===current.key.water;
  if(ok)return completeCheck(true,'Верно! Для каждого условия выбрана своя соль.');
  const side=pair.fusion!==current.key.fusion?'fusion':'water';const value=pair[side];let feedback;
  if(value.includes('Al'))feedback='Проверь металл: исходное вещество содержит цинк.';
  else if(value==='NaZnO₂')feedback='Мысленно запиши Zn(OH)₂ как H₂ZnO₂. Остаток ZnO₂²⁻ имеет заряд 2−. Сколько ионов Na⁺ нужно?';
  else if(value==='Na[Zn(OH)₄]')feedback='Четыре OH⁻ дают 4−, ион цинка имеет заряд 2+. Посчитай заряд комплекса и число Na⁺. Рассуждаем так же, как при расчёте степени окисления по формуле.';
  else feedback='Сравни соли, которые образуются при сплавлении и в водном растворе.';
  return completeCheck(false,(side==='water'?'Водный раствор: ':'Сплавление: ')+feedback);
 }
 if(!selected.size){message='Сначала отметь продукты реакции.';render();return}
 checked=new Set(selected);const ok=selected.size===current.key.length&&current.key.every(v=>selected.has(v));
 if(ok)return completeCheck(true,'Верно! Образуются тетрагидроксоалюминат натрия и водород.');
 let feedback;
 if(selected.has(current.wrong))feedback=hint(current.wrong);
 else if(selected.has(salts[0]))feedback='Проверь условия: здесь водный раствор щёлочи, а не сплавление.';
 else if(selected.has('O₂')||selected.has('CO₂'))feedback=(selected.has(salts[1])?'Соль выбрана верно. ':'')+'Проверь газ: что выделяется при реакции алюминия с раствором щёлочи?';
 else if(selected.has('H₂O'))feedback='В этой реакции вода расходуется. Проверь, должна ли она быть среди продуктов.';
 else if(!selected.has(salts[1]))feedback='Газ выбран верно. Какая соль ещё образуется в растворе?';
 else feedback='Соль выбрана верно. Здесь со щёлочью взаимодействует сам металл. Какой газ образуется?';
 completeCheck(false,feedback);
}
function renderMultiple(){
 document.querySelector('#progress').textContent=(repeat?'Повторение':`Задание ${current.id} из 8`)+(queue.length?` · На повтор: ${queue.length}`:'');
 const help=current.type==='pair'?'Выбери по одной формуле в каждой колонке, затем нажми «Проверить».':'Отметь все продукты, затем нажми «Проверить». Повторное нажатие снимает выбор.';
 panel.innerHTML=`<p class="eyebrow">${repeat?'Вспомним ещё раз':'Кислый'}</p><h1 id="title">${esc(current.title)}</h1><p>${esc(current.condition)}</p><p>${esc(current.question)}</p><p class="note">${help}</p>${message?`<div role="status" class="feedback ${solved?'success':''}">${solved?'✓ ':''}${esc(message)}</div>`:''}<div class="choices ${current.type==='multi'?'multiple':'paired'}"></div><div class="actions"></div>`;
 const choices=panel.querySelector('.choices');
 if(current.type==='pair'){
  for(const side of ['fusion','water']){
   const group=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=side==='fusion'?'Сплавление':'Водный раствор, избыток щёлочи';group.append(legend);
   for(const value of pairOptions[side]){
    const isSelected=pair[side]===value,evaluated=pairChecked[side]===value&&isSelected,correct=value===current.key[side];
    const cls=evaluated?(correct?'good':'bad'):isSelected?'selected':'';
    const prefix=evaluated?(correct?'✓ ':'✕ '):isSelected?'● ':'○ ';
    const b=button(prefix+value,()=>selectPair(side,value),cls);b.disabled=locked;b.setAttribute('aria-pressed',String(isSelected));group.append(b);
   }choices.append(group);
  }
 }else for(const value of options){
  const isSelected=selected.has(value),evaluated=isSelected&&checked.has(value),correct=current.key.includes(value);
  const cls=evaluated?(correct?'good':'bad'):isSelected?'selected':'';
  const prefix=evaluated?(correct?'✓ ':'✕ '):isSelected?'☑ ':'☐ ';
  const b=button(prefix+value,()=>toggleProduct(value),cls);b.disabled=locked;b.setAttribute('aria-pressed',String(isSelected));choices.append(b);
 }
 const actions=panel.querySelector('.actions');
 if(solved)actions.append(button('ДАЛЬШЕ',advance,'primary'));
 else{actions.append(button('Проверить',check,'primary'));if(attempts>=2){actions.append(button('Попробую ещё',()=>{attempts=0;render()}));actions.append(button('Иду дальше',()=>{const q=queue.find(q=>q.q.id===current.id);if(q)q.due=tick+3;advance()}))}}
}
welcome();








