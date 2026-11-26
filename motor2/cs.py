import json,sys,urllib.parse,subprocess,re
UA="PortoLabsVideoBot/1.0 (pcvalbuquerque@gmail.com)"
import time
def get(url):
    for i in range(6):
        r=subprocess.run(["curl","-s","-A",UA,"-m","25",url],capture_output=True,text=True).stdout
        try: return json.loads(r)
        except Exception: time.sleep(8*(i+1))
    return {}
def search(q,n=6):
    d=get("https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(dict(action="query",generator="search",gsrsearch=q,gsrnamespace=6,gsrlimit=n,prop="imageinfo",iiprop="url|size|extmetadata",format="json")))
    out=[]
    for p in (d.get("query",{}).get("pages",{}) or {}).values():
        ii=p["imageinfo"][0]; m=ii.get("extmetadata",{})
        lic=m.get("LicenseShortName",{}).get("value",""); art=re.sub("<[^>]+>","",m.get("Artist",{}).get("value",""))[:40]
        out.append((p["title"],ii["width"],ii["height"],lic,art))
    return out
for q in sys.argv[1:]:
    time.sleep(3); print("##",q, flush=True)
    for r in search(q): print("  ",r)
