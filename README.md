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
| CRUD produktów i zapis w bazie — zadanie podstawowe na 3,0 | [Route Handlers produktów](src/app/api/v1/products/route.ts), [ProductService](src/services/product.service.ts), [ProductRepository](src/repositories/product.repository.ts) | Żądania HTTP opisane w sekcji 5; test `creates, gets, lists, updates and deletes a product`. |
| Nazwa: 3–20 znaków, litery i cyfry, unikalność | [product.schema.ts](src/lib/validation/product.schema.ts), `ProductService.assertNameAvailable`, [indeks unikalny](prisma/migrations/20261023190000_product_consistency/migration.sql) | Błędna nazwa → `400`; duplikat → `409`. |
| Cena zależna od kategorii | [product-rules.ts](src/lib/product-rules.ts), `checkCategoryPriceIssue` w schemacie produktu | Cena elektroniki `49` → `400` z polem `price`; `50` jest poprawne. |
| Ilość: liczba całkowita, co najmniej 0 | `productBaseSchema.quantity` | `-1` i `1.5` → `400`; `0` jest poprawne. |
| Błędy wskazujące niepoprawne pole | [errors.ts](src/lib/errors.ts), [http.ts](src/lib/http.ts) | Odpowiedź zawiera `error.details[].field`. |
| Dynamiczne zabronione frazy — +0,5 | [ForbiddenPhraseService](src/services/forbidden-phrase.service.ts), [API fraz](src/app/api/v1/forbidden-phrases/route.ts) | Dodaj frazę, spróbuj dodać i edytować pasującą nazwę; usuń frazę i ponów zapis. |
| Architektura N-Layer — +0,5 | `src/app/api` → `src/services` → `src/repositories` | Prześledź `POST` → `ProductService.create` → `ProductRepository.create`. |
| Historia zmian produktów w bazie — +0,5 | `ProductService.create/update/delete`, [HistoryRepository](src/repositories/history.repository.ts), model `ProductHistory` | Odczytaj `/products/{id}/history` przed usunięciem i po nim. |
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
| Tailwind CSS 4, lokalne komponenty UI | Wygląd panelu. Komponenty `src/components/ui` mają interfejs inspirowany shadcn/ui. |
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

Uruchom w osobnym terminalu bazę aplikacji i pozostaw ten proces włączony:

```bash
pnpm db:dev
```

W drugim terminalu zastosuj zapisane migracje i uruchom aplikację:

```bash
pnpm db:deploy
pnpm dev
```

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

Serwer Next.js dla testów jest uruchamiany i zatrzymywany automatycznie. Instancję bazy uruchamiasz osobno. Lokalne procesy Prisma można zakończyć klawiszem `q` w ich terminalu; ponowne uruchomienie tej samej nazwanej instancji zachowuje dane.

### Zgodność lokalnej bazy z zadaniem

Wymaganie mówi o trwałym przechowywaniu informacji w bazie i nie narzuca sposobu jej uruchamiania. `prisma dev` udostępnia lokalny silnik PostgreSQL/PGlite: aplikacja wykonuje rzeczywiste zapytania, transakcje i migracje, a dane pozostają po ponownym uruchomieniu tej samej instancji. To spełnia wymaganie bazy; Prisma ORM jest narzędziem dostępu do niej. Sposób działania i trwałość nazwanych instancji opisuje [dokumentacja lokalnego Prisma Postgres](https://www.prisma.io/docs/local-development/postgres).

Lokalny silnik obsługuje jedno aktywne połączenie naraz. Dlatego [prisma.ts](src/lib/prisma.ts) ustawia pulę na jedno połączenie i szybko zwalnia bezczynne połączenia. Pozwala to współdzielić instancję między procesami. Testy równoczesnych żądań sprawdzają wyniki API również w tym środowisku; pełne przeploty wielu połączeń wymagają zwykłego serwera PostgreSQL.

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
│   ├── page.tsx                             serwerowe składanie panelu
│   ├── actions.ts                           zapis formularzy
│   ├── layout.tsx                           dokument HTML i metadane
│   ├── error.tsx                            ekran awarii i ponowienie
│   └── globals.css                          style globalne
├── services/
│   ├── product.service.ts                   reguły produktów i transakcje
│   ├── forbidden-phrase.service.ts          operacje na frazach
│   └── mappers.ts                           DTO produktów i historii
├── repositories/
│   ├── product.repository.ts                zapytania do Product
│   ├── forbidden-phrase.repository.ts       zapytania do ForbiddenPhrase
│   └── history.repository.ts                zapis i odczyt historii
├── lib/
│   ├── validation/                          schematy Zod i walidacja ID
│   ├── product-rules.ts                     kategorie i zakresy cen/liczb
│   ├── errors.ts                            typy błędów aplikacji
│   ├── http.ts                              odpowiedzi HTTP i parsowanie wejścia
│   ├── action-state.ts                      stan formularzy i komunikaty
│   ├── database-errors.ts                   rozpoznawanie błędów Prisma
│   └── prisma.ts                            współdzielony klient bazy
├── components/
│   ├── products/                            formularze, tabela, historia i frazy
│   └── ui/                                  podstawowe komponenty UI
└── generated/prisma/                        wygenerowany klient Prisma
prisma/
├── schema.prisma                            modele i enumy
└── migrations/                              migracje SQL
prisma.config.ts                             konfiguracja CLI i bazy shadow
tests/                                       testy wymagań oraz ich infrastruktura
vitest.config.mts                            konfiguracja testów
```

Alias `@/` oznacza katalog `src/`. Plików `src/generated/prisma` nie edytuje się ręcznie — aktualizuje je `pnpm db:generate`.

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
| `name` | 3–20 znaków Unicode, wyłącznie litery i cyfry dziesiętne. Skrajne białe znaki są obcinane, tekst normalizowany do NFC. | `productBaseSchema` w [product.schema.ts](src/lib/validation/product.schema.ts). |
| Unikalność `name` | Bez rozróżniania wielkości liter, również przy równoczesnych zapisach. | `assertNameAvailable` w serwisie i `UNIQUE(lower(name))` w bazie. |
| `category` | `ELECTRONICS`, `BOOKS` lub `CLOTHING`. | Enum `Category` i schemat Zod. |
| `price` | Liczba, maksymalnie dwa miejsca po przecinku, zakres zależny od kategorii. | `checkCategoryPriceIssue` i `PRICE_RANGES`. |
| `quantity` | Liczba całkowita od 0 do 2 147 483 647. | `productBaseSchema`; górna granica odpowiada `INTEGER` w bazie. |
| ID w adresie | Liczba całkowita od 1 do 2 147 483 647. | [validateId](src/lib/validation/id.schema.ts), wywoływane przez `readId` i serwisy. |

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

`details` jest opcjonalne. `field` określa pole do poprawy. Typy `ValidationError`, `NotFoundError`, `ConflictError` znajdują się w [errors.ts](src/lib/errors.ts), a ich mapowanie na HTTP w [http.ts](src/lib/http.ts). Odpowiedzi frameworka, np. `405`, nie muszą mieć tego formatu. Odpowiedź `204` nie zawiera JSON-a.

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

[ForbiddenPhraseService](src/services/forbidden-phrase.service.ts) sprawdza dane i wykonuje operacje przez [ForbiddenPhraseRepository](src/repositories/forbidden-phrase.repository.ts). Fraza po `trim()` ma 1–50 znaków i jest przechowywana małymi literami.

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
| Infrastruktura | Utworzenie klienta i połączenia. | [prisma.ts](src/lib/prisma.ts), `PrismaPg`, `PrismaClient`. |

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

Zapis odbywa się w [ProductService](src/services/product.service.ts), a dostęp do tabeli zapewnia [HistoryRepository](src/repositories/history.repository.ts). Produkt i wpis historii korzystają z tego samego `tx`. Awaria historii wycofuje całą operację.

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
| [page.tsx](src/app/page.tsx) | Pobiera produkty, frazy i wybraną historię na serwerze; składa ekran. |
| [actions.ts](src/app/actions.ts) | Odczytuje `FormData`, wywołuje serwisy, zwraca komunikaty i odświeża widok. |
| [product-form-card.tsx](src/components/products/product-form-card.tsx) | Na serwerze przygotowuje formularz edycji/dodania, opcje kategorii i przyciski. |
| [product-form.tsx](src/components/products/product-form.tsx) | Obsługuje stan błędów i zachowuje wartości pól przez `useActionState`. |
| [products-table-card.tsx](src/components/products/products-table-card.tsx) | Wyświetla produkty i akcje edycji, historii oraz usuwania. |
| [forbidden-phrases-card.tsx](src/components/products/forbidden-phrases-card.tsx) | Lista fraz, formularz dodania i usuwanie. |
| [product-history-card.tsx](src/components/products/product-history-card.tsx) | Tabela poprzednich i nowych stanów. |
| [error.tsx](src/app/error.tsx) | Obsługa nieoczekiwanej awarii odczytu i ponowienie przez `retry()`. |

Strona, karty, tabela, historia i linki są komponentami serwerowymi. Formularze wymagają klienta do wyświetlania stanu akcji; `SubmitButton` korzysta z `useFormStatus`. Interaktywny jest również ekran ponawiania po błędzie.

Panel nie wywołuje własnych endpointów REST. Odczyt wykonuje przez serwisy w Server Components, a zapis przez Server Actions. Testy HTTP osobno weryfikują REST API. Po zapisie akcja wywołuje `revalidatePath("/")`; udana edycja wykonuje serwerowe `redirect` poza blokiem przechwytywania błędów.

Parametry panelu:

- `/?edit=ID` — wybór produktu do edycji;
- `/?history=ID` — wyświetlenie historii, również po usunięciu produktu.

W [next.config.ts](next.config.ts) włączono `cacheComponents` i `partialPrefetching`. `Suspense` rozdziela otoczkę strony od dynamicznego odczytu. Kolekcje API używają `connection()`. W kodzie nie ma `use cache` buforującego listę magazynową między żądaniami.

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
| `pnpm db:generate` | Generowanie klienta Prisma. |
| `pnpm db:studio` | Przeglądanie tabel bazy aplikacji. |
| `pnpm dev` | Serwer aplikacji na porcie 3000. |
| `pnpm test` | Testy wymagań zadania. |
| `pnpm lint` | Kontrola reguł ESLint. |
| `pnpm typecheck` | Generowanie typów tras i kontrola TypeScript. |
| `pnpm build`, następnie `pnpm start` | Wersja produkcyjna aplikacji. |

Najczęstsze problemy:

- **`P1001` / `ECONNREFUSED`:** uruchom właściwą instancję Prisma i sprawdź port w `.env`.
- **Testy odrzucają adres bazy:** `DATABASE_URL` i `TEST_DATABASE_URL` nie mogą wskazywać tej samej instancji. Domyślnie są to porty 51214 i 51314.
- **`Lock file is already being held` po przerwaniu procesu:** odczekaj chwilę i ponów uruchomienie instancji.
- **Zajęty port instancji:** zakończ wcześniejszy proces lub zmień porty CLI oraz odpowiadające im adresy w `.env`.
- **Zajęty port testowego Next.js:** użyj `TEST_PORT=3102 pnpm test`.
- **Brak tabel:** uruchom bazę i wykonaj `pnpm db:deploy`.
- **Błąd pobierania fontów przy budowaniu:** `next/font/google` potrzebuje dostępu do sieci podczas pobierania Geist.
