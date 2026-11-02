import asyncio, json, os, subprocess
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path('/home/user/fieldnorth')
OUT = ROOT/os.environ.get('TEST_OUT', 'tests/results/hero-video')
OUT.mkdir(parents=True, exist_ok=True)
URL = os.environ.get('TEST_URL', 'http://127.0.0.1:4500/')
results = {'url': URL, 'checks': [], 'conditions': 'Chrome Linux; emulated viewports, production static files unless URL overridden'}
def check(name, passed, data=None):
 results['checks'].append({'name':name, 'passed':bool(passed), 'data':data})
 if not passed: raise AssertionError(f'{name}: {data}')

async def state(page):
 return await page.locator('video').evaluate('(v)=>({time:v.currentTime,paused:v.paused,ready:v.readyState,duration:v.duration,muted:v.muted,inline:v.playsInline,loop:v.loop,frames:v.getVideoPlaybackQuality().totalVideoFrames})')

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await browser.new_context(viewport={'width':1440,'height':900},record_video_dir=str(OUT/'recording'),record_video_size={'width':1440,'height':900})
  page=await ctx.new_page(); errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  gate=asyncio.Event(); requested=asyncio.Event()
  async def defer_video(route):
   requested.set(); await gate.wait(); await route.continue_()
  await page.route('**/*.mp4',defer_video)
  await page.goto(URL,wait_until='load')
  check('immediate headline/buttons/header visible',await page.locator('h1').is_visible() and await page.locator('.hero-actions a').first.is_visible() and await page.locator('header').is_visible())
  check('source absent until after primary load/paint',await page.locator('video').count()==0)
  await requested.wait()
  await page.screenshot(path=str(OUT/'poster-before-video.png'))
  check('poster retained during blocked video request',await page.locator('.hero-scene img').evaluate('(i)=>i.complete && i.naturalWidth>0') and await page.locator('video').evaluate('(v)=>getComputedStyle(v).opacity')=='0')
  await page.locator('header a[href="#servicos"]').click()
  await page.wait_for_function('scrollY>400')
  check('navigation works while video pending',await page.evaluate('scrollY')>400)
  await page.evaluate('document.documentElement.style.scrollBehavior="auto";scrollTo(0,0)')
  await page.get_by_role('button',name='Rever abertura').click()
  check('replay works before video response',await page.evaluate('scrollY')==0 and await page.locator('h1').is_visible())
  gate.set()
  await page.wait_for_function('document.querySelector("video")?.currentTime>0.25')
  a=await state(page)
  await page.wait_for_function('(t)=>document.querySelector("video").currentTime>t+0.6',arg=a['time'])
  b=await state(page)
  check('native muted inline loop and advancing decoded frames',b['time']>a['time'] and b['frames']>a['frames'] and b['muted'] and b['inline'] and b['loop'],{'a':a,'b':b})
  # Uninterrupted real-time playback evidence, including a naturally crossed seam.
  for label,t in [('early',1),('lifting',3.5),('dumping',5.8),('seam',7.05)]:
   await page.wait_for_function('(t)=>document.querySelector("video").currentTime>=t',arg=t)
   await page.screenshot(path=str(OUT/f'playing-{label}.png'))
  await page.wait_for_function('document.querySelector("video").currentTime<0.4')
  await page.screenshot(path=str(OUT/'playing-loop-return.png'))
  check('uninterrupted native loop retains visible video and poster',await page.locator('video').evaluate('(v)=>!v.paused && getComputedStyle(v).opacity==="1"') and await page.locator('.hero-scene img').is_visible())
  control=page.get_by_role('button',name='Pausar vídeo',exact=True)
  await control.focus()
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
  check('pause control keyboard focus and 44px hit area',await control.evaluate('(b)=>document.activeElement===b && b.getBoundingClientRect().height>=44 && getComputedStyle(b).outlineStyle!=="none"'))
  await page.keyboard.press('Space')
  a=await state(page); await page.wait_for_timeout(450); b=await state(page)
  check('keyboard pause freezes currentTime',a['paused'] and abs(b['time']-a['time'])<0.03,{'a':a,'b':b})
  # Capture decoded working frames through the browser, not CSS framing.
  for t in [0.5,3.5,5.8,6.65,7.1,0]:
   await page.locator('video').evaluate('(v,t)=>new Promise(resolve=>{v.addEventListener("seeked",resolve,{once:true});v.currentTime=t})',t)
   await page.wait_for_timeout(150)
   await page.screenshot(path=str(OUT/f'hero-frame-{t}.png'))
   data=await page.locator('video').evaluate('(v)=>{let c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);return c.toDataURL("image/png")}')
   import base64
   (OUT/f'decoded-frame-{t}.png').write_bytes(base64.b64decode(data.split(',')[1]))
  from PIL import Image, ImageChops, ImageStat
  im1=Image.open(OUT/'decoded-frame-0.5.png').crop((700,80,1160,560))
  im2=Image.open(OUT/'decoded-frame-3.5.png').crop((700,80,1160,560))
  difference=sum(ImageStat.Stat(ImageChops.difference(im1,im2)).mean)/3
  check('decoded bucket-region frames change independently of CSS',difference>8,{'mean_pixel_difference':difference})
  await page.get_by_role('button',name='Reproduzir vídeo',exact=True).click()
  await page.wait_for_function('!document.querySelector("video").paused')
  await page.locator('video').evaluate('(v)=>v.currentTime=6.85')
  await page.wait_for_function('document.querySelector("video").currentTime<0.5')
  await page.wait_for_function('document.querySelector("video").readyState>=2 && !document.querySelector("video").paused')
  check('loop crosses end without empty media',await page.locator('video').evaluate('(v)=>v.readyState>=2 && !v.paused'))
  await page.evaluate('scrollTo(0,1500)')
  await page.wait_for_function('document.querySelector("video").paused')
  check('offscreen pauses media',(await state(page))['paused'])
  await page.evaluate('scrollTo(0,0)')
  await page.wait_for_function('!document.querySelector("video").paused')
  check('onscreen resumes media',not (await state(page))['paused'])
  await page.get_by_role('button',name='Pausar vídeo',exact=True).click()
  await page.evaluate('scrollTo(0,1500)'); await page.wait_for_timeout(150)
  await page.evaluate('scrollTo(0,0)'); await page.wait_for_timeout(200)
  check('manual pause survives offscreen return',(await state(page))['paused'])
  await page.evaluate('scrollTo(0,1500)')
  await page.locator('.replay-button').first.evaluate('(b)=>b.click()')
  immediate=await state(page)
  check('replay scrolls to top and resets time',await page.evaluate('scrollY')==0 and immediate['time']<0.25,immediate)
  await page.wait_for_function('document.querySelector("video").currentTime>0.3 && !document.querySelector("video").paused')
  check('replay restarts four-second entrance',await page.locator('.hero-scene').evaluate('(e)=>e.getAnimations()[0].effect.getTiming().duration')==4000)
  await page.reload(wait_until='networkidle')
  await page.wait_for_function('document.querySelector("video")?.currentTime>0.3')
  check('returning session does not suppress playback',not (await state(page))['paused'] and await page.locator('.hero-scene').evaluate('(e)=>e.getAnimations()[0].effect.getTiming().duration')==800)
  await page.evaluate('()=>{Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"));}')
  await page.wait_for_function('document.querySelector("video").paused')
  check('simulated hidden-tab event pauses media',(await state(page))['paused'])
  await page.evaluate('()=>{Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"));}')
  await page.wait_for_function('!document.querySelector("video").paused')
  check('simulated visible-tab event resumes media',not (await state(page))['paused'])
  # Changing reduced motion unmounts source, restoring static poster.
  await page.emulate_media(reduced_motion='reduce')
  await page.wait_for_function('!document.querySelector("video")')
  check('live reduced-motion removes video',await page.locator('video').count()==0)
  check('no JS errors',not errors,errors)
  await ctx.close()
  for width,mode in [(320,'normal'),(390,'normal'),(844,'touch-landscape'),(1440,'reduced'),(1440,'save-data')]:
   ctx=await browser.new_context(viewport={'width':width,'height':900},has_touch=mode=='touch-landscape',is_mobile=mode=='touch-landscape',reduced_motion='reduce' if mode=='reduced' else 'no-preference')
   if mode=='save-data': await ctx.add_init_script('Object.defineProperty(navigator,"connection",{value:{saveData:true}})')
   page=await ctx.new_page(); requests=[]
   page.on('request',lambda r: requests.append(r.url) if '.mp4' in r.url else None)
   await page.goto(URL,wait_until='networkidle'); await page.wait_for_timeout(700)
   await page.get_by_role('button',name='Rever abertura').click(); await page.wait_for_timeout(300)
   check(f'{width}/{mode}: zero video requests or hidden elements',not requests and await page.locator('video').count()==0,requests)
   check(f'{width}/{mode}: static poster/readable text/no overflow',await page.locator('.hero-scene img').evaluate('(i)=>i.complete && i.naturalWidth>0') and await page.locator('h1').is_visible() and await page.evaluate('innerWidth===document.documentElement.scrollWidth'))
   await page.screenshot(path=str(OUT/f'fallback-{width}-{mode}.png')); await ctx.close()
  # Failure fallback and denied-autoplay recovery.
  for mode in ['failed-video','denied-autoplay']:
   ctx=await browser.new_context(viewport={'width':1440,'height':900})
   if mode=='failed-video': await ctx.route('**/*.mp4',lambda r:r.abort())
   else: await ctx.add_init_script('window.realPlay=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException("blocked","NotAllowedError"))}')
   page=await ctx.new_page(); await page.goto(URL,wait_until='networkidle'); await page.wait_for_timeout(600)
   check(f'{mode}: immediate poster and content preserved',await page.locator('h1').is_visible() and await page.locator('.hero-scene img').evaluate('(i)=>i.complete && i.naturalWidth>0'))
   if mode=='denied-autoplay':
    await page.evaluate('()=>{HTMLMediaElement.prototype.play=window.realPlay;}')
    await page.get_by_role('button',name='Reproduzir vídeo',exact=True).click()
    await page.wait_for_function('document.querySelector("video").currentTime>0.3')
    check('denied autoplay recoverable by accessible play button',not (await state(page))['paused'])
   await ctx.close()
  await browser.close()
 for kind,path in [('source',ROOT/'packages/web/public/videos/br-compact-machine-loop.mp4'),('production',ROOT/'packages/web/dist/videos/br-compact-machine-loop.mp4')]:
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_type,width,height,r_frame_rate','-of','json',str(path)]))
  s=probe['streams']; f=probe['format']
  check(f'{kind}: 6–8s/720p/24fps/no audio/<1.5MB',len(s)==1 and s[0]['codec_type']=='video' and s[0]['height']<=720 and s[0]['r_frame_rate']=='24/1' and 6<=float(f['duration'])<=8 and int(f['size'])<=1500000,probe)

try: asyncio.run(main())
finally:
 (OUT/('acceptance-preview.json' if '4200' in URL else 'acceptance.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print(f"{sum(c['passed'] for c in results['checks'])}/{len(results['checks'])} checks passed")