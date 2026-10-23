# Zarządzanie produktami — dokumentacja projektu

Projekt realizuje zadanie laboratoryjne polegające na utworzeniu REST API do zarządzania produktami. Obejmuje CRUD, walidację domenową, dynamiczną listę zabronionych fraz, architekturę N-Layer, historię zmian w bazie oraz testy integracyjne komunikujące się z API przez HTTP.

Dodatkowy panel WWW na `/` umożliwia demonstrację tych samych operacji. Panel i REST API korzystają ze wspólnej warstwy serwisów, dlatego obowiązują je te same reguły.

## Spis treści

1. [Wymagania zadania i ich implementacja](#1-wymagania-zadania-i-ich-implementacja)
2. [Technologie](#2-technologie)
3. [Uruchomienie i lokalna baza Prisma](#3-uruchomienie-i-lokalna-baza-prisma)
4. [Struktura projektu](#4-struktura-projektu)
5. [Zadanie podstawowe: CRUD i walidacja](#5-zadanie-podstawowe-crud-i-walidacja)
6. [Dodatek: zabronione frazy](#6-dodatek-zabronione-frazy)
7. [Dodatek: architektura N-Layer](#7-dodatek-architektura-n-layer)
8. [Dodatek: historia zmian](#8-dodatek-historia-zmian)
9. [Dodatek: testy integracyjne](#9-dodatek-testy-integracyjne)
10. [Panel i działanie Next.js](#10-panel-i-działanie-nextjs)
11. [Baza danych i migracje](#11-baza-danych-i-migracje)
12. [Polecenia i diagnostyka](#12-polecenia-i-diagnostyka)

## 1. Wymagania zadania i ich implementacja

| Wymaganie ze specyfikacji | Miejsce realizacji | Jak sprawdzić |
| --- | --- | --- |
| CRUD produktów i zapis w bazie — zadanie podstawowe na 3,0 | [Route Handlers produktów](src/app/api/v1/products/route.ts), [ProductService](src/server/services/product.service.ts), [ProductRepository](src/server/repositories/product.repository.ts) | Żądania HTTP opisane w sekcji 5; test `creates, gets, lists, updates and deletes a product`. |
| Nazwa: 3–20 znaków, litery i cyfry, unikalność | [product.schema.ts](src/server/validation/product.schema.ts), `ProductService.assertNameAvailable`, [indeks unikalny](prisma/migrations/20261023190000_product_consistency/migration.sql) | Błędna nazwa → `400`; duplikat → `409`. |
| Cena zależna od kategorii | [product-rules.ts](src/lib/product-rules.ts), `checkCategoryPriceIssue` w schemacie produktu | Cena elektroniki `49` → `400` z polem `price`; `50` jest poprawne. |
| Ilość: liczba całkowita, co najmniej 0 | `productBaseSchema.quantity` | `-1` i `1.5` → `400`; `0` jest poprawne. |
| Błędy wskazujące niepoprawne pole | [errors.ts](src/server/errors.ts), [http.ts](src/server/api/http.ts) | Odpowiedź zawiera `error.details[].field`. |
| Dynamiczne zabronione frazy — +0,5 | [ForbiddenPhraseService](src/server/services/forbidden-phrase.service.ts), [API fraz](src/app/api/v1/forbidden-phrases/route.ts) | Dodaj frazę, spróbuj dodać i edytować pasującą nazwę; usuń frazę i ponów zapis. |
| Architektura N-Layer — +0,5 | `src/app/api` → `src/server/services` → `src/server/repositories` | Prześledź `POST` → `ProductService.create` → `ProductRepository.create`. |
| Historia zmian produktów w bazie — +0,5 | `ProductService.create/update/delete`, [HistoryRepository](src/server/repositories/history.repository.ts), model `ProductHistory` | Odczytaj `/products/{id}/history` przed usunięciem i po nim. |
| Testy integracyjne reguł domenowych — +0,5 | [tests](tests), [konfiguracja Vitest](vitest.config.mts) | `pnpm test`; scenariusze API używają `fetch` i działającego serwera. |
| SOLID, DRY, KISS; właściwe metody HTTP i nazwy endpointów | Wspólne serwisy, schematy walidacji i repozytoria; rzeczowniki w adresach API | Opis odpowiedzialności warstw w sekcji 7 oraz tabeli metod w sekcji 5. |

Punktacja opisuje pozycje ze specyfikacji; ostateczną ocenę ustala prowadzący.

## 2. Technologie

| Technologia | Zastosowanie |
| --- | --- |
| Next.js 16.4.3, App Router | REST API w `route.ts`, renderowanie panelu i Server Actions. |
| React 19.3, TypeScript | Komponenty, stan formularzy i statyczna kontrola typów. |
| Prisma ORM 7.10.1 | Klient bazy, modele i migracje. |
| Lokalny Prisma Postgres (`prisma dev`) | PostgreSQL uruchamiany lokalnie na silniku PGlite, z danymi zapisywanymi na dysku. |
| `@prisma/adapter-pg`, `pg` | Połączenie Prisma Client z bazą przez protokół PostgreSQL. |
| Zod 4 | Walidacja rzeczywistych danych wejściowych w trakcie działania programu. |
| T3 Env, `server-only` | Walidacja konfiguracji i ochrona modułów backendu przed importem do klienta. |
| Tailwind CSS 4, shadcn/ui na Base UI | Formularze używają gotowych `Input`, `Select`, `Button` i `Separator`; stany ładowania składają się z `Skeleton`. Komponenty są w `src/components/ui`. |
| Vitest 5 | Testy integracyjne wymagań domenowych. |

Wersje i skrypty znajdują się w [package.json](package.json), a konkretne wersje zależności w [pnpm-lock.yaml](pnpm-lock.yaml).

## 3. Uruchomienie i lokalna baza Prisma

### Wymagania środowiska

- Node.js 24 LTS.
- pnpm 10.28.2, zgodnie z `packageManager`.
- Wolne porty aplikacji oraz lokalnych instancji Prisma.

Projekt korzysta z Prisma ORM 7. Polecenia poniżej uruchamiają wersję zainstalowaną w repozytorium.

### Pierwsza konfiguracja

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm db:generate
```

Kopiowanie `.env` wykonaj tylko przy pierwszym uruchomieniu, jeżeli nie masz już własnej konfiguracji.

Uruchom bazę i aplikację jednym poleceniem:

```bash
pnpm dev
```

Skrypt kolejno uruchamia instancję Prisma `lab01` w tle, stosuje istniejące migracje i startuje serwer deweloperski Next.js. Jeżeli baza już działa, korzysta z tej samej instancji. Gdy uruchomienie bazy lub migracje zakończą się błędem, Next.js nie zostanie uruchomiony.

`Ctrl+C` zatrzymuje Next.js; baza pozostaje w tle. Aby ją zatrzymać, wykonaj `pnpm exec prisma dev stop lab01`. Samą bazę możesz nadal uruchomić poleceniem `pnpm db:dev` w osobnym terminalu.

Adresy:

- panel: [http://localhost:3000](http://localhost:3000);
- lista produktów: [http://localhost:3000/api/v1/products](http://localhost:3000/api/v1/products);
- przeglądarka tabel: `pnpm db:studio` — otwórz adres wypisany przez CLI.

### Instancje i zmienne środowiskowe

| Zmienna | Rola | Domyślny adres lokalny |
| --- | --- | --- |
| `DATABASE_URL` | Baza używana przez aplikację i Prisma Studio. | `localhost:51214/template1` |
| `SHADOW_DATABASE_URL` | Baza pomocnicza dla tworzenia i sprawdzania nowych migracji. | `localhost:51215/template1` |
| `TEST_DATABASE_URL` | Oddzielna instancja używana wyłącznie do testów. | `localhost:51314/template1` |

Plik [.env.example](.env.example) zawiera komplet adresów. `db:dev` uruchamia instancję `lab01`, a `db:test` instancję `lab01-test`. Nazwa bazy `template1` jest standardowym adresem lokalnego Prisma Postgres; różne porty wskazują różne instancje i różne dane. Baza shadow nie jest bazą testów aplikacji.

Przed testami uruchom w kolejnym terminalu:

```bash
pnpm db:test
```

Następnie:

```bash
pnpm test
```

Serwer Next.js dla testów jest uruchamiany i zatrzymywany automatycznie. Instancję testową uruchamiasz osobno — `pnpm dev` uruchamia tylko bazę aplikacji. Proces Prisma działający w terminalu można zakończyć klawiszem `q`, a instancję w tle poleceniem `pnpm exec prisma dev stop NAZWA`. Ponowne uruchomienie tej samej nazwanej instancji zachowuje dane.

### Zgodność lokalnej bazy z zadaniem

Wymaganie mówi o trwałym przechowywaniu informacji w bazie i nie narzuca sposobu jej uruchamiania. `prisma dev` udostępnia lokalny silnik PostgreSQL/PGlite: aplikacja wykonuje rzeczywiste zapytania, transakcje i migracje, a dane pozostają po ponownym uruchomieniu tej samej instancji. To spełnia wymaganie bazy; Prisma ORM jest narzędziem dostępu do niej. Sposób działania i trwałość nazwanych instancji opisuje [dokumentacja lokalnego Prisma Postgres](https://www.prisma.io/docs/local-development/postgres).

Lokalny silnik obsługuje jedno aktywne połączenie naraz. Dlatego [db.ts](src/server/db.ts) ustawia pulę na jedno połączenie i szybko zwalnia bezczynne połączenia. Pozwala to współdzielić instancję między procesami. Testy równoczesnych żądań sprawdzają wyniki API również w tym środowisku; pełne przeploty wielu połączeń wymagają zwykłego serwera PostgreSQL.

## 4. Struktura projektu

```text
src/
├── app/
│   ├── api/v1/
│   │   ├── products/route.ts                 GET listy, POST produktu
│   │   ├── products/[id]/route.ts            GET, PUT, DELETE produktu
│   │   ├── products/[id]/history/route.ts    GET historii
│   │   ├── forbidden-phrases/route.ts        GET i POST fraz
│   │   └── forbidden-phrases/[id]/route.ts   DELETE frazy
│   ├── page.tsx                             nagłówek i osadzenie panelu
│   ├── layout.tsx                           dokument HTML i metadane
│   ├── error.tsx                            ekran awarii i ponowienie
│   ├── favicon.ico                          automatycznie wykrywana ikona strony
│   ├── not-found.tsx                         prosta strona 404
│   └── globals.css                          domyślny motyw shadcn
├── server/                                  moduły oznaczone server-only
│   ├── db.ts                                współdzielony klient Prisma
│   ├── actions.ts                           Server Actions formularzy
│   ├── products-view.ts                     parametry URL, wybór edycji i historii
│   ├── api/http.ts                          odpowiedzi HTTP i odczyt wejścia
│   ├── services/                            reguły biznesowe i transakcje
│   │   ├── product.service.ts
│   │   └── forbidden-phrase.service.ts
│   ├── repositories/                        zapytania do tabel
│   │   ├── product.repository.ts
│   │   ├── forbidden-phrase.repository.ts
│   │   └── history.repository.ts
│   ├── validation/                          schematy Zod i walidacja ID
│   ├── errors.ts                            błędy aplikacji
│   ├── database-errors.ts                   rozpoznawanie błędów Prisma
│   └── mappers.ts                           konwersja rekordów bazy na DTO
├── components/
│   ├── ui/                                  komponenty UI, w tym shadcn na Base UI
│   ├── action-link.tsx                      link stylizowany jako przycisk
│   ├── forbidden-phrase-form.tsx            formularz dodawania fraz
│   ├── forbidden-phrases-card.tsx           stała karta i formularz fraz
│   ├── forbidden-phrases-list.tsx           serwerowy odczyt listy fraz
│   ├── remove-phrase-badge.tsx              usuwanie całym czerwonym badge’em
│   ├── notification-toast.tsx              toast po przekierowaniu i błędach URL
│   ├── product-form-card.tsx                serwerowa otoczka formularza
│   ├── product-form.tsx                     stan formularza produktu
│   ├── product-history-card.tsx             tabela historii
│   ├── product-skeletons.tsx                szkielety fraz i wierszy
│   ├── product-rows.tsx                     serwerowy odczyt produktów
│   ├── products-content.tsx                 serwerowe składanie panelu
│   ├── products-table-card.tsx              tabela produktów
│   └── submit-button.tsx                    stan wysyłania formularza
├── lib/                                     kod wspólny serwera i klienta
│   ├── product-types.ts                     typy DTO, bez kodu serwerowego
│   ├── product-rules.ts                     kategorie i zakresy cen/liczb
│   ├── action-state.ts                      stan formularzy i komunikaty
│   ├── action-toast.ts                      powiadomienie o wyniku akcji formularza
│   └── utils.ts                             pomocnicze funkcje UI
└── env.ts                                   walidacja środowiska przez T3 Env
prisma/
├── schema.prisma                            modele i enumy
├── generated/                               kod generowany przez Prisma
└── migrations/                              migracje SQL
prisma.config.ts                             konfiguracja CLI i bazy shadow
tests/                                       testy wymagań oraz ich infrastruktura
vitest.config.mts                            konfiguracja testów
components.json                              konfiguracja shadcn i aliasu ui
```

Podział backendu opiera się na [Folder Structure (App) z Create T3 App](https://create.t3.gg/en/folder-structure-app?packages=nextauth%2Cprisma%2Ctailwind): `server` zawiera logikę backendu, a `server/db.ts` klienta Prisma. `app` przechowuje routing i ekrany, a `app/globals.css` domyślny motyw shadcn. Wszystkie komponenty panelu znajdują się bezpośrednio w `src/components`; jedyny podkatalog to `ui`. `prisma` pozostaje w katalogu głównym. Serwisy i repozytoria zachowują architekturę N-Layer wymaganą w zadaniu.

Każdy ręcznie pisany moduł w `src/server` importuje `server-only`. Next.js zgłosi błąd budowania przy próbie zwykłego importu takiego modułu do komponentu klienckiego. Plik `server/actions.ts` dodatkowo ma `"use server"`, więc formularz może importować jego funkcje jako zdalne Server Actions. Są to dwa różne mechanizmy: znacznik `server-only` chroni granicę modułów, a `"use server"` definiuje akcje.

`src/lib` zawiera dane i typy współdzielone, bez dostępu do bazy. Typy DTO są w `product-types.ts`, a funkcje mapujące rekordy Prisma w `server/mappers.ts`. Kod wygenerowany przez Prisma pozostaje poza `server`, ponieważ udostępnia również typy i enumy bezpieczne dla klienta. Dostęp do bazy przechodzi przez chroniony moduł `server/db.ts`.

`src/env.ts` używa `@t3-oss/env-nextjs` i Zod do walidacji adresów baz oraz `NODE_ENV`. Klient bazy i konfiguracja CLI Prisma korzystają z tego samego modułu środowiska. `components.json` wskazuje wariant `base-nova` shadcn i katalog `src/components/ui`; komponenty aplikacji korzystają z nich bez dodatkowych własnych wersji inputów i selectów.

Alias `@/` oznacza katalog `src/`, a `@generated/` katalog `prisma/generated/`. Wygenerowany klient jest ignorowany przez Git; po pobraniu projektu odtwarza go `pnpm db:generate`. Plików klienta nie edytuje się ręcznie. Lokalizację określa `output = "./generated"` w `prisma/schema.prisma`, względem pliku schematu. Importy klienta bazy wskazują `@generated/client`, a typów i enumów `@generated/enums`.

Folder `docs/` zawiera lokalną ściągawkę prezentacji. Jest ignorowany przez Git, więc nie pojawi się po sklonowaniu repozytorium; dokumentacją przechowywaną w repozytorium jest ten README.

## 5. Zadanie podstawowe: CRUD i walidacja

### Endpointy produktów

| Operacja | Metoda i adres | Odpowiedź sukcesu | Implementacja |
| --- | --- | --- | --- |
| Lista | `GET /api/v1/products` | `200`, `{ "data": [...] }` | `GET` w [products/route.ts](src/app/api/v1/products/route.ts) → `ProductService.list`. |
| Szczegóły | `GET /api/v1/products/{id}` | `200`, `{ "data": produkt }` | `GET` w [products/[id]/route.ts](src/app/api/v1/products/[id]/route.ts) → `get`. |
| Dodanie | `POST /api/v1/products` | `201`, `{ "data": produkt }` | `POST` kolekcji → `create`. |
| Edycja | `PUT /api/v1/products/{id}` | `200`, `{ "data": produkt }` | `PUT` zasobu → `update`. |
| Usunięcie | `DELETE /api/v1/products/{id}` | `204`, bez treści | `DELETE` zasobu → `delete`. |

Folder `[id]` w Next.js reprezentuje parametr adresu, np. `/products/7` wskazuje produkt o ID 7. `PUT` wymaga kompletu edytowanych pól.

### Dane i reguły produktu

```json
{
  "name": "Laptop123",
  "category": "ELECTRONICS",
  "price": 3499.99,
  "quantity": 10
}
```

| Pole | Reguła | Miejsce sprawdzenia |
| --- | --- | --- |
| `name` | 3–20 znaków Unicode, wyłącznie litery i cyfry dziesiętne. Skrajne białe znaki są obcinane, tekst normalizowany do NFC. | `productBaseSchema` w [product.schema.ts](src/server/validation/product.schema.ts). |
| Unikalność `name` | Bez rozróżniania wielkości liter, również przy równoczesnych zapisach. | `assertNameAvailable` w serwisie i `UNIQUE(lower(name))` w bazie. |
| `category` | `ELECTRONICS`, `BOOKS` lub `CLOTHING`. | Enum `Category` i schemat Zod. |
| `price` | Liczba, maksymalnie dwa miejsca po przecinku, zakres zależny od kategorii. | `checkCategoryPriceIssue` i `PRICE_RANGES`. |
| `quantity` | Liczba całkowita od 0 do 2 147 483 647. | `productBaseSchema`; górna granica odpowiada `INTEGER` w bazie. |
| ID w adresie | Liczba całkowita od 1 do 2 147 483 647. | [validateId](src/server/validation/id.schema.ts), wywoływane przez `readId` i serwisy. |

| Kategoria | Minimum | Maksimum |
| --- | --- | --- |
| Elektronika (`ELECTRONICS`) | 50 PLN | 50 000 PLN |
| Książki (`BOOKS`) | 5 PLN | 500 PLN |
| Odzież (`CLOTHING`) | 10 PLN | 5 000 PLN |

Zakresy obejmują obie granice. `price` i `quantity` w JSON-ie muszą być liczbami, a nie tekstem. Wspólne zakresy są zapisane w [product-rules.ts](src/lib/product-rules.ts).

### Przepływ dodania produktu

1. `POST` w Route Handlerze wywołuje `readJson(request)`.
2. `ProductService.create(input)` sprawdza dane przez `validateProductInput`.
3. Serwis rozpoczyna `prisma.$transaction` i sprawdza frazy oraz dostępność nazwy.
4. `ProductRepository.create(data, tx)` zapisuje rekord.
5. `HistoryRepository.create(..., tx)` zapisuje historię `CREATE` w tej samej transakcji.
6. `toProductDto` zamienia cenę Prisma `Decimal` na liczbę, a daty na tekst ISO.
7. Handler zwraca `201`. W razie błędu `withErrorHandling` tworzy odpowiedź błędu.

Przy edycji i usuwaniu `findByIdForUpdate` blokuje rekord do końca transakcji. Następny zapis tego produktu odczytuje już stan po poprzedniej zatwierdzonej operacji.

### Obsługa błędów

| Status | Znaczenie |
| --- | --- |
| `400` | Niepoprawny JSON, ID lub dane produktu/frazy. |
| `404` | Nie znaleziono produktu, frazy albo historii produktu, który nigdy nie istniał. |
| `409` | Zajęta nazwa produktu lub fraza. |
| `405` | Metoda nie jest obsługiwana na danej trasie; odpowiedź tworzy Next.js. |
| `500` | Nieoczekiwany błąd, np. niedostępna baza; klient otrzymuje ogólną wiadomość. |

Błędy aplikacji mają postać:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Błąd walidacji danych",
    "details": [
      { "field": "quantity", "message": "Ilość musi być większa lub równa 0" }
    ]
  }
}
```

`details` jest opcjonalne. `field` określa pole do poprawy. Typy `ValidationError`, `NotFoundError`, `ConflictError` znajdują się w [errors.ts](src/server/errors.ts), a ich mapowanie na HTTP w [http.ts](src/server/api/http.ts). Odpowiedzi frameworka, np. `405`, nie muszą mieć tego formatu. Odpowiedź `204` nie zawiera JSON-a.

### Przykład CRUD przez HTTP

```bash
curl -i http://localhost:3000/api/v1/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Laptop123","category":"ELECTRONICS","price":3499.99,"quantity":10}'
```

Z odpowiedzi skopiuj `data.id`. W kolejnych poleceniach przyjęto ID `1` — zastąp je rzeczywistym ID:

```bash
curl http://localhost:3000/api/v1/products
curl http://localhost:3000/api/v1/products/1

curl -i -X PUT http://localhost:3000/api/v1/products/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Laptop123","category":"ELECTRONICS","price":3299.99,"quantity":8}'

curl -i -X DELETE http://localhost:3000/api/v1/products/1
```

## 6. Dodatek: zabronione frazy

Lista jest dynamiczna i zapisana w tabeli `ForbiddenPhrase`. Nie jest stałą zaszytą w kodzie.

| Metoda i adres | Działanie |
| --- | --- |
| `GET /api/v1/forbidden-phrases` | Lista fraz. |
| `POST /api/v1/forbidden-phrases` | Dodanie, np. `{ "phrase": "promo" }`. |
| `DELETE /api/v1/forbidden-phrases/{id}` | Usunięcie frazy. |

[ForbiddenPhraseService](src/server/services/forbidden-phrase.service.ts) sprawdza dane i wykonuje operacje przez [ForbiddenPhraseRepository](src/server/repositories/forbidden-phrase.repository.ts). Fraza po `trim()` ma 1–50 znaków i jest przechowywana małymi literami.

`ProductService.assertNameAvailable` korzysta z `findContainedIn(name, tx)`. Sprawdzany jest **fragment nazwy**, bez rozróżniania wielkości liter. Fraza `promo` blokuje więc `PromoLaptop` i `SuperPromo1` zarówno przy `POST`, jak i `PUT` produktu. Odpowiedź to `400` z polem `name`.

Dodanie frazy nie usuwa wcześniejszych produktów. Blokada działa przy kolejnej próbie dodania lub edycji. Po usunięciu frazy odpowiednia nazwa ponownie staje się dozwolona.

## 7. Dodatek: architektura N-Layer

```text
Klient REST / test HTTP → Route Handler ─┐
                                        │
Formularz panelu → Server Action ────────┼→ Service → Repository → Prisma → baza
                                        │
Odczyt panelu → Server Component ────────┘
```

| Warstwa | Zadanie | Czego szukać w kodzie |
| --- | --- | --- |
| HTTP | Odczyt żądania i zwrócenie statusu/JSON. | `readJson`, `readId`, `ok`, `created`, `noContent`, `withErrorHandling`. |
| Service | Reguły, kolejność operacji i granice transakcji. | `validateProductInput`, `assertNameAvailable`, `$transaction`. |
| Repository | Konkretne zapytania do tabel. | `findMany`, `findUnique`, `create`, `update`, `delete`, `FOR UPDATE`. |
| Infrastruktura | Utworzenie klienta i połączenia. | [db.ts](src/server/db.ts), `PrismaPg`, `PrismaClient`. |

Podział wspiera czytelność i zasady zadania:

- **SRP:** handler obsługuje HTTP, serwis operację biznesową, repozytorium zapytania.
- **DRY:** API i panel współdzielą serwisy; zakresy cen, walidacja i format błędów mają wspólne implementacje.
- **KISS:** brak dodatkowego kontenera DI; serwisy otrzymują zależności przez konstruktor.
- **Testowalność:** do testu awarii historii można przekazać inne repozytorium historii, zachowując prawdziwą bazę i repozytorium produktu.

To architektura warstwowa. Serwis zna Prisma w zakresie zarządzania transakcją; projekt nie deklaruje pełnego oddzielenia domeny od infrastruktury.

## 8. Dodatek: historia zmian

Endpoint: `GET /api/v1/products/{id}/history`.

Historia znajduje się w tabeli `ProductHistory`. Każdy wpis zawiera `productId`, operację, `oldValue`, `newValue` oraz czas utworzenia. Migawki JSON obejmują nazwę, kategorię, cenę i ilość.

| Operacja | `oldValue` | `newValue` |
| --- | --- | --- |
| `CREATE` | `null` | Stan nowego produktu. |
| `UPDATE` | Stan przed zmianą. | Stan po zmianie. |
| `DELETE` | Stan przed usunięciem. | `null`. |

Zapis odbywa się w [ProductService](src/server/services/product.service.ts), a dostęp do tabeli zapewnia [HistoryRepository](src/server/repositories/history.repository.ts). Produkt i wpis historii korzystają z tego samego `tx`. Awaria historii wycofuje całą operację.

Blokada `SELECT … FOR UPDATE` zapewnia prawidłowy stan początkowy kolejnych edycji. Historia jest sortowana po ID wpisu, ponieważ czas rozpoczęcia transakcji może poprzedzać oczekiwanie na blokadę.

`ProductHistory.productId` celowo nie ma klucza obcego do produktu: historia musi pozostać po jego usunięciu. Nadal można ją odczytać przez znane ID, także z panelu pod `/?history=ID`. Zmiany wykonywane bezpośrednio przez SQL lub Prisma Studio omijają serwis i nie tworzą automatycznie historii — operacje do prezentacji wykonuj przez API lub panel.

## 9. Dodatek: testy integracyjne

Po uruchomieniu `pnpm db:test`:

```bash
pnpm test
```

Zestaw obejmuje **100 testów w 5 plikach**, bez testów stanu UI i konfiguracji niezwiązanych bezpośrednio z wymaganiami zadania.

| Plik | Wymagania objęte testami |
| --- | --- |
| [products.test.ts](tests/products.test.ts) | CRUD, brakujące zasoby, nazwy, unikalność, ceny i ilość. |
| [validation.test.ts](tests/validation.test.ts) | Walidacja `POST` i `PUT`: granice, kategorie, Unicode, typy, brakujące pola, błędny JSON i brak zapisu po odrzuceniu danych. |
| [forbidden-phrases.test.ts](tests/forbidden-phrases.test.ts) | Dynamiczna lista, normalizacja fraz, blokowanie dodawania i edycji, usunięcie blokady. |
| [history.test.ts](tests/history.test.ts) | Migawki zmian, historia po usunięciu i wycofanie operacji przy awarii zapisu historii. |
| [regressions.test.ts](tests/regressions.test.ts) | Unikalność i ciągłość historii przy równoczesnych żądaniach oraz walidacja ID i zakresów danych. |

### Jak działa środowisko testów

1. [global-setup.ts](tests/global-setup.ts) sprawdza osobną bazę i stosuje na niej migracje.
2. Uruchamia serwer Next.js na porcie 3100 z `DATABASE_URL` wskazującym instancję testową i katalogiem `.next-test`.
3. [helpers.ts](tests/helpers.ts) wysyła żądania `fetch` do `/api/v1/...` i odczytuje status oraz JSON.
4. Przed każdym testem czyści trzy tabele przez `TRUNCATE … RESTART IDENTITY CASCADE`.
5. Po zakończeniu testów zatrzymuje serwer Next.js.

Vitest uruchamia kod serwera poza kompilatorem Next.js, dlatego `tests/setup.ts` mockuje jedynie znacznik `server-only`. Serwisy, repozytoria i połączenia z bazą pozostają prawdziwe; build aplikacji nadal egzekwuje granicę klient/serwer.

Testy scenariuszy API spełniają wymaganie komunikacji przez HTTP. Trzy dodatkowe testy awarii historii wywołują serwis bezpośrednio i przekazują repozytorium rzucające błąd. Pozwala to wymusić problem zapisu historii, przy zachowaniu prawdziwej bazy. Te testy dotyczą atomowości historii wymaganej w zadaniu.

Instancja testowa musi być odseparowana od aplikacji. [database-safety.ts](tests/database-safety.ts) odrzuca wskazanie tej samej bazy. Dla lokalnego Prisma pozwala użyć `template1` na oddzielnym porcie; dla zwykłego PostgreSQL wymaga nazwy z członem `test`. Pliki testów wykonują się kolejno, ponieważ współdzielą czyszczoną bazę.

Przykładowe uruchomienie jednego obszaru:

```bash
pnpm test tests/forbidden-phrases.test.ts
pnpm test tests/history.test.ts
pnpm test tests/validation.test.ts
```

## 10. Panel i działanie Next.js

| Plik | Rola w demonstracji |
| --- | --- |
| [page.tsx](src/app/page.tsx) | Rozwiązuje parametry URL i opcjonalną edycję/historię przed wyrenderowaniem panelu. |
| [layout.tsx](src/app/layout.tsx) | Wspólny dokument HTML, język polski, fonty, metadane i import stylów globalnych. |
| [products-content.tsx](src/components/products-content.tsx) | Składa gotowy formularz, komunikaty, karty i opcjonalną historię. |
| [products-view.ts](src/server/products-view.ts) | Waliduje parametry URL i udostępnia osobne odczyty produktu do edycji oraz historii. |
| [product-skeletons.tsx](src/components/product-skeletons.tsx) | Układa gotowe `Skeleton` w zastępcze frazy i wiersze produktów. |
| [actions.ts](src/server/actions.ts) | Odczytuje `FormData`, wywołuje serwisy, zwraca komunikaty i odświeża widok. |
| [product-form-card.tsx](src/components/product-form-card.tsx) | Otrzymuje gotowy produkt do edycji; przygotowuje wartości formularza, etykiety kategorii i przyciski. |
| [product-form.tsx](src/components/product-form.tsx) | Obsługuje stan błędów i zachowuje wartości pól przez `useActionState`. |
| [products-table-card.tsx](src/components/products-table-card.tsx) | Stała karta, nagłówek i kolumny tabeli; `Suspense` jest wewnątrz `TableBody`. |
| [product-rows.tsx](src/components/product-rows.tsx) | Pobiera listę produktów i zwraca wyłącznie wiersze z akcjami. |
| [notification-toast.tsx](src/components/notification-toast.tsx) | Wyświetla przekazany toast sukcesu lub błędu; nie zajmuje miejsca w układzie strony. |
| [action-toast.ts](src/lib/action-toast.ts) | Po zakończeniu akcji formularza wysyła wynik do gotowego Toast shadcn. |
| [remove-phrase-badge.tsx](src/components/remove-phrase-badge.tsx) | Cały badge jest przyciskiem usuwania; ikona × jest w środku, a wariant `destructive` wyróżnia blokadę. |
| [forbidden-phrases-card.tsx](src/components/forbidden-phrases-card.tsx) | Stała karta i formularz; `Suspense` obejmuje tylko listę fraz. |
| [forbidden-phrases-list.tsx](src/components/forbidden-phrases-list.tsx) | Pobiera i wyświetla frazy z przyciskami usuwania. |
| [product-history-card.tsx](src/components/product-history-card.tsx) | Wyświetla historię odczytaną wcześniej przez stronę. |
| [error.tsx](src/app/error.tsx) | Obsługa nieoczekiwanej awarii odczytu i ponowienie przez `retry()`. |
| [not-found.tsx](src/app/not-found.tsx) | Serwerowa strona 404 z linkiem powrotu do panelu. |
| [globals.css](src/app/globals.css) | Style globalne importowane przez główny layout. |
| [favicon.ico](src/app/favicon.ico) | Ikona dostępna pod `/favicon.ico`; Next.js automatycznie dodaje jej metadane na podstawie pliku w `app`. |

Strona, karty, tabela, historia, szkielety i linki są komponentami serwerowymi. Formularze wymagają klienta do wyświetlania stanu akcji; `SubmitButton` korzysta z `useFormStatus`. Kontrolki Base UI obsługują interakcje w przeglądarce, a ekran błędu pozwala ponowić odczyt.

Strona odczytuje parametry URL i przygotowuje opcjonalną edycję oraz historię przez funkcje z `products-view.ts`. Na zwykłym `/` nie powoduje to zapytań o produkt ani historię. Formularze, karty i nagłówek tabeli są renderowane od razu w docelowym układzie.

W całym panelu są tylko dwie granice `Suspense`: `ForbiddenPhrasesList` wewnątrz karty fraz i `ProductRows` wewnątrz `TableBody`. Każdy z tych komponentów sam pobiera dane przez serwis i repozytorium. Szkielety zastępują tylko zawartość listy i wiersze. Lista fraz ma stały obszar wysokości `h-32`, a tabela `h-80`, z przewijaniem i zarezerwowanym miejscem na pasek przewijania. Kolumny mają ustalone szerokości. Wymiary te dotyczą układu zewnętrznego; komponenty shadcn zachowują domyślne style.

`getProductSelection` w `server/products-view.ts` interpretuje URL, a React `cache` współdzieli wynik tego odczytu w ramach jednego renderowania żądania. `getEditingProduct` i `getSelectedHistory` obsługują osobne zapytania oraz oczekiwane błędy. Nie tworzy to trwałego cache danych magazynowych.

Formularz używa bezpośrednio `Input` i części `Select` z `src/components/ui`. Cena i ilość to standardowe `Input type="number"`; nazwa i fraza używają tekstowego `Input`. `Select` otrzymuje `name="category"`, więc wybrana kategoria trafia do `FormData`. Domyślne `Field`, `FieldLabel`, `FieldDescription` i `FieldError` zastępują wcześniejsze własne komponenty formularza; powiązania `id`, `htmlFor`, `aria-describedby` oraz `aria-invalid` są przekazywane bezpośrednio do kontrolek. Przejścia listy i pulsowanie szkieletów pochodzą z komponentów shadcn oraz `tw-animate-css`; projekt nie dodaje własnych animacji CSS.

`Toaster` z `src/components/ui/toast.tsx` jest zamontowany raz w głównym layoucie. Dodanie produktu i frazy wywołuje `withActionToast` w obsłudze akcji, bez obserwowania stanu formularza przez efekt. Gotowe typy `success` i `error` dobierają ikony i wygląd; błędy pól nadal są widoczne przy kontrolkach. Komunikaty ogólne nie zwiększają wysokości formularza.

Po edycji lub usunięciu serwer przekierowuje na `/?notice=KOD&noticeId=UUID`. `NotificationToast` pokazuje komunikat raz i usuwa te dwa parametry przez `router.replace` z `scroll: false`, aby adres i stan routera były zgodne. Osobny UUID rozróżnia kolejne identyczne komunikaty. Ten sam komponent prezentuje błędy parametrów edycji i historii.

Pusta tabela zawiera standardowy shadcn `Empty`: ikonę, tytuł „Brak produktów” oraz wskazówkę dodania pierwszego produktu. Data Table w dokumentacji shadcn jest wzorcem rozbudowy komponentu `Table`, nie osobnym gotowym komponentem. Projekt zachowuje serwerowe wiersze i dwie granice `Suspense`, bez dodatkowej biblioteki do sortowania i filtrowania.

### Typy propsów tras

`LayoutProps<"/">` w głównym layoucie oznacza propsy layoutu przypisanego do `/`, w tym `children`. `PageProps<"/">` w stronie określa propsy strony, m.in. asynchroniczne `searchParams`. Zapis `PageProps<"/">["searchParams"]` wybiera z tego typu sam typ parametrów zapytania; używają go strona i funkcje w `products-view.ts`. Karty otrzymują gotowe dane.

Są to globalne typy generowane przez Next.js podczas `pnpm dev`, `pnpm build` lub `pnpm typecheck` — ostatni skrypt uruchamia `next typegen` przed TypeScriptem. Nie wymagają importu. Typowanie pomaga podczas pisania kodu; wartości dostarczone w URL nadal przechodzą walidację `validateId` na serwerze. Definicje wygenerowane przez Next.js znajdują się w `.next/types`, osobno od klienta Prisma w `prisma/generated`.

### Odczyt i zapis panelu

Panel nie wywołuje własnych endpointów REST. Odczyt wykonuje przez serwisy w Server Components, a zapis przez Server Actions. Testy HTTP osobno weryfikują REST API. Po zapisie akcja wywołuje `revalidatePath("/")`; udana edycja wykonuje serwerowe `redirect` poza blokiem przechwytywania błędów.

Nieistniejący adres, np. `/nieistniejaca-strona`, wyświetla prostą stronę 404 z przyciskiem „Wróć do produktów”. Implementuje ją serwerowy `app/not-found.tsx`. Błędy nieistniejącego produktu w REST API nadal mają postać JSON-a ze statusem `404`.

Parametry panelu:

- `/?edit=ID` — wybór produktu do edycji;
- `/?history=ID` — wyświetlenie historii, również po usunięciu produktu.

`getProductSelection` sprawdza również pojedyncze wystąpienie ID: np. `?edit=1&edit=2` daje toast o niepoprawnym identyfikatorze. Parametr `notice` wybiera tytuł i typ ze stałej `NOTICES`; nieznane wartości są pomijane. Oczekiwany brak produktu jest toastem błędu, a nieoczekiwana awaria odczytu trafia do `error.tsx`.

Panel korzysta ze standardowego dynamicznego renderowania App Router, bez flag `cacheComponents` i `partialPrefetching`. Pozwala to rozwiązać parametry żądania przed renderowaniem formularza i pozostawić `Suspense` wyłącznie przy dwóch listach. Dane magazynowe nie są buforowane między żądaniami.

`src/app/globals.css` zawiera domyślny neutralny motyw z dokumentacji shadcn, importy `shadcn/tailwind.css` i `tw-animate-css` oraz przypisanie fontów Geist. `ThemeProvider` z `next-themes` w głównym layoucie ustawia standardową klasę `dark` zgodnie z motywem systemu. Nie ma własnych kolorów komponentów ani własnych animacji.

## 11. Baza danych i migracje

Modele definiuje [schema.prisma](prisma/schema.prisma):

| Model | Najważniejsze dane |
| --- | --- |
| `Product` | ID, nazwa, kategoria, cena `DECIMAL(10,2)`, ilość `INTEGER`, daty utworzenia i aktualizacji. |
| `ForbiddenPhrase` | ID, unikalna fraza i data utworzenia. |
| `ProductHistory` | ID wpisu, ID produktu, operacja, migawki JSON i data. |

Migracje:

- [20261017115423_init](prisma/migrations/20261017115423_init/migration.sql) — tabele, enumy i początkowe indeksy;
- [20261023190000_product_consistency](prisma/migrations/20261023190000_product_consistency/migration.sql) — unikalny indeks `lower(name)` i indeks historii `(productId, id)`.

`pnpm db:deploy` stosuje istniejące migracje i jest używane przy uruchomieniu projektu. Przy zmianie modelu twórz nową migrację:

```bash
pnpm db:migrate --name nazwa_zmiany
pnpm db:generate
```

Do tego służy `SHADOW_DATABASE_URL` w [prisma.config.ts](prisma.config.ts). Nie stosuj samego `db push` jako zamiennika migracji projektu — niestandardowy indeks na wyrażeniu `lower(name)` jest zdefiniowany w SQL.

Jeśli istniejące dane mają nazwy różniące się tylko wielkością liter, migracja unikalności zatrzyma się zamiast usuwać produkty. Takie rekordy można znaleźć zapytaniem:

```sql
SELECT lower("name") AS normalized_name, array_agg("id") AS product_ids
FROM "Product"
GROUP BY lower("name")
HAVING count(*) > 1;
```

## 12. Polecenia i diagnostyka

| Polecenie | Cel |
| --- | --- |
| `pnpm db:dev` | Lokalna baza aplikacji: instancja `lab01`. |
| `pnpm db:test` | Osobna lokalna instancja `lab01-test`. |
| `pnpm db:deploy` | Zastosowanie istniejących migracji na bazie aplikacji. |
| `pnpm db:migrate --name zmiana` | Utworzenie migracji po zmianie modelu. |
| `pnpm db:generate` | Odtworzenie ignorowanego klienta w `prisma/generated`; wymagane po sklonowaniu i po zmianie schematu. |
| `pnpm db:studio` | Przeglądanie tabel bazy aplikacji. |
| `pnpm dev` | Baza aplikacji w tle → migracje → serwer Next.js na porcie 3000. |
| `pnpm test` | Testy wymagań zadania. |
| `pnpm lint` | Kontrola reguł ESLint. |
| `pnpm typecheck` | Generowanie typów tras i kontrola TypeScript. |
| `pnpm build`, następnie `pnpm start` | Wersja produkcyjna aplikacji. |

Najczęstsze problemy:

- **`P1001` / `ECONNREFUSED`:** `pnpm dev` uruchamia lokalną bazę aplikacji. Jeśli zatrzymano ją później, wykonaj `pnpm db:dev --detach` i odśwież panel. Sprawdź też port w `.env`.
- **Testy odrzucają adres bazy:** `DATABASE_URL` i `TEST_DATABASE_URL` nie mogą wskazywać tej samej instancji. Domyślnie są to porty 51214 i 51314.
- **`Lock file is already being held` po przerwaniu procesu:** odczekaj chwilę i ponów uruchomienie instancji.
- **Zajęty port instancji:** zakończ wcześniejszy proces lub zmień porty CLI oraz odpowiadające im adresy w `.env`.
- **Zajęty port testowego Next.js:** użyj `TEST_PORT=3102 pnpm test`.
- **Brak tabel:** uruchom bazę i wykonaj `pnpm db:deploy`.
- **Brak modułu `@generated/client` lub `@generated/enums`:** wykonaj `pnpm db:generate`, a potem ponów build, testy lub kontrolę typów.
- **Nieznany typ `LayoutProps` albo `PageProps`:** wykonaj `pnpm typecheck`, aby wygenerować typy tras Next.js.
- **Błąd pobierania fontów przy budowaniu:** `next/font/google` potrzebuje dostępu do sieci podczas pobierania Geist.
