# QA Exec Summary

**Total:** 20  |  **Passed:** 20  |  **Failed:** 0  |  **Skipped:** 0

- Explainability: reasons present and meaningful [Chromium]: passed
- Explainability: reasons present and meaningful [Firefox]: passed
- Boundary: small_amount [Chromium]: passed
- Boundary: huge_amount [Chromium]: passed
- Boundary: small_amount [Firefox]: passed
- Boundary: huge_amount [Firefox]: passed
- TC1: Valid transaction -> no alert [Chromium]: passed
- TC1: Valid transaction -> no alert [Firefox]: passed
- TC2: High value transaction -> alert with reason (adapter endpoints) [Chromium]: passed
- TC2: High value transaction -> alert with reason (adapter endpoints) [Firefox]: passed
- TC3: Unusual location -> alert with reason [Chromium]: passed
- TC3: Unusual location -> alert with reason [Firefox]: passed
- TC4: Account takeover (behavioural) -> alert with reason (adapter endpoints) [Chromium]: passed
- TC4: Account takeover (behavioural) -> alert with reason (adapter endpoints) [Firefox]: passed
- TC5: False positive -> clear alert after verification (adapter endpoints) [Chromium]: passed
- TC5: False positive -> clear alert after verification (adapter endpoints) [Firefox]: passed
- TC6: Data poisoning simulation -> benign near-threshold rows do not trigger alerts [Chromium]: passed
- TC6: Data poisoning simulation -> benign near-threshold rows do not trigger alerts [Firefox]: passed
- Latency: /score under 150ms (local) [Chromium]: passed
- Latency: /score under 150ms (local) [Firefox]: passed

---

**Explainability coverage (from http://localhost:3000/alerts):**  
- high_value ✔ (29)  
- unusual_location ✔ (7)  
- behavioural_anomaly ✔ (5)

**Notes**
- Scenarios that raise alerts should include an explanation (reason).
- When you point to Hexaware Secure API, this summary will reflect live reasons as long as `BASE_URL` is set and reachable.
