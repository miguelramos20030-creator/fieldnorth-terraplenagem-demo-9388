import asyncio, json, re, hashlib, gzip, os
from pathlib import Path
from playwright.async_api import async_playwright, expect

ROOT = Path('/home/user/fieldnorth')
OUT = ROOT/'tests/results'
URL = os.environ.get('TEST_URL', 'http://127.0.0.1:4500/')
results = {'url': URL, 'conditions': 'Chrome Linux headless; static files-only HTTP server, no authentication, no transfer compression; viewport emulation, not physical devices', 'checks': []}
def check(name, ok, data=None):
 results['checks'].append({'name': name, 'passed': bool(ok), 'data': data})
 if not ok: raise AssertionError(f'{name}: {data}')

async def main():
 async with async_playwright() as p:
  browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
  for width in [320,390,768,1440]:
   ctx = await browser.new_context(viewport={'width':width,'height':900}, permissions=['clipboard-read','clipboard-write'])
   page = await ctx.new_page(); errors=[]; responses=[]; outgoing=[]
   page.on('pageerror',lambda e: errors.append(str(e)))
   page.on('response',lambda r: responses.append({'url':r.url,'status':r.status}))
   page.on('request',lambda r: outgoing.append({'url':r.url,'method':r.method,'body':r.post_data}))
   await page.goto(URL,wait_until='networkidle')
   data=await page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,lang:document.documentElement.lang,title:document.title,hero:getComputedStyle(document.querySelector("h1")).opacity,nav:getComputedStyle(document.querySelector("header")).opacity,video:document.querySelectorAll("video").length,scene:document.querySelector(".hero-scene").getAnimations()[0]?.effect.getTiming().duration})')
   check(f'{width}: width, language, immediate text/nav and first opening', data['width']==data['scroll'] and data['lang']=='pt-BR' and 'Máquinas' in data['title'] and data['hero']=='1' and data['nav']=='1' and data['video']==(1 if width>=768 else 0) and data['scene']==4000,data)
   await page.evaluate('Promise.all(document.querySelector(".hero").getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))')
   await page.screenshot(path=str(OUT/f'br-final-{width}.png'))
   await page.reload(wait_until='networkidle')
   duration=await page.evaluate('document.querySelector(".hero-scene").getAnimations()[0]?.effect.getTiming().duration')
   check(f'{width}: shortened return',duration==800,duration)
   await page.get_by_role('button',name='Rever abertura').click()
   duration=await page.evaluate('document.querySelector(".hero-scene").getAnimations()[0]?.effect.getTiming().duration')
   check(f'{width}: lightweight replay',duration==4000,duration)
   # Navigation must be usable before the four-second replay has finished.
   ids=['servicos','maquinas','aplicacoes','como-funciona','duvidas','orcamento']
   for start in ['top','middle','bottom']:
    for id in ids:
     await page.evaluate('(where)=>{document.documentElement.style.scrollBehavior="auto";scrollTo(0,where==="top"?0:where==="middle"?document.documentElement.scrollHeight/2:document.documentElement.scrollHeight)}',start)
     if width < 1024:
      await page.get_by_role('button',name='Abrir menu').click()
      await page.locator('#menu-mobile a[href="#'+id+'"]').click()
      check(f'{width}:{start}:{id} menu closed',not await page.locator('#menu-mobile').evaluate('(d)=>d.open'))
     else:
      await page.locator('header a[href="#'+id+'"]').click()
     await page.wait_for_function('(id)=>Math.abs(document.getElementById(id).getBoundingClientRect().top-parseFloat(getComputedStyle(document.getElementById(id)).scrollMarginTop))<3',arg=id,timeout=5000)
     top=await page.locator('#'+id).evaluate('(e)=>e.getBoundingClientRect().top')
     check(f'{width}:{start}:{id} correct anchor',top>=76,top)
   # Keyboard service selector and service preselection.
   await page.locator('#service-tab-0').focus(); await page.keyboard.press('ArrowDown')
   check(f'{width}: service keyboard',await page.locator('#service-tab-1').get_attribute('aria-selected')=='true')
   await page.locator('#service-panel').get_by_role('link',name='Planejar este serviço').click()
   planner=page.locator('#orcamento')
   await expect(planner.get_by_role('checkbox',name='Escavação e valas',exact=True)).to_be_checked()
   check(f'{width}: service preselection',await planner.get_by_role('checkbox',name='Escavação e valas',exact=True).is_checked())
   await page.locator('#maquinas article').first.get_by_role('link').click()
   await expect(planner.get_by_role('radio',name='Miniescavadeira',exact=True)).to_be_checked()
   check(f'{width}: machine and service preserved',await planner.get_by_role('radio',name='Miniescavadeira',exact=True).is_checked() and await planner.get_by_role('checkbox',name='Máquina com operador',exact=True).is_checked() and await planner.get_by_role('checkbox',name='Escavação e valas',exact=True).is_checked())
   await planner.get_by_role('checkbox',name='Terraplenagem e nivelamento',exact=True).check()
   await planner.get_by_role('button',name='Continuar',exact=True).click()
   await planner.get_by_role('button',name='Visualizar resumo').click()
   check(f'{width}: pt-BR city validation','Selecione uma cidade.' in await planner.inner_text())
   await planner.get_by_label('Cidade',exact=False).select_option('Toledo')
   await planner.get_by_role('button',name='Visualizar resumo').click()
   check(f'{width}: pt-BR goal validation','Descreva o objetivo do trabalho.' in await planner.inner_text())
   goal='Projeto fictício de teste: preparar terreno e vala.'
   await planner.get_by_role('textbox',name='O que você pretende fazer?').fill(goal)
   await planner.get_by_role('textbox',name='Área aproximada (opcional)').fill('-1')
   await planner.get_by_role('button',name='Visualizar resumo').click()
   check(f'{width}: area validation','Informe uma área maior que zero' in await planner.inner_text())
   await planner.get_by_role('textbox',name='Área aproximada (opcional)').fill('0,5')
   await planner.get_by_label('Unidade',exact=True).select_option('ha')
   await planner.get_by_role('button',name='Voltar',exact=True).click()
   check(f'{width}: multi-service back preserved',await planner.get_by_role('checkbox',name='Terraplenagem e nivelamento',exact=True).is_checked())
   await planner.get_by_role('button',name='Continuar',exact=True).click()
   check(f'{width}: details preserved',await planner.get_by_role('textbox',name='O que você pretende fazer?').input_value()==goal)
   await planner.get_by_role('button',name='Visualizar resumo').click()
   check(f'{width}: summary correct','0,5 ha' in await planner.inner_text() and goal in await planner.inner_text())
   await planner.get_by_role('button',name='Copiar resumo').click()
   await page.wait_for_function('document.querySelector(".copy-status")?.textContent.includes("Resumo copiado")')
   check(f'{width}: clipboard','Resumo copiado' in await planner.inner_text() and goal in await page.evaluate('navigator.clipboard.readText()'))
   await planner.get_by_role('button',name='Editar pedido').click()
   check(f'{width}: editing retained',await planner.get_by_role('textbox',name='O que você pretende fazer?').input_value()==goal)
   await planner.get_by_role('button',name='Visualizar resumo').click()
   await planner.get_by_role('button',name='Começar de novo').click()
   check(f'{width}: reset all services',await planner.locator('input[type=checkbox]:checked').count()==0)
   await planner.get_by_role('button',name='Continuar',exact=True).click()
   check(f'{width}: empty service validation','Selecione pelo menos um serviço.' in await planner.inner_text())
   await planner.get_by_role('button',name='Usar projeto de exemplo').click()
   await planner.get_by_role('button',name='Visualizar resumo').click()
   check(f'{width}: sample project','Cascavel' in await planner.inner_text() and '500 m²' in await planner.inner_text())
   # All photographic scenes open, contain keyboard focus, close, restore focus.
   for i in range(3):
    button=page.locator('.application-photo').nth(i)
    await button.click(); check(f'{width}: lightbox {i} open',await page.locator('.photo-dialog').evaluate('(d)=>d.open'))
    close=page.get_by_role('button',name='Fechar imagem'); await close.focus(); await page.keyboard.press('Shift+Tab')
    check(f'{width}: lightbox focus contained',await page.evaluate('document.querySelector(".photo-dialog").contains(document.activeElement)'))
    await page.keyboard.press('Escape')
    check(f'{width}: lightbox focus returned',await button.evaluate('(e)=>document.activeElement===e'))
   await page.get_by_role('button',name='Planejamento ilustrativo',exact=True).focus(); await page.keyboard.press('Space')
   await expect(page.get_by_role('button',name='Planejamento ilustrativo',exact=True)).to_have_attribute('aria-pressed','true')
   check(f'{width}: overlay keyboard',await page.locator('.planning-photo').evaluate('(e)=>e.classList.contains("overlay-active")'))
   await page.get_by_role('button',name='Foto do terreno',exact=True).click()
   await expect(page.get_by_role('button',name='Foto do terreno',exact=True)).to_have_attribute('aria-pressed','true')
   check(f'{width}: original photo',not await page.locator('.planning-photo').evaluate('(e)=>e.classList.contains("overlay-active")'))
   for i in range(5):
    detail=page.locator('.faq-list details').nth(i); await detail.locator('summary').click(); check(f'{width}: FAQ {i}',await detail.evaluate('(e)=>e.open'))
   if width < 1024:
    await page.get_by_role('button',name='Abrir menu').click(); await page.get_by_role('button',name='Fechar menu').focus(); await page.keyboard.press('Shift+Tab')
    check(f'{width}: mobile menu focus trap',await page.evaluate('document.querySelector("#menu-mobile").contains(document.activeElement)'))
    await page.keyboard.press('Escape'); check(f'{width}: menu Escape/focus',await page.get_by_role('button',name='Abrir menu').evaluate('(e)=>e===document.activeElement'))
   check(f'{width}: no badge or personal controls',await page.locator('input[type=email],input[name=name],[class*=runable-badge]').count()==0)
   check(f'{width}: no JS errors/local failures',not errors and not [r for r in responses if r['url'].startswith(URL) and r['status']>=400],{'errors':errors})
   check(f'{width}: no data sent/persisted',not [r for r in outgoing if r['body'] and (goal in r['body'] or 'Localidade de exemplo' in r['body'])],await page.evaluate('({session:{...sessionStorage},local:{...localStorage}})'))
   await page.reload(wait_until='networkidle')
   check(f'{width}: planner memory-only after reload',await planner.locator('input[type=checkbox]:checked').count()==0)
   await page.goto(URL+'?direct=1#maquinas',wait_until='networkidle')
   top=await page.locator('#maquinas').evaluate('(e)=>e.getBoundingClientRect().top')
   check(f'{width}: direct fragment',76<=top<=101,top)
   await ctx.close()
  # Static hero fallback, reduced motion, data-saving and touch overlay.
  for mode in ['reduced','save-data','failed-image']:
   ctx=await browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce' if mode=='reduced' else 'no-preference',has_touch=True,is_mobile=True)
   if mode=='save-data': await ctx.add_init_script('Object.defineProperty(navigator,"connection",{value:{saveData:true}})')
   if mode=='failed-image': await ctx.route('**/images/br-loader-*.webp',lambda route:route.abort())
   page=await ctx.new_page(); await page.goto(URL,wait_until='networkidle')
   check(f'{mode}: hero stays readable',await page.locator('h1').is_visible() and await page.locator('.hero-actions a').first.is_visible())
   if mode!='failed-image': check(f'{mode}: animations disabled',await page.evaluate('document.getAnimations().length')==0)
   await page.get_by_role('button',name='Planejamento ilustrativo',exact=True).tap()
   await expect(page.get_by_role('button',name='Planejamento ilustrativo',exact=True)).to_have_attribute('aria-pressed','true')
   check(f'{mode}: touch overlay',await page.get_by_role('button',name='Planejamento ilustrativo',exact=True).get_attribute('aria-pressed')=='true')
   await page.screenshot(path=str(OUT/f'br-{mode}.png')); await ctx.close()
  await browser.close()
 build_root=Path(os.environ.get('BUILD_ROOT',str(ROOT)))
 results['build']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (build_root/'packages/web/dist/assets').iterdir()}

try: asyncio.run(main())
finally:
 (OUT/os.environ.get('REPORT_NAME','br-acceptance.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print(f"{sum(c['passed'] for c in results['checks'])}/{len(results['checks'])} checks passed")