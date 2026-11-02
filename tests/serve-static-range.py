"""QA-only production server with byte-range support for native video seeking."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import os, re

class Handler(SimpleHTTPRequestHandler):
 def send_head(self):
  path=self.translate_path(self.path)
  range_header=self.headers.get('Range','')
  if not range_header or not os.path.isfile(path): return super().send_head()
  match=re.fullmatch(r'bytes=(\d+)-(\d*)',range_header)
  if not match: return super().send_head()
  size=os.path.getsize(path); start=int(match[1]); end=min(int(match[2]) if match[2] else size-1,size-1)
  if start>=size: self.send_error(416); return None
  file=open(path,'rb'); file.seek(start)
  self.send_response(206); self.send_header('Content-type',self.guess_type(path))
  self.send_header('Accept-Ranges','bytes'); self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.send_header('Content-Length',str(end-start+1)); self.end_headers()
  self.range_length=end-start+1
  return file
 def copyfile(self,source,outputfile):
  if not hasattr(self,'range_length'): return super().copyfile(source,outputfile)
  remaining=self.range_length; del self.range_length
  while remaining:
   data=source.read(min(65536,remaining))
   if not data: break
   outputfile.write(data); remaining-=len(data)

ThreadingHTTPServer(('127.0.0.1',4503),partial(Handler,directory='/home/user/fieldnorth/packages/web/dist')).serve_forever()