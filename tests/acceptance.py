"""Browser acceptance checks against backend-free static production output.
Requires Python Playwright and a Chrome executable. Run the static server first.
"""
import asyncio, base64, json, os
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('FIELDNORTH_TEST_URL', 'http://127.0.0.1:4500')
OUT = Path(__file__).parent / 'results'
OUT.mkdir(exist_ok=True)

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        context = await browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
        page = await context.new_page()
        requests, errors = [], []
        page.on('request', lambda r: requests.append({'url':r.url,'method':r.method,'data':r.post_data}))
        page.on('pageerror', lambda e: errors.append(str(e)))
        await context.route('**/api/**', lambda r: r.abort())
        await context.route('https://**/*', lambda r: r.abort())
        await page.goto(BASE, wait_until='networkidle')
        await expect(page.locator('h1')).to_have_count(1)
        assert 'Portfolio Concept' in await page.title()
        assert await page.locator('meta[name="robots"]').get_attribute('content') == 'noindex,follow'
        assert not any('/api/' in r['url'] for r in requests)
        results['static_without_backend_or_external_network'] = 'pass'

        # Initial/default service CTA and every other service choice.
        for i, title in enumerate(['Land Clearing','Forestry Mulching','Brush Removal']):
            await page.get_by_role('tab', name=f'0{i+1} {title}', exact=False).click()
            await expect(page.locator('#service-panel h3')).to_have_text(title)
            await expect(page.locator(f'#service-tab-{i}')).to_have_attribute('aria-selected','true')
            await page.locator('#service-panel button').click()
            await expect(page.get_by_role('radio', name=title, exact=True)).to_be_checked()
        results['three_services_and_cta_preselection'] = 'pass'

        # Sample fills all details, preserves Brush Removal and does not skip flow.
        await page.get_by_role('button',name='Use sample project').click()
        await expect(page.get_by_role('radio',name='Brush Removal',exact=True)).to_be_checked()
        await page.get_by_role('button',name='Continue',exact=True).click()
        await expect(page.locator('#location')).to_have_value('Winter Garden')
        await expect(page.locator('#full-name')).to_have_value('Demo Visitor')
        await expect(page.locator('#email')).to_have_value('demo@example.com')
        await expect(page.locator('#area-size')).to_have_value('1-3 acres')
        await page.get_by_role('button',name='Back',exact=True).click()
        await page.get_by_role('button',name='Continue',exact=True).click()
        await expect(page.locator('#project-details')).to_have_value('Open an access route while keeping mature trees.')
        await page.get_by_role('button',name='Preview Estimate Request').click()
        await expect(page.get_by_role('heading',name='Demo preview complete.')).to_be_visible()
        await expect(page.locator('.result-notice')).to_contain_text('No request was sent.')
        await expect(page.locator('.preview-result dl')).to_contain_text('Brush Removal')
        results['sample_back_and_complete_preview'] = 'pass'
        await page.get_by_role('button',name='Edit details').click()
        await expect(page.locator('#email')).to_have_value('demo@example.com')
        await page.locator('#email').fill('not-an-email')
        await page.get_by_role('button',name='Preview Estimate Request').click()
        await expect(page.locator('#email-error')).to_be_visible()
        await expect(page.locator('#email')).to_be_focused()
        await page.locator('#email').fill('demo@example.com')
        await page.get_by_role('button',name='Preview Estimate Request').click()
        # Re-entry through another service updates only work, not property data.
        await page.locator('#service-tab-0').click()
        await page.locator('#service-panel button').click()
        await expect(page.get_by_role('radio',name='Land Clearing',exact=True)).to_be_checked()
        await page.get_by_role('button',name='Continue',exact=True).click()
        await expect(page.locator('#email')).to_have_value('demo@example.com')
        await page.get_by_role('button',name='Preview Estimate Request').click()
        await page.get_by_role('button',name='Start another preview').click()
        await expect(page.locator('#estimate h2')).to_be_focused()
        await expect(page.get_by_role('radio',name='Land Clearing',exact=True)).not_to_be_checked()
        results['edit_invalid_email_service_reentry_reset'] = 'pass'

        await page.get_by_role('button',name='Continue',exact=True).click()
        await expect(page.locator('#service-error')).to_be_visible()
        await expect(page.get_by_role('radio',name='Land Clearing',exact=True)).to_be_focused()
        await page.get_by_role('radio',name='Land Clearing',exact=True).check()
        await page.get_by_role('button',name='Continue',exact=True).click()
        await expect(page.locator('#location')).to_have_value('')
        await expect(page.locator('#email')).to_have_value('')
        await page.get_by_role('button',name='Preview Estimate Request').click()
        for ident in ['location-error','area-error','name-error','email-error']:
            await expect(page.locator('#'+ident)).to_be_visible()
        await expect(page.locator('#location')).to_be_focused()
        await page.get_by_role('button',name='Use sample project').click()
        await expect(page.get_by_role('radio',name='Land Clearing',exact=True)).to_be_checked()
        await page.get_by_role('button',name='Continue',exact=True).click()
        await page.get_by_role('button',name='Preview Estimate Request').click()
        await page.get_by_role('button',name='Start another preview').click()
        await page.get_by_role('button',name='Use sample project').click()
        await expect(page.get_by_role('radio',name='Forestry Mulching',exact=True)).to_be_checked()
        results['required_validation_full_clear_and_sample_default'] = 'pass'

        # Lightbox native dialog, Escape, close and opener focus return.
        for title in ['Open-lot planning','Vegetation management','Property access']:
            opener = page.get_by_role('button',name=f'Open {title} image')
            await opener.click()
            await expect(page.locator('.photo-lightbox')).to_be_visible()
            await expect(page.locator('#lightbox-title')).to_have_text(title)
            await page.keyboard.press('Tab')
            assert await page.evaluate('document.querySelector(".photo-lightbox").contains(document.activeElement)')
            if title == 'Property access': await page.get_by_role('button',name='Close image',exact=True).click()
            else: await page.keyboard.press('Escape')
            await expect(opener).to_be_focused()
        results['three_gallery_lightboxes_focus_escape_close'] = 'pass'

        # Range keyboard and pointer.
        slider = page.get_by_role('slider',name='Reveal planning concept')
        await slider.focus()
        before = int(await slider.input_value())
        await page.keyboard.press('ArrowRight')
        assert int(await slider.input_value()) == before + 1
        await slider.scroll_into_view_if_needed()
        box = await slider.bounding_box()
        await page.mouse.move(box['x'] + box['width']*.52, box['y']+box['height']/2)
        await page.mouse.down()
        await page.mouse.move(box['x'] + box['width']*.8, box['y']+box['height']/2,steps=15)
        await page.mouse.up()
        assert int(await slider.input_value()) >= 75
        results['divider_keyboard_and_pointer_drag'] = 'pass'
        await slider.press('Home')
        for _ in range(51): await slider.press('ArrowRight')

        # FAQs start open, can close and support keyboard.
        first = page.locator('#faq-button-0')
        await expect(first).to_have_attribute('aria-expanded','true')
        await first.click()
        await expect(first).to_have_attribute('aria-expanded','false')
        await first.focus(); await page.keyboard.press('Enter')
        await expect(first).to_have_attribute('aria-expanded','true')
        for i in range(1,5):
            await page.locator(f'#faq-button-{i}').click()
            await expect(page.locator(f'#faq-answer-{i}')).to_be_visible()
        results['faqs_all_states_keyboard'] = 'pass'

        # All specified viewports: viewport overflow, broken images, header offsets, screenshots.
        viewports = {}
        for width in [360,390,768,1024,1440]:
            await page.set_viewport_size({'width':width,'height':900 if width>767 else 844})
            await page.evaluate('window.scrollTo(0,0)')
            for ident in ['services','scenarios','potential','process','area','faqs','estimate']:
                await page.locator('#'+ident).scroll_into_view_if_needed()
            broken = await page.evaluate('[...document.images].filter(i=>i.offsetParent!==null && (!i.complete || i.naturalWidth===0)).map(i=>i.src)')
            assert not broken, broken
            metrics = await page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
            assert metrics['scroll'] <= width and metrics['body'] <= width, metrics
            for ident in ['services','potential','process','area','faqs','estimate']:
                await page.evaluate('(id)=>{ location.hash=id; document.getElementById(id).scrollIntoView(); }',ident)
                top = await page.locator('#'+ident).evaluate('(e)=>e.getBoundingClientRect().top')
                header = await page.locator('header').evaluate('(e)=>e.getBoundingClientRect().bottom')
                assert top >= header-1, (width,ident,top,header)
            await page.evaluate('window.scrollTo(0,0)')
            await page.screenshot(path=str(OUT/f'viewport-{width}.png'),full_page=True)
            viewports[width] = metrics
        results['responsive_viewports_no_overflow_images_offsets'] = viewports

        # Mobile menu focus trap / close / anchors.
        await page.set_viewport_size({'width':390,'height':844})
        await page.evaluate('window.scrollTo(0,0)')
        menu = page.get_by_role('button',name='Open navigation menu')
        await menu.click()
        await expect(page.locator('#mobile-menu')).to_be_visible()
        for _ in range(9):
            await page.keyboard.press('Tab')
            assert await page.evaluate('document.querySelector("#mobile-menu").contains(document.activeElement)')
        await page.keyboard.press('Escape')
        await expect(menu).to_be_focused()
        await menu.click()
        await page.locator('#mobile-menu').get_by_role('link',name='Land Potential').click()
        await expect(page.locator('#mobile-menu')).not_to_be_visible()
        assert await page.evaluate('document.getElementById("potential").getBoundingClientRect().top') >= 71
        results['mobile_menu_focus_escape_anchor_close'] = 'pass'

        # Fresh context proves data is volatile, no storage or application requests.
        storage = await page.evaluate('({local:Object.keys(localStorage),session:Object.keys(sessionStorage),cookie:document.cookie})')
        assert not storage['local'] and not storage['session'] and not storage['cookie'], storage
        assert not any('/api/' in r['url'] for r in requests)
        assert not any(r['data'] and any(v in r['data'] for v in ['Demo Visitor','demo@example.com','Winter Garden','Open an access route']) for r in requests)
        await page.reload(wait_until='networkidle')
        assert await page.get_by_role('radio',name='Forestry Mulching',exact=True).is_checked() is False
        results['no_form_transmission_or_storage_and_reload_clears'] = storage
        results['browser_errors'] = errors
        assert not errors, errors
        # Transfer and resource sizes, not a speed-score claim.
        await page.evaluate('window.scrollTo(0,0)')
        results['resource_bytes_at_top'] = await page.evaluate('performance.getEntriesByType("resource").filter(r=>r.name.startsWith(location.origin)).map(r=>({url:new URL(r.name).pathname,bytes:r.encodedBodySize}))')
        await context.close()

        # Touch emulation using CDP touch events on mobile Chrome.
        touch = await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
        tp = await touch.new_page(); await tp.goto(BASE,wait_until='networkidle')
        ts = tp.get_by_role('slider',name='Reveal planning concept')
        await ts.scroll_into_view_if_needed(); b = await ts.bounding_box()
        cdp = await touch.new_cdp_session(tp)
        x,y = b['x']+b['width']*.51,b['y']+b['height']/2
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
        for ratio in [.56,.62,.68,.74,.8]:
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':b['x']+b['width']*ratio,'y':y}]})
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        results['divider_emulated_touch_drag'] = await ts.input_value()
        assert int(results['divider_emulated_touch_drag'])>=75

        # Exercise retained analytics as a non-automated hostname, capturing rather
        # than sending the collector requests. Only a pageview should appear.
        privacy = await browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
        await privacy.add_init_script('Object.defineProperty(navigator,"webdriver",{get:()=>false})')
        async def serve_static(route):
            path = urlparse(route.request.url).path
            response = await route.fetch(url=BASE+path)
            await route.fulfill(response=response)
        await privacy.route('http://fieldnorth.test/**', serve_static)
        async def intercept_collector(route):
            await route.fulfill(status=200,body='',headers={'Access-Control-Allow-Origin':'*'})
        await privacy.route('https://**/*',intercept_collector)
        pp = await privacy.new_page(); telemetry = []
        def record_telemetry(request):
            if request.url.startswith('https://'):
                encoded = parse_qs(urlparse(request.url).query).get('data',[''])[0]
                decoded = base64.b64decode(encoded).decode() if encoded else request.post_data or ''
                telemetry.append({'url':urlparse(request.url)._replace(query='').geturl(),'payload':decoded})
        pp.on('request',record_telemetry)
        await pp.goto('http://fieldnorth.test',wait_until='networkidle')
        await pp.get_by_role('button',name='Use sample project').click()
        await pp.get_by_role('button',name='Continue',exact=True).click()
        await pp.locator('#full-name').fill('Private Sentinel Visitor')
        await pp.locator('#email').fill('private-sentinel@example.com')
        await pp.locator('#project-details').fill('Private Sentinel Project Details')
        await pp.get_by_role('button',name='Preview Estimate Request').click()
        await pp.get_by_role('button',name='Edit details').click()
        await pp.get_by_role('button',name='Preview Estimate Request').click()
        await pp.get_by_role('button',name='Start another preview').click()
        for item in telemetry:
            assert not any(value in item['payload'] for value in ['Private Sentinel','private-sentinel@example.com','Demo Visitor','demo@example.com','Winter Garden'])
        assert len(telemetry)>=1, 'Expected retained platform pageview collector to be exercised'
        assert all('PageView' in item['payload'] for item in telemetry)
        results['active_platform_analytics_no_form_values'] = telemetry
        await privacy.close()
        await browser.close()
    (OUT/'acceptance.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))

if __name__ == '__main__': asyncio.run(main())