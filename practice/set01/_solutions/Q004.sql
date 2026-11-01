SELECT CustomerID, FirstName, City
FROM Customers
WHERE FirstName LIKE '[A-D]%'
  AND City LIKE '%an%'
ORDER BY CustomerID;
