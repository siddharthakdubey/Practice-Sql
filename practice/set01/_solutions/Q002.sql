SELECT ProductID, ProductName, Category, UnitPrice
FROM Products
WHERE UnitPrice BETWEEN 500 AND 2000
  AND Category IN ('Electronics', 'Home')
ORDER BY UnitPrice DESC, ProductID;
