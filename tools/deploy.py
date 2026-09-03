#!/usr/bin/env python3
"""Deploy StableMo landing to Vercel (static, API inline upload) + verify."""
import base64, json, os, sys, time
import urllib.request, urllib.error

ROOT = "/tmp/stablemo-build"
PROJECT = "stablemo"
TEAM = "cryptosis-projects"
ALIAS = "stablemo-lisa.vercel.app"
SKIP_DIRS = {"node_modules", ".git", ".vercel", "out", ".hermes"}
TOKEN = json.load(open(os.path.expanduser("~/.vercel/auth.json")))["token"]

def api(method, path, body=None):
    req = urllib.request.Request(
        f"https://api.vercel.com{path}",
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")

# 1) ensure project
code, res = api("POST", f"/v11/projects?teamId={TEAM}",
                {"name": PROJECT, "framework": None})
print(f"project create: {code} ({res.get('name', res.get('error', {}).get('message', '?'))})")

# 2) claim unique production alias (squatter guard)
code, res = api("POST", f"/v10/projects/{PROJECT}/domains?teamId={TEAM}", {"name": ALIAS})
print(f"alias claim: {code} ({res.get('name', res.get('error', {}).get('message', '?'))})")

# 3) gather + upload
files = []
for path, dirs, names in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for n in names:
        rel = os.path.relpath(os.path.join(path, n), ROOT)
        if rel == os.path.basename(__file__):
            continue
        files.append(rel)
print(f"uploading {len(files)} files")

payload = {
    "name": PROJECT,
    "project": PROJECT,
    "target": "production",
    "files": [{"file": f, "data": base64.b64encode(open(os.path.join(ROOT, f), "rb").read()).decode(), "encoding": "base64"} for f in files],
    "projectSettings": {"framework": None},
}
code, dep = api("POST", f"/v13/deployments?teamId={TEAM}", payload)
if code >= 300:
    sys.exit(f"deploy failed {code}: {json.dumps(dep)[:600]}")
did = dep.get("id") or dep.get("uid")
print(f"deploy id: {did}")

# 4) poll
state = None
for _ in range(100):
    time.sleep(3)
    _, d = api("GET", f"/v13/deployments/{did}?teamId={TEAM}")
    state = d.get("readyState")
    if state in ("READY", "ERROR", "CANCELED"):
        break
print(f"state: {state}")
if state != "READY":
    sys.exit(1)

# 5) verify production aliases + key assets
import ssl
ok = True
for url in [f"https://{PROJECT}.vercel.app/", f"https://{ALIAS}/",
            f"https://{ALIAS}/robots.txt", f"https://{ALIAS}/sitemap.xml",
            f"https://{ALIAS}/assets/og-image.png", f"https://{ALIAS}/styles.css"]:
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read(400).decode("utf-8", "replace")
            marker = "StableMo" if url.endswith("/") else ""
            hit = marker in body if marker else True
            print(f"{r.status} {r.headers.get('Content-Type'):30} {url} {'title-ok' if hit else 'TITLE MISSING'}")
            ok = ok and r.status == 200 and hit
    except Exception as e:
        print(f"FAIL {url}: {e}")
        ok = False
print("DEPLOY OK" if ok else "DEPLOY INCOMPLETE")
