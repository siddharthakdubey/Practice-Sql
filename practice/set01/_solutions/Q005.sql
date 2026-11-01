SELECT Status, COUNT(*) AS OrderCount
FROM Orders
GROUP BY Status
ORDER BY OrderCount DESC, Status;
