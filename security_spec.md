# Security Specification - SwiftDrop Delivery

## 1. Data Invariants
- `UserProfile`: Only owner can read/write. `email` is immutable.
- `Restaurant`: Publicly readable. Only admins can write.
- `MenuItem`: Publicly readable. Only admins can write.
- `Order`:
    - Created by owner.
    - Read by owner or assigned driver.
    - Status transitions: `pending` -> `confirmed` -> `preparing` -> `out_for_delivery` -> `delivered`.
    - `total` and `items` are immutable after creation.
    - `userId` matches `request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Spoofing**: Create order with `userId: "malicious_user"`.
2. **PII Leak**: Read `/users/victim_uid` as `attacker_uid`.
3. **Admin Escalation**: Update `UserProfile` with `role: "admin"`.
4. **Price Manipulation**: Create order where `total` doesn't match item prices (Hard to check in rules without `get`, but we can enforce some constraints).
5. **Status Jumping**: Update order status from `pending` to `delivered` directly.
6. **Orphaned Writes**: Create `MenuItem` for a non-existent `restaurantId`.
7. **Resource Poisoning**: Use 1MB string as `restaurantId`.
8. **Shadow Update**: Update `Order` with `isFree: true`.
9. **Driver Hijack**: Update `Order` to set `driverId` to self without system assignment.
10. **Blind Query**: `db.collection('orders').get()` (Should fail without `where('userId', '==', uid)`).
11. **Timestamp Spoofing**: Set `createdAt` to a date in 2030.
12. **Double Favorite**: Add 10,000 items to `favorites` array.

## 3. Test Runner (Draft Logic)

The `firestore.rules.test.ts` will verify these denials.
(Implementation details omitted for brevity in this stage, but logic will be used to verify rules).
