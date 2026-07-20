# REFAR — Marketing sayti (Eleventy build)

Statik sayt, **Eleventy (11ty)** bilan yasaladi. Header, footer, menyu, umumiy stillar
**yagona manbadan** keladi — bir joyni o'zgartirsangiz, barcha sahifalarga tarqaladi.

## Tuzilishi

```
src/
  _data/site.js        ← MENYU va FOOTER havolalari (bir joyda)
  _includes/
    base.njk           ← HTML qobig'i: head, shriftlar, umumiy skriptlar
    header.njk         ← Header markapi (barcha sahifada)
    footer.njk         ← Footer markapi (barcha sahifada)
  css/refar.css        ← UMUMIY stillar (header/footer/logo/tugma/tokenlar)
  assets/              ← config.js, app.js, i18n.js, logo (Supabase, i18n mantiqiy)
  *.njk                ← Har sahifa = faqat o'z kontenti + sarlavha
  raw/                 ← Mustaqil sahifalar (404, reklama lending) — o'zgarishsiz
netlify.toml           ← Netlify build + kesh sozlamalari
```

## Lokal ishlash

```bash
npm install        # bir marta
npm start          # http://localhost:8080 — jonli ko'rish (o'zgarish darhol yangilanadi)
npm run build      # _site/ papkasiga statik saytni yasaydi
```

## Deploy — Git + Netlify (avtomatik)

1. Kodni GitHub'ga yuklang:
   ```bash
   git init
   git add .
   git commit -m "REFAR sayt — Eleventy arxitektura"
   git branch -M main
   git remote add origin https://github.com/FOYDALANUVCHI/refar-web.git
   git push -u origin main
   ```
2. Netlify → **Add new site → Import an existing project → GitHub** → `refar-web` repo'sini tanlang.
3. Build sozlamalari `netlify.toml` dan avtomatik o'qiladi:
   - Build command: `npm run build`
   - Publish directory: `_site`
4. **Deploy** bosing. Endi har `git push` da Netlify avtomatik qayta build qilib chiqaradi (~30s).
   Xato bo'lsa — Netlify'da bir tugma bilan oldingi versiyaga qaytasiz.

## Qanday o'zgartiraman?

| Nimani | Qayerda |
|---|---|
| Menyuga band qo'shish/o'chirish | `src/_data/site.js` (bitta qator) |
| Footer havolalari | `src/_data/site.js` |
| Header/footer ko'rinishi | `src/_includes/header.njk` / `footer.njk` |
| Umumiy stil (rang, tugma, logo) | `src/css/refar.css` |
| Bitta sahifa kontenti | `src/<sahifa>.njk` |
| Yangi sahifa qo'shish | `src/yangi.njk` yarating (quyidagi shablon) |

Yangi sahifa shabloni:
```
---
layout: base.njk
title: "Sarlavha — REFAR"
activeNav: "catalog"
permalink: "/yangi.html"
---
{% raw %}
<style> /* shu sahifa stillari */ </style>
<!-- shu sahifa kontenti -->
{% endraw %}
```

## Eslatma

- Sahifa fayllarining ichi `{% raw %}...{% endraw %}` ichida — bu HTML/JS'ni Eleventy
  tegmasdan o'zgarishsiz chiqarishi uchun. Yangi sahifada ham shu ichida yozing.
- `assets/config.js` — Supabase URL/kalit shu yerda.
- Backend jadvallari: `refar-web-schema.sql` (Supabase SQL Editor'da ishga tushiriladi).
