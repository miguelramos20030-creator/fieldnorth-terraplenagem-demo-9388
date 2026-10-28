"""Actual-clock pointer/keyboard image and button transition checks."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('FIELDNORTH_TEST_URL','http://127.0.0.1:4500')
OUT=Path(__file__).parent/'results'

async def main():
 result={}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='no-preference')
  await context.route('https://**/*',lambda r:r.abort())
  page=await context.new_page(); await page.goto(BASE,wait_until='networkidle')
  for container,image,scale in [('.scenario-0 button','.scenario-0 img',1.045),('.service-photo','.service-photo > img',1.035)]:
   await page.locator(container).scroll_into_view_if_needed()
   geometry=await page.locator(container).bounding_box()
   duration=await page.locator(image).evaluate('(e)=>getComputedStyle(e).transitionDuration')
   assert duration=='0.65s',duration
   await page.locator(container).hover()
   await page.wait_for_function('''({selector,scale})=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector(selector)).transform).a-scale)<.0001''',arg={'selector':image,'scale':scale})
   assert geometry==await page.locator(container).bounding_box()
   await page.mouse.move(0,0)
   await page.wait_for_function('''selector=>getComputedStyle(document.querySelector(selector)).transform==='none' ''',arg=image)
   result[container]={'zoom':scale,'smooth_transition':'650ms','container_unchanged':True,'returns_to_rest':True}
  button=page.locator('.hero-actions .button-amber')
  await button.scroll_into_view_if_needed()
  await button.hover()
  await page.wait_for_function("Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.hero-actions .button-amber')).transform).m42+2)<.001")
  await page.wait_for_function("Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.hero-actions .button-amber svg')).transform).m41-2)<.001")
  result['button_hover']={'lift':'2px','arrow':'2px','transition':'260ms'}
  await page.mouse.move(0,0)
  await page.locator('.scenario-0 button').focus()
  await page.wait_for_function("Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.scenario-0 img')).transform).a-1.045)<.0001")
  result['keyboard_gallery_focus_zoom']='pass'
  await page.emulate_media(reduced_motion='reduce')
  for selector in ['.scenario-0 img','.service-photo > img','.hero-actions .button-amber','.hero-actions .button-amber svg']:
   assert await page.locator(selector).evaluate('(e)=>getComputedStyle(e).transform')=='none'
   assert await page.locator(selector).evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s'
  await button.hover()
  assert await button.evaluate('(e)=>getComputedStyle(e).transform')=='none'
  await page.locator('.scenario-0 button').hover()
  assert await page.locator('.scenario-0 img').evaluate('(e)=>getComputedStyle(e).transform')=='none'
  result['reduced_motion_disables_hover_movement_and_transitions']='pass'
  await context.close()
  mobile=await browser.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,reduced_motion='no-preference')
  mp=await mobile.new_page(); await mp.goto(BASE,wait_until='networkidle')
  assert await mp.evaluate("matchMedia('(pointer: coarse)').matches")
  await mp.locator('.scenario-0 button').hover()
  assert await mp.locator('.scenario-0 img').evaluate('(e)=>getComputedStyle(e).transform')=='none'
  result['touch_emulation_has_no_sticky_hover_zoom']='pass'
  await browser.close()
 OUT.mkdir(exist_ok=True);(OUT/'hover-motion.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result,indent=2))
if __name__=='__main__':asyncio.run(main())