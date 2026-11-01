SELECT MONTH(o.OrderDate) AS MonthNo,
       COUNT(DISTINCT o.OrderID) AS OrderCount,
       SUM(oi.Quantity * p.UnitPrice * (1 - oi.Discount)) AS Revenue
FROM Orders o
JOIN OrderItems oi ON oi.OrderID = o.OrderID
JOIN Products p ON p.ProductID = oi.ProductID
WHERE o.Status <> 'Cancelled'
  AND o.OrderDate >= '2025-01-01' AND o.OrderDate < '2026-01-01'
GROUP BY MONTH(o.OrderDate)
ORDER BY MonthNo;
