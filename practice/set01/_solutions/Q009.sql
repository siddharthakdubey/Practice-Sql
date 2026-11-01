SELECT p.ProductID, p.ProductName
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM OrderItems oi WHERE oi.ProductID = p.ProductID)
ORDER BY p.ProductID;
