// ============================================================
// REFAR — sayt ma'lumotlari. YAGONA MANBA.
// Menyu yoki footer havolasini o'zgartirish = shu yerda bir joyda.
// ============================================================
module.exports = {
  brand: "REFAR",

  // Yuqori menyu. "key" — faol sahifani belgilash uchun (activeNav bilan mos).
  nav: [
    { label: "Купить",       url: "/refar-catalog.html",     key: "catalog" },
    { label: "Новостройки",  url: "/refar-novostroyka.html", key: "novostroyka" },
    { label: "Карта",        url: "/refar-map.html",         key: "map" },
    { label: "AI-поиск",     url: "/refar-ai.html",          key: "ai" },
    { label: "Риэлторы",     url: "/refar-rieltorlar.html",  key: "rieltorlar" },
    { label: "Оценка",       url: "/refar-baholash.html",    key: "baholash" },
    { label: "Новости",      url: "/refar-novosti.html",     key: "novosti" }
  ],

  // Footer ustunlari
  footer: [
    { title: "О компании", links: [
      { label: "О нас",      url: "/refar-o-kompanii.html" },
      { label: "Команда",    url: "/refar-o-kompanii.html" },
      { label: "Карьера",    url: "/refar-o-kompanii.html" },
      { label: "Новости",    url: "/refar-novosti.html" },
      { label: "Контакты",   url: "/refar-kontakty.html" }
    ]},
    { title: "Услуги", links: [
      { label: "Купить",          url: "/refar-catalog.html" },
      { label: "Снять",           url: "/refar-catalog.html" },
      { label: "Новостройки",     url: "/refar-novostroyka.html" },
      { label: "Онлайн-оценка",   url: "/refar-baholash.html" },
      { label: "Тарифы",          url: "#" }
    ]},
    { title: "Профессионалам", links: [
      { label: "Риэлторам",              url: "/refar-rieltorlar.html" },
      { label: "Агентствам",             url: "/refar-agentstva.html" },
      { label: "Застройщикам",           url: "/refar-zastroyshik.html" },
      { label: "Скаутам",                url: "#" },
      { label: "Партнёрская программа",  url: "#" }
    ]},
    { title: "Помощь", links: [
      { label: "FAQ",                          url: "/refar-faq.html" },
      { label: "Поддержка",                    url: "/refar-faq.html" },
      { label: "Условия использования",        url: "/refar-politika.html" },
      { label: "Политика конфиденциальности",  url: "/refar-politika.html" },
      { label: "Карта сайта",                  url: "#" }
    ]}
  ]
};
