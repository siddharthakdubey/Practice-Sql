SELECT CustomerID,
       FirstName + ' ' + LastName AS FullName,
       UPPER(LEFT(TRIM(City), 1)) + LOWER(SUBSTRING(TRIM(City), 2, LEN(TRIM(City)))) AS CleanCity
FROM Customers
ORDER BY CustomerID;
