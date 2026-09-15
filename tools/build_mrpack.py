#!/usr/bin/env python3
"""Збирає .mrpack збірки Terrarium Create з профілю лаунчера.

Використання:
    python tools/build_mrpack.py --profile "<шлях до профілю>" --version 1.0.0
    python tools/build_mrpack.py --profile "<шлях>" --version 1.0.0 --server   # серверна

Що робить:
  1. Для кожного mods/*.jar рахує sha1/sha512 і питає Modrinth, чи це відомий файл.
     Знайдені йдуть у modrinth.index.json посиланнями (гравець качає з Modrinth),
     невідомі — копіюються в overrides/mods.
  2. Копіює папки з OVERRIDE_DIRS у overrides/ (config, kubejs, …).
  3. Пише mods.lock.json (для git-diff) і dist/<name>-<version>.mrpack.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK_JSON = ROOT / "pack.json"
OVERRIDES = ROOT / "overrides"
DIST = ROOT / "dist"
LOCK = ROOT / "mods.lock.json"

# Папки профілю, що входять у збірку. Свідомо НЕ включаємо: saves, screenshots,
# logs, crash-reports, cache, xaero (особисті вейпоінти), options.txt (особисті
# налаштування), tacz (мод сам генерує дефолтний пак).
OVERRIDE_DIRS = ["config", "defaultconfigs", "kubejs", "resourcepacks", "shaderpacks", "datapacks"]
MODRINTH_API = "https://api.modrinth.com/v2"
USER_AGENT = "TerrariumCreate/build_mrpack (github.com/Kemzino/TerrariumCreate)"


def sha(path: Path, algo: str) -> str:
    h = hashlib.new(algo)
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def modrinth_lookup(hashes: list[str]) -> dict:
    """POST /version_files — повертає {sha512: version} для відомих файлів."""
    body = json.dumps({"hashes": hashes, "algorithm": "sha512"}).encode()
    req = urllib.request.Request(
        f"{MODRINTH_API}/version_files",
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def modrinth_projects(ids: list[str]) -> dict[str, dict]:
    """GET /projects?ids=[…] — {project_id: project} (потрібні client_side/server_side)."""
    result: dict[str, dict] = {}
    for i in range(0, len(ids), 100):
        chunk = json.dumps(ids[i : i + 100])
        req = urllib.request.Request(
            f"{MODRINTH_API}/projects?ids={urllib.parse.quote(chunk)}",
            headers={"User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            for project in json.load(resp):
                result[project["id"]] = project
    return result


def build(profile: Path, version: str, server: bool = False) -> Path:
    pack = json.loads(PACK_JSON.read_text(encoding="utf-8"))
    name = pack["name"]

    mods_dir = profile / "mods"
    jars = sorted(p for p in mods_dir.glob("*.jar") if p.is_file())
    print(f"модів у профілі: {len(jars)} (вимкнені .disabled пропускаю)")

    hashes = {sha(p, "sha512"): p for p in jars}
    found: dict = {}
    keys = list(hashes)
    for i in range(0, len(keys), 100):
        found.update(modrinth_lookup(keys[i : i + 100]))

    # Для серверної збірки відсіюємо моди, які Modrinth позначив як
    # server_side == "unsupported" (мінікарти, шейдери, анімації тощо).
    projects: dict[str, dict] = {}
    if server:
        ids = sorted({v["project_id"] for v in found.values()})
        projects = modrinth_projects(ids)
    skipped_client_only: list[str] = []

    files = []
    lock = []
    local_mods = []
    for h512, path in hashes.items():
        version_info = found.get(h512)
        entry = None
        if version_info:
            entry = next(
                (f for f in version_info["files"] if f["hashes"].get("sha512") == h512), None
            )
        if not entry:
            local_mods.append(path)
            lock.append({"file": path.name, "source": "override"})
            continue
        project = projects.get(version_info["project_id"], {})
        if server and project.get("server_side") == "unsupported":
            skipped_client_only.append(path.name)
            continue
        files.append(
            {
                "path": f"mods/{path.name}",
                "hashes": {"sha1": entry["hashes"]["sha1"], "sha512": h512},
                "env": {
                    "client": project.get("client_side", "required") if server else "required",
                    "server": "required",
                },
                "downloads": [entry["url"]],
                "fileSize": entry["size"],
            }
        )
        lock.append(
            {
                "file": path.name,
                "source": "modrinth",
                "project_id": version_info["project_id"],
                "version_id": version_info["id"],
                "version": version_info["version_number"],
            }
        )
    files.sort(key=lambda f: f["path"].lower())
    lock.sort(key=lambda m: m["file"].lower())
    print(f"з Modrinth: {len(files)}, локальних (в overrides/mods): {len(local_mods)}")
    if server:
        print(f"пропущено суто клієнтських: {len(skipped_client_only)}")
        for n in skipped_client_only:
            print("   -", n)

    # overrides/ збираємо з нуля, щоб не тягнути видалене
    if OVERRIDES.exists():
        shutil.rmtree(OVERRIDES)
    for d in OVERRIDE_DIRS:
        src = profile / d
        if src.is_dir() and any(src.iterdir()):
            shutil.copytree(src, OVERRIDES / d)
    if local_mods:
        (OVERRIDES / "mods").mkdir(parents=True, exist_ok=True)
        for p in local_mods:
            shutil.copy2(p, OVERRIDES / "mods" / p.name)

    index = {
        "formatVersion": 1,
        "game": "minecraft",
        "versionId": version,
        "name": name,
        "summary": pack.get("summary", ""),
        "files": files,
        "dependencies": {
            "minecraft": pack["minecraft"],
            "neoforge": pack["neoforge"],
        },
    }

    LOCK.write_text(json.dumps(lock, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    DIST.mkdir(exist_ok=True)
    out = DIST / f"{name.replace(' ', '-')}-{version}.mrpack"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("modrinth.index.json", json.dumps(index, ensure_ascii=False, indent=2))
        for p in sorted(OVERRIDES.rglob("*")):
            if p.is_file():
                z.write(p, p.relative_to(ROOT).as_posix())
    print(f"готово: {out} ({out.stat().st_size // 1024} KB)")
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", required=True, help="папка профілю лаунчера")
    ap.add_argument("--version", required=True, help="версія збірки, напр. 1.0.0")
    ap.add_argument("--server", action="store_true", help="серверна збірка: без суто клієнтських модів")
    args = ap.parse_args()
    profile = Path(args.profile)
    if not (profile / "mods").is_dir():
        print(f"немає папки mods у {profile}", file=sys.stderr)
        return 1
    build(profile, args.version, server=args.server)
    return 0


if __name__ == "__main__":
    sys.exit(main())
