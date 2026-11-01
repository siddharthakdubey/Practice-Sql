SELECT p.Category, SUM(oi.Quantity * p.UnitPrice * (1 - oi.Discount)) AS Revenue
FROM Orders o
JOIN OrderItems oi ON oi.OrderID = o.OrderID
JOIN Products p ON p.ProductID = oi.ProductID
WHERE o.Status <> 'Cancelled'
GROUP BY p.Category
ORDER BY Revenue DESC;
