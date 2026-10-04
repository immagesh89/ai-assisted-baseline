# Requirement: Save for Later

## New feature: Save for Later

This is a new feature, added on top of the existing Product Catalog app
described in the Overview. Follow the conventions already established
there — `Api/Features/<Feature>/`, `src/features/<feature>/`, the
repository-interface pattern — don't invent new ones.

## User story

As a signed-in user, I want to save a product to look at later, and remove it
from my saved list, so I can keep track of items I'm interested in without
buying immediately.

## Functional requirements

1. Save a product (idempotent — saving an already-saved product does not
   create a duplicate)
2. Un-save a product (removing a product that isn't saved is not an error)
3. View my saved products, most recently saved first
4. A user may not have more than 20 products saved at once

## Acceptance criteria

**Data**

New `ISavedItemRepository`, following the same pattern as `IProductRepository`
in this repo — an in-memory implementation, keyed by `userId` in a way that
mirrors what a Cosmos DB partition key would look like. Document shape:
`{ id, userId, productId, savedAt }`.

**API**

Every endpoint below is stubbed-auth: requests carry an `X-User-Id` header —
treat its absence as unauthenticated. Do not build real auth.

| Endpoint | Success | Idempotent / edge case | Auth |
|---|---|---|---|
| `POST /api/products/{productId}/save` | `201` first save | `200` on repeat save (no duplicate); `409` if user already has 20 saved | `401` if `X-User-Id` missing |
| `DELETE /api/products/{productId}/save` | `204` | `204` even if it wasn't saved | `401` if `X-User-Id` missing |
| `GET /api/saved-items` | `200`, array sorted by `savedAt` desc | empty array if none saved | `401` if `X-User-Id` missing |

**UI**

- `SaveButton` on each product card: toggles state optimistically, reverts on
  API failure
- `/saved` route: lists saved products, unsave action per row, empty state
  when none saved
- A user-visible message when the 20-item cap is hit (not a silent failure)

## Explicitly out of scope

Real authentication, pagination, cross-device sync, product recommendations,
a real Cosmos DB implementation.
