# План реализации: трекер расходов

## Стек

| Слой | Технология | Почему |
|---|---|---|
| База данных | **Supabase** (PostgreSQL, free) | REST API из коробки, бесплатный tier, простая схема |
| Бэкенд + фронтенд | **Next.js** на **Vercel** (free) | API routes + HTML-форма в одном репо, бесплатный хостинг |
| FX курсы | **frankfurter.app** (бесплатный API) | Без регистрации, поддерживает RSD/RUB/USD/EUR/GEL |
| Авторизация | URL-секрет (`?token=xxx`) | Single-user, проще некуда, достаточно для личного использования |

---

## Фаза 1 — Форма + endpoint записи + БД

### Шаг 1 — Схема БД (Supabase)

```sql
CREATE TABLE expenses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount         numeric(12,2) NOT NULL CHECK (amount > 0),
  currency       text NOT NULL CHECK (currency IN ('RSD','RUB','USD','EUR','GEL')),
  category       text NOT NULL CHECK (category IN (
                   'Food Home','Food Cafe','Dog','Health','Apartment',
                   'Entertainment','Trips','Taxi','Gifts','Coffee',
                   'Household','Subscriptions','Clothing','Bukvalno','Fees','Other'
                 )),
  entry_date     date NOT NULL DEFAULT CURRENT_DATE,
  created_at_ts  timestamptz NOT NULL DEFAULT now(),
  amount_rsd     numeric(12,2) NOT NULL CHECK (amount_rsd >= 0),
  fx_rate_to_rsd numeric(10,4) NOT NULL CHECK (fx_rate_to_rsd > 0)
);
```

**Принятые решения:**
- Дробные суммы — `numeric(12,2)`, то есть до 2 знаков после запятой.
- FX-стратегия — снимок курса в момент записи (стабильная история).

---

### Шаг 2 — API endpoint `POST /api/expenses`

**Payload от клиента:**
```json
{ "amount": 1200, "currency": "RSD", "category": "Food Cafe", "entry_date": "2026-04-25" }
```

**Логика сервера:**
1. Проверить токен (`Authorization: Bearer <token>` или `?token=`).
2. Провалидировать все поля: enum, `amount > 0`, валидная дата.
3. Запросить курс к RSD через frankfurter.app → вычислить `amount_rsd` и `fx_rate_to_rsd`.
4. INSERT в Supabase; `created_at_ts` ставит сервер (`DEFAULT now()`).
5. Ответить `201 { id, amount_rsd }`.

---

### Шаг 3 — Мобильная веб-форма

**UX-принципы:**
- Крупный numeric input для суммы, автофокус при открытии.
- Валюта — горизонтальные кнопки-таблетки (`RSD` по умолчанию).
- Категория — вертикальный список с тапом (не `<select>`, неудобен на мобиле).
- Дата — поле `date`, по умолчанию сегодня.
- Кнопка «Сохранить» — полная ширина экрана.
- Inline-валидация; кнопка неактивна пока есть ошибки.
- После успешного сохранения: подтверждение + кнопка «Добавить ещё».

---

### Структура файлов

```
траты/
├── app/
│   ├── page.tsx              ← форма
│   ├── api/
│   │   └── expenses/
│   │       └── route.ts      ← POST handler
│   └── globals.css
├── lib/
│   ├── db.ts                 ← Supabase client
│   ├── fx.ts                 ← запрос курса frankfurter.app
│   └── validate.ts           ← валидация (переиспользуется клиент/сервер)
├── .env.local                ← SUPABASE_URL, SUPABASE_KEY, API_TOKEN
└── next.config.ts
```

---

### Порядок выполнения

- [ ] `git init` + `npx create-next-app@latest`
- [ ] Создать проект в Supabase, выполнить SQL схемы
- [ ] Реализовать `lib/fx.ts` + `lib/validate.ts`
- [ ] Реализовать `POST /api/expenses` с валидацией и FX
- [ ] Реализовать форму `app/page.tsx`
- [ ] Deploy на Vercel, прописать env vars
- [ ] Добавить на телефон как Web App (Add to Home Screen)

---

## Фаза 2 — FX-согласованность

- Убедиться, что `amount_rsd` и `fx_rate_to_rsd` всегда согласованы.
- Опционально: таблица `fx_rates` для хранения дневных курсов.

## Фаза 3 — Аналитика

- `MonthlyTotalRsd`: сумма `amount_rsd` за календарный месяц.
- `MonthlyByCategoryRsd`: сумма `amount_rsd` по категориям за месяц.

## Фаза 4 (опционально) — Экспорт в Google Sheets

- Append-only: одна запись в БД → одна строка в Sheets.
- Колонки: `amount`, `currency`, `category`, `entry_date`, `created_at_ts`, `amount_rsd`, `fx_rate_to_rsd`.

---

## Открытые вопросы

- `[FILL: модель авторизации]` URL-токен достаточен, или нужен полноценный auth?
- `[FILL: где показываем аналитику]` отдельный экран в том же веб-приложении vs Google Sheets.
- `[FILL: формат валюты в UI]` разделители тысяч, символы валют.
