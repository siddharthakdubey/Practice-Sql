SELECT TOP 10 oi.OrderItemID, oi.OrderID, p.ProductName,
       oi.Quantity * p.UnitPrice * (1 - oi.Discount) AS LineRevenue
FROM OrderItems oi
JOIN Products p ON p.ProductID = oi.ProductID
ORDER BY LineRevenue DESC, oi.OrderItemID;
