WITH spend AS (
    SELECT o.CustomerID, SUM(oi.Quantity * p.UnitPrice * (1 - oi.Discount)) AS TotalSpend
    FROM Orders o
    JOIN OrderItems oi ON oi.OrderID = o.OrderID
    JOIN Products p ON p.ProductID = oi.ProductID
    WHERE o.Status <> 'Cancelled'
    GROUP BY o.CustomerID
)
SELECT c.CustomerID, c.FirstName,
       ISNULL(s.TotalSpend, 0) AS TotalSpend,
       CASE WHEN s.TotalSpend IS NULL THEN 'None'
            WHEN s.TotalSpend >= 20000 THEN 'Gold'
            WHEN s.TotalSpend >= 8000  THEN 'Silver'
            ELSE 'Bronze' END AS Tier
FROM Customers c
LEFT JOIN spend s ON s.CustomerID = c.CustomerID
ORDER BY c.CustomerID;
