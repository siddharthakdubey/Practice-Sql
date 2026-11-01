WITH spend AS (
    SELECT o.CustomerID, SUM(oi.Quantity * p.UnitPrice * (1 - oi.Discount)) AS TotalSpend
    FROM Orders o
    JOIN OrderItems oi ON oi.OrderID = o.OrderID
    JOIN Products p ON p.ProductID = oi.ProductID
    WHERE o.Status <> 'Cancelled'
    GROUP BY o.CustomerID
)
SELECT c.CustomerID, c.FirstName, s.TotalSpend
FROM spend s
JOIN Customers c ON c.CustomerID = s.CustomerID
WHERE s.TotalSpend > (SELECT AVG(TotalSpend) FROM spend)
ORDER BY s.TotalSpend DESC, c.CustomerID;
