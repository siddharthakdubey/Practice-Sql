SELECT Channel, CAST(AVG(DATEDIFF(DAY, OrderDate, ShipDate) * 1.0) AS DECIMAL(5,2)) AS AvgDaysToShip
FROM Orders
WHERE ShipDate IS NOT NULL
GROUP BY Channel
ORDER BY Channel;
