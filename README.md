# Zarządzanie produktami

REST API i panel WWW do zarządzania produktami, zabronionymi frazami oraz historią zmian. Projekt korzysta z Next.js, TypeScript, Prisma, lokalnego PostgreSQL i shadcn/ui.

## Uruchomienie

Wymagane: Node.js 24 i pnpm 10.28.2. Przy pierwszej konfiguracji skopiuj `.env.example` do `.env`; jeżeli masz już `.env`, zachowaj go.

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm dev
```

`pnpm dev` uruchamia lokalną bazę Prisma, stosuje migracje i startuje Next.js. Panel jest pod [localhost:3000](http://localhost:3000), a API pod `/api/v1`.

## Produkty i walidacja

Produkty są zapisywane w bazie przez Prisma. API udostępnia `GET` i `POST /api/v1/products` oraz `GET`, `PUT` i `DELETE /api/v1/products/{id}`. Panel korzysta z tych samych serwisów co API.

Nazwa musi być unikalna bez rozróżniania wielkości liter, mieć 3–20 znaków i zawierać wyłącznie litery oraz cyfry. Ilość jest nieujemną liczbą całkowitą. Cena ma najwyżej dwa miejsca po przecinku i mieści się w zakresie kategorii: elektronika 50–50 000 PLN, książki 5–500 PLN, odzież 10–5 000 PLN. Błędy wskazują pole do poprawy.

**Kod:** [API produktów](src/app/api/v1/products), [ProductService](src/server/services/product.service.ts), [walidacja](src/server/validation/product.schema.ts), [modele bazy](prisma/schema.prisma).

**Sprawdzenie:** dodaj w panelu `LaptopDemo1`, kategorię Elektronika, cenę 100 i ilość 5. Wyświetl produkt, edytuj go i usuń. Sprawdź też duplikat nazwy, nazwę `ab`, cenę 49 dla elektroniki oraz ilość −1 lub 1,5. API powinno zwrócić `400` dla błędnych danych, `409` dla duplikatu i `404` dla brakującego produktu.

Testy: `pnpm test tests/products.test.ts tests/validation.test.ts`.

## Zabronione frazy

Lista fraz jest przechowywana w bazie i zarządzana przez `GET`/`POST /api/v1/forbidden-phrases` oraz `DELETE /api/v1/forbidden-phrases/{id}`. Nazwa zawierająca frazę jest odrzucana przy dodawaniu i edycji produktu, bez rozróżniania wielkości liter.

**Kod:** [API fraz](src/app/api/v1/forbidden-phrases), [ForbiddenPhraseService](src/server/services/forbidden-phrase.service.ts), metoda `assertNameAvailable` w [ProductService](src/server/services/product.service.ts).

**Sprawdzenie:** dodaj frazę `promo`. Dodanie produktu `PromoLaptop1` oraz zmiana nazwy istniejącego produktu na tę nazwę powinny zostać odrzucone. Usuń frazę kliknięciem badge’a i ponów zapis — blokada powinna zniknąć.

Testy: `pnpm test tests/forbidden-phrases.test.ts`.

## Architektura warstwowa

Żądanie przechodzi przez `Route Handler → Service → Repository → Prisma → baza`. Handler obsługuje HTTP, serwis reguły biznesowe i transakcje, a repozytorium zapytania do bazy. Wspólne serwisy i walidacja ograniczają powielanie kodu między API a panelem. Moduły backendu są chronione przez `server-only`.

**Kod:** [obsługa HTTP](src/server/api/http.ts), [serwisy](src/server/services), [repozytoria](src/server/repositories), [połączenie z bazą](src/server/db.ts).

**Sprawdzenie:** prześledź `POST` w [products/route.ts](src/app/api/v1/products/route.ts), następnie `ProductService.create` i `ProductRepository.create`. Testy produktów przechodzą przez wszystkie te warstwy i sprawdzają wynik w rzeczywistej bazie.

## Historia zmian

Dodanie, edycja i usunięcie zapisują operacje `CREATE`, `UPDATE` i `DELETE` z wartościami przed i po zmianie. Produkt oraz historia są zapisywane w jednej transakcji: awaria historii wycofuje całą operację. Historia pozostaje dostępna po usunięciu produktu.

**Kod:** [ProductService](src/server/services/product.service.ts), [HistoryRepository](src/server/repositories/history.repository.ts), [API historii](src/app/api/v1/products/[id]/history/route.ts), [widok historii](src/components/product-history-dialog.tsx).

**Sprawdzenie:** zapamiętaj ID produktu, zmień jego cenę lub ilość i otwórz „Historia”. Na komputerze pojawi się dialog, na telefonie dolny arkusz. Po usunięciu produktu sprawdź `GET /api/v1/products/{id}/history` lub `/?history=ID` — wpisy nadal powinny być dostępne.

Testy: `pnpm test tests/history.test.ts`.

## Testy integracyjne

Testy wysyłają rzeczywiste żądania HTTP do uruchamianego automatycznie serwera Next.js. Korzystają z osobnej bazy wskazanej przez `TEST_DATABASE_URL` i czyszczą jej tabele pomiędzy scenariuszami. Domyślne adresy baz znajdują się w [.env.example](.env.example).

**Kod:** [scenariusze testów](tests), [uruchamianie serwera](tests/global-setup.ts), [sprawdzanie oddzielnej bazy](tests/database-safety.ts). Scenariusze równoczesnych zapisów znajdują się w [regressions.test.ts](tests/regressions.test.ts).

Uruchom bazę testową w osobnym terminalu i pozostaw ją włączoną:

```bash
pnpm db:test
```

W drugim terminalu uruchom cały zestaw lub polecenie dla wybranego obszaru podane wyżej:

```bash
pnpm test
```

Kontrola kodu: `pnpm lint`, `pnpm typecheck`, `pnpm build`.

Szczegółowy opis projektu jest lokalnie w `docs/DOKUMENTACJA.md`, a instrukcja prezentacji w `docs/PREZENTACJA.md`. Katalog `docs` jest ignorowany przez Git.
