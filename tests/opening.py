"""Hero entrance checks against the web-only production build (headless Chrome).
Run with FIELDNORTH_TEST_URL, default http://127.0.0.1:4500.
Animation timeline sampling pauses CSS animations; reload/replay checks run normally.
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('FIELDNORTH_TEST_URL', 'http://127.0.0.1:4500')
OUT = Path(__file__).parent / 'results'
SELECTORS = ['.hero-picture img', '.hero-headline-group:nth-child(1) .hero-headline-reveal',
             '.hero-headline-group:nth-child(2) .hero-headline-reveal', '.hero-headline-group:nth-child(3) .hero-headline-reveal',
             '.hero-content > p', '.hero-actions']

async def sample(page, time):
    return await page.evaluate('''({selectors,time}) => selectors.map(selector => {
      const element = document.querySelector(selector);
      for (const animation of element.getAnimations()) {
        animation.pause(); animation.currentTime = time;
      }
      const style = getComputedStyle(element);
      const matrix = new DOMMatrixReadOnly(style.transform);
      return {opacity:Number(style.opacity),y:matrix.m42,scale:matrix.a};
    })''', {'selectors': SELECTORS, 'time': time})

async def main():
    OUT.mkdir(exist_ok=True)
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        context = await browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='no-preference')
        await context.route('https://**/*', lambda r: r.abort())
        await context.add_init_script('''window.heroStarts=[];
          document.addEventListener('animationstart',e=>{
            if(e.animationName.startsWith('hero-')) window.heroStarts.push(e.animationName);
          });''')
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(BASE, wait_until='networkidle')
        timing = await page.evaluate('''selectors=>selectors.map(selector=>{
          const element=document.querySelector(selector);
          const a=element.getAnimations()[0];
          const t=a.effect.getTiming();
          return {name:a.animationName,duration:t.duration,delay:t.delay,easing:getComputedStyle(element).animationTimingFunction,
                  properties:Object.keys(a.effect.getKeyframes()[0]).filter(k=>!['offset','easing','composite','computedOffset'].includes(k))};
        })''', SELECTORS)
        assert [(a['delay'],a['duration']) for a in timing] == [(0,1800),(120,700),(360,700),(600,700),(1000,500),(1300,500)], timing
        assert all(set(a['properties']) <= {'transform','opacity'} for a in timing)
        assert all(a['easing']=='cubic-bezier(0.2, 0.65, 0.3, 1)' for a in timing)
        results['exact_overlapping_css_timings'] = timing
        start = await sample(page, 0)
        assert abs(start[0]['scale']-1.08) < .0001
        assert all(s['opacity']==0 for s in start[1:])
        assert all(s['y']>80 for s in start[1:4]) and [s['y'] for s in start[4:]] == [12,12]
        mid = await sample(page, 450)
        assert 1.025 < mid[0]['scale'] < 1.08
        assert 0 < mid[2]['opacity'] < mid[1]['opacity'] < 1
        assert all(s['opacity']==0 for s in mid[3:])
        later = await sample(page, 1500)
        assert all(s['opacity']==1 for s in later[1:5])
        assert 0 < later[5]['opacity'] < 1
        end = await sample(page, 1800)
        assert all(s['opacity']==1 and abs(s['y']) < .001 and abs(s['scale']-1) < .001 for s in end)
        results['start_midpoint_final_transforms_opacity'] = {'start':start,'450ms':mid,'1500ms':later,'1800ms':end}

        # Exact same layout dimensions during the entrance; no extra mobile lines.
        layouts = {}
        for width in [360,390,768,1440]:
            await page.set_viewport_size({'width':width,'height':844 if width<768 else 1000})
            await page.goto(BASE, wait_until='networkidle')
            async def geometry():
                return await page.evaluate('''() => ({
                  scroll:document.documentElement.scrollWidth,
                  boxes:['header','.hero','.hero h1','.hero-content','.hero-picture'].map(s=>{
                    const r=document.querySelector(s).getBoundingClientRect();
                    return {x:r.x,y:r.y,width:r.width,height:r.height};
                  }), headline:[...document.querySelectorAll('.hero-headline-group')].map(e=>e.offsetHeight)
                })''')
            await sample(page, 0)
            initial = await geometry()
            await sample(page, 450)
            await page.screenshot(path=str(OUT/f'opening-{width}-450ms.png'))
            await sample(page, 1800)
            final = await geometry()
            assert initial==final and final['scroll']==width, (width,initial,final)
            await page.screenshot(path=str(OUT/f'opening-{width}-final.png'))
            await page.emulate_media(reduced_motion='reduce')
            reduced = await geometry()
            assert final==reduced
            assert await page.evaluate("document.querySelector('.hero').getAnimations({subtree:true}).length") == 0
            immediate = await sample(page, 0)
            assert all(s['opacity']==1 and s['y']==0 and s['scale']==1 for s in immediate)
            await page.emulate_media(reduced_motion='no-preference')
            layouts[width] = {'stable_dimensions':True,'no_overflow':True,'reduced_motion_immediate':True,'headline_group_heights':final['headline']}
        results['responsive_and_reduced_motion'] = layouts

        # Both anchors are genuinely pointer-accessible at opacity 0; keyboard focus
        # cancels the action-group entrance to give immediate visual feedback.
        for target in ['estimate','services']:
            await page.goto(BASE,wait_until='networkidle')
            await sample(page, 0)
            link = page.locator(f'.hero-actions a[href="#{target}"]')
            box = await link.bounding_box()
            hit = await page.evaluate('''({x,y})=>document.elementFromPoint(x,y)?.closest('a')?.getAttribute('href')''',
                                      {'x':box['x']+box['width']/2,'y':box['y']+box['height']/2})
            assert hit == '#'+target
            await page.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2)
            await expect(page).to_have_url(BASE+'/#'+target)
        await page.goto(BASE,wait_until='networkidle')
        await sample(page,0)
        await page.locator('.hero-actions a').first.focus()
        assert await page.locator('.hero-actions').evaluate('(e)=>getComputedStyle(e).opacity') == '1'
        results['ctas_pointer_clickable_at_start_keyboard_immediately_visible'] = 'pass'

        # Allow the browser's real clock to finish, then ensure no replay on interactions.
        await page.goto(BASE,wait_until='networkidle')
        await page.wait_for_function("window.heroStarts.length===6 && document.querySelector('.hero-picture img').getAnimations()[0].playState==='finished'")
        await page.locator('header a[href="#services"]').click()
        await page.locator('#service-tab-1').click()
        await page.locator('#service-panel button').click()
        await page.get_by_role('button',name='Use sample project').click()
        await page.get_by_role('button',name='Continue',exact=True).click()
        await page.get_by_role('button',name='Preview Estimate Request').click()
        await expect(page.get_by_role('heading',name='Demo preview complete.')).to_be_visible()
        assert await page.evaluate('window.heroStarts.length') == 6
        await page.reload(wait_until='networkidle')
        await page.wait_for_function("window.heroStarts.length===6 && document.querySelector('.hero-picture img').getAnimations()[0].playState==='finished'")
        results['initial_load_reload_once_no_hash_service_form_replay'] = 'pass'

        for width in [360,390,768,1440]:
            await page.set_viewport_size({'width':width,'height':844 if width<768 else 1000})
            for ident in ['services','estimate']:
                # A unique URL forces a document load, not an in-page smooth
                # hash transition from the previous test's location.
                await page.goto(BASE+f'/?direct={width}-{ident}#'+ident,wait_until='networkidle')
                await page.wait_for_function("document.querySelector('.hero-picture img').getAnimations()[0].playState==='finished'")
                top,header,offset = await page.evaluate('''id=>{
                  const target=document.getElementById(id);
                  return [target.getBoundingClientRect().top,document.querySelector('header').getBoundingClientRect().bottom,
                    parseFloat(getComputedStyle(target).scrollMarginTop)+parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)];
                }''',ident)
                assert top >= header-1 and abs(top-offset) <= 1, (width,ident,top,header,offset)
                assert await page.evaluate('scrollY') > 0
        results['direct_section_links_keep_position_all_widths'] = 'pass'

        # No dependency on successful image/font loads to reveal the text.
        await page.route('**/*.webp', lambda r:r.abort())
        await page.route('**/*.woff2', lambda r:r.abort())
        await page.goto(BASE,wait_until='networkidle')
        await page.wait_for_function("document.querySelector('.hero-picture img').getAnimations()[0].playState==='finished'")
        assert await page.locator('.hero-headline-reveal').first.evaluate('(e)=>getComputedStyle(e).opacity') == '1'
        assert await page.evaluate('document.body.style.overflow') == ''
        assert await page.evaluate('Object.keys(localStorage).length+Object.keys(sessionStorage).length') == 0
        results['no_image_font_gate_scroll_lock_or_storage'] = 'pass'
        assert not errors, errors
        results['browser_errors'] = errors
        await browser.close()
    (OUT/'opening.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))

if __name__ == '__main__':
    asyncio.run(main())