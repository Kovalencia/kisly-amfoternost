let catPlacementKey='',catPlacement=null;
function placeCat(){
 const anchor=document.querySelector('#cat-anchor'),sprite=document.querySelector('#cat');
 const final=game.classList.contains('finale'),welcome=game.classList.contains('welcome');
 if(game.classList.contains('start')||game.classList.contains('moving')||game.classList.contains('answered')){game.classList.remove('cat-fits');return}
 const w=window.innerWidth,h=window.innerHeight;
 const key=[final?game.dataset.finalStage:welcome?'welcome':visit,w,h,sprite.naturalWidth].join(':');
 if(key!==catPlacementKey){
  const box=panel.getBoundingClientRect(),ratio=sprite.naturalWidth&&sprite.naturalHeight?sprite.naturalWidth/sprite.naturalHeight:0.9;
  const narrow=w<=750,forge=game.dataset.scene==='forge';
  const centers={1:.38,2:.38,3:.29,4:.31,5:.40,6:.30,7:.31,8:.32};
  const center=(final||welcome) ? .25 : forge ? .83 :(centers[Number(game.dataset.question)]||.32);
  let size,left;
  if(narrow){size=Math.min(260,w*.62,(h-box.bottom-34)*ratio);left=Math.max(16,Math.min(w-size-16,w*.62-size/2))}
  else{const room=forge?2*(center*w-box.right-20):2*(box.left-20-center*w);size=Math.min(w*.34,h*(final?.43:.66)*ratio,room,2*(w-center*w-20));left=center*w-size/2}
  if(!narrow&&!final&&!welcome&&!forge&&[1,2,5,6].includes(Number(game.dataset.question))){
   const edge=box.left-20;
   size=Math.min(w*.34,h*.66*ratio,edge-16);
   left=Math.max(16,Math.min(center*w-size/2,edge-size));
  }
  catPlacement={size,left,fits:size>=(narrow?100:160)};catPlacementKey=key;
 }
 game.classList.toggle('cat-fits',catPlacement.fits);
 if(catPlacement.fits){anchor.style.setProperty('width',catPlacement.size+'px','important');anchor.style.setProperty('left',catPlacement.left+'px','important');anchor.style.setProperty('right','auto','important')}
}
new ResizeObserver(placeCat).observe(panel);
new MutationObserver(()=>requestAnimationFrame(placeCat)).observe(panel,{childList:true,subtree:true});
window.addEventListener('resize',placeCat);
document.querySelector('#cat').addEventListener('load',placeCat);placeCat();



