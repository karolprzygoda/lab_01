# REST API — Zarządzanie Produktami

Aplikacja REST API w architekturze warstwowej (**Route Handlers → Services → Repositories**) zbudowana w oparciu o **Next.js 16, TypeScript, PostgreSQL, Prisma, Zod, Vitest** oraz komponenty **shadcn/ui**.

## Wymagania

- Node.js 20+
- Docker & Docker Compose (lub lokalna instancja PostgreSQL)

## Szybki start

```bash
# 1. Konfiguracja środowiska
cp .env.example .env

# 2. Uruchomienie PostgreSQL (tworzy bazy `products` i `products_test`)
docker compose up -d

# 3. Generowanie klienta Prisma i wykonanie migracji
npm run db:generate
npm run db:migrate

# 4. Uruchomienie serwera deweloperskiego (http://localhost:3000)
npm run dev
```

## Testowanie i weryfikacja

```bash
npm test          # Testy integracyjne Vitest (rzeczywiste żądania HTTP + PostgreSQL)
npm run typecheck # Sprawdzenie typów TypeScript
npm run lint      # Sprawdzenie kodu przez ESLint
npm run build     # Produkcyjny build Next.js
```

## Endpointy REST API

| Metoda | Endpoint | Opis |
| :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Lista wszystkich produktów |
| `GET` | `/api/v1/products/:id` | Szczegóły produktu |
| `POST` | `/api/v1/products` | Dodanie nowego produktu |
| `PUT` | `/api/v1/products/:id` | Aktualizacja produktu |
| `DELETE` | `/api/v1/products/:id` | Usunięcie produktu |
| `GET` | `/api/v1/products/:id/history` | Historia zmian produktu (`CREATE`, `UPDATE`, `DELETE`) |
| `GET` | `/api/v1/forbidden-phrases` | Lista zabronionych fraz |
| `POST` | `/api/v1/forbidden-phrases` | Dodanie zabronionej frazy (`{ "phrase": "..." }`) |
| `DELETE` | `/api/v1/forbidden-phrases/:id` | Usunięcie zabronionej frazy |

### Przykładowe ciało żądania (`POST / PUT /api/v1/products`)

```json
{
  "name": "Laptop123",
  "category": "ELECTRONICS",
  "price": 3499.99,
  "quantity": 10
}
```

## Reguły walidacji produktów

- **`name`**: 3–20 znaków, wyłącznie litery i cyfry, unikalna (case-insensitive), nie może zawierać żadnej frazy z listy zabronionych.
- **`category`**: `ELECTRONICS` | `BOOKS` | `CLOTHING`
- **`price`** (w zależności od kategorii):
  - `ELECTRONICS`: `50 – 50 000 PLN`
  - `BOOKS`: `5 – 500 PLN`
  - `CLOTHING`: `10 – 5 000 PLN`
- **`quantity`**: liczba całkowita `>= 0`
- Błędy walidacji zwracają status `400` z listą niepoprawnych pól w `error.details`:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Błąd walidacji danych",
      "details": [{ "field": "price", "message": "..." }]
    }
  }
  ```

## Struktura projektu (N-Layer)

- `src/app/api/v1/` — **Route Handlers**: warstwa HTTP i obsługa statusów.
- `src/services/` — **Services**: logika biznesowa i atomowe transakcje (`prisma.$transaction`) zapisujące produkt wraz z historią zmian.
- `src/repositories/` — **Repositories**: dostęp do danych przez Prisma ORM.
- `src/lib/validation/` — **Schematy Zod**: walidacja danych wejściowych.
- `src/components/ui/` — **shadcn/ui**: komponenty prostego panelu pomocniczego na `/`.
- `tests/` — **Testy integracyjne**: testy CRUD, walidacji, zabronionych fraz i historii zmian.
