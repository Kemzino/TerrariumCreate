# Terrarium Create

Збірка сервера **Terrarium** — Minecraft 1.21.1, NeoForge 21.1.241.

Гравцям нічого тут робити руками: [Terrarium Launcher](https://github.com/Kemzino/TerrariumLauncher)
сам бере останній реліз із цього репозиторію і встановлює/оновлює збірку.

## Структура

| Що | Де |
|---|---|
| Версія гри, завантажувача, назва | `pack.json` |
| Конфіги, KubeJS-скрипти, ресурспаки | `overrides/` |
| Список модів (для перегляду змін у git) | `mods.lock.json` — генерується |
| Готовий `.mrpack` | asset у [Releases](../../releases) |

## Як випустити нову версію

Через лаунчер (адмін-ключ → «Опублікувати оновлення») — основний шлях.

Вручну з профілю лаунчера:

```bash
python tools/build_mrpack.py --profile "C:\Users\...\ModrinthApp\profiles\<профіль>" --version 1.0.1
gh release create v1.0.1 dist/Terrarium-Create-1.0.1.mrpack --title "Terrarium v1.0.1" --notes "що змінилося"
```

Моди з Modrinth у `.mrpack` йдуть посиланнями (гравець качає їх сам), тому пакет важить кілобайти, а не сотні мегабайт.
