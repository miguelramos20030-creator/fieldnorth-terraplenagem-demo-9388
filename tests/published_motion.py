"""Record actual full-load/reload hero frames on a URL, without pausing motion."""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get('FIELDNORTH_TEST_URL', 'https://fieldno-zfawbud.runable.site/')
LABEL = os.environ.get('FIELDNORTH_TEST_LABEL', 'published-before')
OUT = Path(__file__).parent / 'results'
INIT = '''window.heroFrames=[]; window.heroStarts=[]; window.motionDone=false;
document.addEventListener('animationstart', e=>{
 if(e.animationName.startsWith('hero-'))heroStarts.push({name:e.animationName,time:performance.now()});
});
let start;
function capture(){
 const hero=document.querySelector('.hero');
 if(hero){
  start??=performance.now();
  const img=hero.querySelector('img');
  const groups=[...hero.querySelectorAll('.hero-headline-group')];
  const styles=groups.map(group=>{
    const el=group.querySelector('.hero-headline-reveal')||group;
    return {opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform};
  });
  const a=hero.querySelector('.hero-actions');
  heroFrames.push({elapsed:Math.round(performance.now()-start),scroll:scrollY,imageReady:img.complete&&img.naturalWidth>0,
    imageTransform:getComputedStyle(img).transform,lines:styles,ctaOpacity:getComputedStyle(a).opacity});
  if(performance.now()-start>2300){motionDone=true;return;}
 }
 requestAnimationFrame(capture);
}requestAnimationFrame(capture);'''

async def main():
 OUT.mkdir(exist_ok=True)
 records=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  for width,preference in [(1440,'no-preference'),(390,'no-preference'),(1440,'reduce')]:
   context=await browser.new_context(viewport={'width':width,'height':1000 if width>767 else 844},reduced_motion=preference,
       record_video_dir=str(OUT/LABEL),record_video_size={'width':width,'height':1000 if width>767 else 844})
   await context.add_init_script(INIT)
   page=await context.new_page(); errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   cdp=await context.new_cdp_session(page)
   await cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
   for reload in [False,True]:
    response=await (page.reload(wait_until='domcontentloaded') if reload else page.goto(BASE,wait_until='domcontentloaded'))
    await page.wait_for_function('window.motionDone===true',timeout=30000)
    record=await page.evaluate('''() => ({url:location.href,preference:matchMedia('(prefers-reduced-motion: reduce)').matches,
      frames:heroFrames,starts:heroStarts,
      styles:[...document.querySelectorAll('link[rel=stylesheet]')].map(e=>e.href),
      lines:[...document.querySelectorAll('.hero-headline-group')].map(e=>getComputedStyle(e.querySelector('.hero-headline-reveal')||e).animation),
      photo:getComputedStyle(document.querySelector('.hero-picture img')).animation,
      actions:getComputedStyle(document.querySelector('.hero-actions')).animation,
      resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('forestry-loader')).map(r=>({url:r.name,end:r.responseEnd})),
      storage:{local:Object.keys(localStorage),session:Object.keys(sessionStorage)}
    })''')
    record.update(width=width,reload=reload,status=response.status if response else None,errors=errors.copy())
    records.append(record)
    await page.screenshot(path=str(OUT/f'{LABEL}-{width}-{preference}-{int(reload)}.png'))
   video=page.video
   await context.close()
   await video.save_as(str(OUT/f'{LABEL}-{width}-{preference}.webm'))
  await browser.close()
 (OUT/f'{LABEL}.json').write_text(json.dumps(records,indent=2))
 for r in records:
  ready=next((f for f in r['frames'] if f['imageReady']),None)
  print(json.dumps({k:r[k] for k in ['url','status','width','reload','preference','lines','photo','actions','errors']}))
  print('First frame:',r['frames'][0], '\nFirst image-ready frame:',ready,'\nAnimation starts:',r['starts'])

if __name__=='__main__': asyncio.run(main())