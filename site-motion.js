(() => {
 const gsap=window.gsap,ST=window.ScrollTrigger;
 if(!gsap||!ST)return;
 gsap.registerPlugin(ST);
 document.documentElement.classList.add('motion-ready');
 const media=gsap.matchMedia();
 media.add({mobile:'(max-width: 720px)',desktop:'(min-width: 721px)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
  if(context.conditions.reduce)return;
  const distance=context.conditions.mobile?24:32;
  const reveal=(section,selectors)=>{
   const root=document.querySelector(section);if(!root)return;
   const targets=selectors.flatMap(selector=>[...root.querySelectorAll(selector)]);
   if(!targets.length)return;
   // Start only on entry, so CDN failure or untouched off-screen content stays legible.
   ST.create({trigger:root,start:'top 85%',once:true,onEnter:()=>gsap.fromTo(targets,{y:distance,opacity:0},{y:0,opacity:1,duration:.75,stagger:.09,ease:'power2.out',clearProps:'transform,opacity',overwrite:'auto'})});
  };
  if(document.body.classList.contains('bilva-home')){
   if(scrollY<100){gsap.timeline({defaults:{duration:.7,ease:'power2.out'}})
    .fromTo('.hero .trust-row',{y:18,opacity:0},{y:0,opacity:1,clearProps:'transform,opacity'})
    .fromTo('.hero .headline>span',{y:28,opacity:0},{y:0,opacity:1,stagger:.1,clearProps:'transform,opacity'},.12)
    .fromTo('.hero .subhead',{y:20,opacity:0},{y:0,opacity:1,clearProps:'transform,opacity'},.3)
    .fromTo('.hero .hero-cta',{y:16,opacity:0},{y:0,opacity:1,clearProps:'transform,opacity'},.45);}
   reveal('#about-bilva',['.home-kicker','h2','.about-home-copy']);
   reveal('#our-solutions',['.bento-intro','.bento-card']);
   reveal('#what-we-protect',['.protect-intro','.protect-card']);
   reveal('#why-bilvatech',['.method-intro','.method-steps li']);
   reveal('#testimonials',['.testimonials-shell']);
   reveal('#faq',['.compact-faq-body']);
   reveal('#final-cta',['.home-kicker','h2','.architecture-cta-copy>p:not(.home-kicker)','.cta-primary-btn','.cta-utility-link']);
  }

  if(document.body.classList.contains('bilva-inner')){
   const sections=[...document.querySelectorAll('.inner-shell>.inner-box')];
   const first=sections[0];
   if(first&&scrollY<100){
    const introTargets=[...first.querySelectorAll('.inner-meta>span,.inner-kicker,.contact-eyebrow,h1,.inner-intro>p:last-child,.contact-lead,.contact-reference-form>*,.contact-bottom-link')];
    gsap.fromTo(introTargets,{y:context.conditions.mobile?18:24,opacity:0},{y:0,opacity:1,duration:.68,stagger:.065,ease:'power2.out',clearProps:'transform,opacity',overwrite:'auto'});
    const orbit=first.querySelector('.contact-orbit');
    if(orbit)gsap.fromTo(orbit,{scale:.96,opacity:0},{scale:1,opacity:1,duration:.9,ease:'power2.out',clearProps:'transform,opacity'},0);
   }
   sections.slice(1).forEach(section=>{
    const targets=[...section.querySelectorAll('.inner-meta>span,.inner-split>div,.editorial-principles article,.directory-row,.inner-cta>div,.inner-button')];
    if(!targets.length)return;
    ST.create({trigger:section,start:'top 86%',once:true,onEnter:()=>gsap.fromTo(targets,{y:distance,opacity:0},{y:0,opacity:1,duration:.68,stagger:.075,ease:'power2.out',clearProps:'transform,opacity',overwrite:'auto'})});
   });
  }
  const dial=document.querySelector('.service-dial');let transition;
  const switchService=event=>{
   transition?.kill();
   const panels=[...dial.querySelectorAll('[role="tabpanel"]')];
   gsap.set(panels,{clearProps:'transform,opacity'});
   transition=gsap.timeline().fromTo(panels[event.detail.index],{opacity:0,y:12},{opacity:1,y:0,duration:.35,ease:'power2.out',clearProps:'transform,opacity'});
  };
  dial?.addEventListener('bilva:service-change',switchService);
  return()=>{transition?.kill();dial?.removeEventListener('bilva:service-change',switchService);};
 });
 document.fonts?.ready.then(()=>ST.refresh());
 window.addEventListener('load',()=>ST.refresh(),{once:true});
})();
