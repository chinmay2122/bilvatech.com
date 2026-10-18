(() => {
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('#our-solutions .bento-card').forEach(card=>{
  const button=card.querySelector('.bento-actions button');if(!button)return;
  let hovered=false,focused=false;
  const sync=()=>card.classList.toggle('is-exploring',button.getAttribute('aria-expanded')==='true'||(!motion.matches&&(hovered||focused)));
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;button.querySelector('span').textContent=open?'−':'+';sync();});
  card.addEventListener('pointerenter',event=>{hovered=event.pointerType==='mouse';sync();});
  card.addEventListener('pointerleave',()=>{hovered=false;sync();});
  card.addEventListener('focusin',()=>{focused=true;sync();});
  card.addEventListener('focusout',event=>{focused=card.contains(event.relatedTarget);sync();});
  motion.addEventListener('change',sync);
 });
})();
