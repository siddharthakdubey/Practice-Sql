SELECT CustomerID, FirstName, JoinDate
FROM Customers
WHERE Email IS NULL
  AND JoinDate >= '2025-01-01' AND JoinDate < '2026-01-01'
ORDER BY JoinDate, CustomerID;
