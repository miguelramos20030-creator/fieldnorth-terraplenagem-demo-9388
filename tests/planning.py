import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path('/home/user/fieldnorth')
OUT=ROOT/'tests/results/planning'
OUT.mkdir(exist_ok=True)
URL=os.environ.get('TEST_URL','http://localhost:4200/')
checks=[]
def check(name,ok,data=None):
 checks.append({'name':name,'passed':bool(ok),'data':data})
 if not ok: raise AssertionError(name)

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  for width in [320,390,768,1440]:
   page=await browser.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(URL,wait_until='networkidle')
   section=page.locator('#planejamento');image=section.locator('.planning-photo > img')
   await image.scroll_into_view_if_needed();await image.evaluate('(i)=>i.decode()')
   await page.evaluate('document.documentElement.style.scrollBehavior="auto";scrollTo(0,document.querySelector("#planejamento").offsetTop-90)')
   # Hide fixed chrome only for section screenshots, never change site code.
   await page.add_style_tag(content='.site-header,.skip-link{visibility:hidden!important}')
   def signature_js():
    return '(i)=>({node:i.dataset.testNode||(i.dataset.testNode="same-image"),src:i.currentSrc,srcset:i.srcset,alt:i.alt,x:i.getBoundingClientRect().x,y:i.getBoundingClientRect().y,w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,position:getComputedStyle(i).objectPosition,fit:getComputedStyle(i).objectFit})'
   before=await image.evaluate(signature_js())
   pixels='(i)=>{let c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext("2d").drawImage(i,0,0);return c.toDataURL()}'
   before_pixels=await image.evaluate(pixels)
   check(f'{width}: clear dedicated responsive image', 'br-planning-plot-' in before['src'] and '640w' in before['srcset'] and '960w' in before['srcset'] and 'sem máquinas' in before['alt'],before)
   await section.screenshot(path=str(OUT/f'photo-{width}.png'))
   await section.get_by_role('button',name='Planejamento ilustrativo',exact=True).focus();await page.keyboard.press('Space')
   check(f'{width}: keyboard planning state',await section.get_by_role('button',name='Planejamento ilustrativo',exact=True).get_attribute('aria-pressed')=='true' and await section.locator('.planning-overlay').get_attribute('aria-hidden')=='false')
   after=await image.evaluate(signature_js())
   check(f'{width}: identical photo node/source/crop/geometry in both states',before==after)
   geometry=await section.locator('.planning-photo').evaluate('(s)=>{let i=s.querySelector("img").getBoundingClientRect(),v=s.querySelector("svg").getBoundingClientRect();return {image:[i.x,i.y,i.width,i.height],overlay:[v.x,v.y,v.width,v.height],box:s.querySelector("svg").getAttribute("viewBox")}}')
   check(f'{width}: image/overlay share 3:2 frame and 1200x800 coordinates',geometry['image']==geometry['overlay'] and abs(geometry['image'][2]/geometry['image'][3]-1.5)<0.005 and geometry['box']=='0 0 1200 800',geometry)
   labels=await section.locator('.planning-photo').evaluate('(s)=>{let r=s.getBoundingClientRect();return [...s.querySelectorAll(".annotation")].map(e=>{let b=e.getBoundingClientRect();return {text:e.textContent,inside:b.left>=r.left && b.right<=r.right && b.top>=r.top && b.bottom<=r.bottom}})}')
   check(f'{width}: Portuguese labels remain contained',len(labels)==2 and all(l['inside'] for l in labels),labels)
   check(f'{width}: disclaimer preserved',await section.locator('figcaption').inner_text()=='Simulação visual. A execução depende da avaliação do local.')
   await section.screenshot(path=str(OUT/f'planning-{width}.png'))
   await section.get_by_role('button',name='Foto do terreno',exact=True).click()
   check(f'{width}: photo state restores exact image pixels',await image.evaluate(pixels)==before_pixels and await section.locator('.planning-overlay').get_attribute('aria-hidden')=='true')
   check(f'{width}: no JS errors or horizontal overflow',not errors and await page.evaluate('document.documentElement.scrollWidth===innerWidth'),errors)
   await page.close()
  await browser.close()

try:asyncio.run(main())
finally:
 (OUT/('acceptance-production.json' if '450' in URL else 'acceptance-preview.json')).write_text(json.dumps({'url':URL,'checks':checks},ensure_ascii=False,indent=2))
 print(f"{sum(c['passed'] for c in checks)}/{len(checks)} checks passed")