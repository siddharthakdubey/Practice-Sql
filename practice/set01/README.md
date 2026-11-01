# Set 1: Retail foundations (Q001 to Q015)

Database **P01_Retail** (T-SQL). Load it once with `setup.sql` (safe to re-run, it recreates the database).
Topics: filtering, LIKE, NULL, joins, anti joins, GROUP BY/HAVING, dates, CASE, strings, subqueries.

## The data

| Table | Columns | Notes |
|---|---|---|
| `Customers` | CustomerID, FirstName, LastName, City, State, Email, JoinDate, Segment | 30 rows. Some `Email` are NULL, some `City` values have stray spaces or odd capitals. Some customers never ordered. |
| `Products` | ProductID, ProductName, Category, UnitPrice, Cost | 20 rows. Two products were never sold. |
| `Orders` | OrderID, CustomerID, OrderDate, ShipDate, Status, Channel | 80 rows, all in 2025. Status: Delivered, Shipped, Processing, Cancelled. `ShipDate` is NULL when not shipped. |
| `OrderItems` | OrderItemID, OrderID, ProductID, Quantity, Discount | 192 rows. `Discount` is a fraction (0.10 = 10%). |

**Line revenue** = `Quantity * UnitPrice * (1 - Discount)`.

## How to work

1. Save your answer as `answers/Q001.sql` (one file per question; start it with `USE P01_Retail;` if you like, the checker already selects the database).
2. Run it in your SQL client until it looks right.
3. Check it: `.\scripts\check.ps1 Q001` (set `$env:SQL_SERVER` first). The output must match exactly: same **column names**, same **rows**, same **order**.
4. Tell me when you have solved some, and I will review the files (correctness, edge cases, readability, performance) and write `answers/Qxxx.review.md`, then commit and push.

Reference solutions are in `_solutions/`. Do not open them before you have tried.

---

### Q001. Uttar Pradesh customers  *(easy)*
List every customer whose `State` is `Uttar Pradesh`.
**Columns:** `CustomerID, FirstName, LastName`. **Order:** FirstName, then LastName.

### Q002. Mid-price products  *(easy)*
Products priced from 500 to 2000 inclusive, in the categories Electronics or Home.
**Columns:** `ProductID, ProductName, Category, UnitPrice`. **Order:** UnitPrice highest first, then ProductID.

### Q003. Missing e-mails, joined in 2025  *(easy)*
Customers with no e-mail address who joined during calendar year 2025.
**Columns:** `CustomerID, FirstName, JoinDate`. **Order:** JoinDate, then CustomerID.
<details><summary>Hint</summary>Use a date range that works for any date type: `>= start AND < next start`.</details>

### Q004. Pattern search  *(easy)*
Customers whose first name starts with a letter from A to D **and** whose city contains the letters `an` anywhere (any capitalisation).
**Columns:** `CustomerID, FirstName, City`. **Order:** CustomerID.
<details><summary>Hint</summary>T-SQL LIKE supports a character range such as `[A-D]`.</details>

### Q005. Orders per status  *(easy)*
How many orders are there in each status?
**Columns:** `Status, OrderCount`. **Order:** OrderCount highest first, then Status.

### Q006. Biggest order lines  *(easy)*
The 10 order lines with the highest line revenue.
**Columns:** `OrderItemID, OrderID, ProductName, LineRevenue`. **Order:** LineRevenue highest first, then OrderItemID.

### Q007. Revenue by category  *(medium)*
Total revenue per product category, ignoring Cancelled orders.
**Columns:** `Category, Revenue`. **Order:** Revenue highest first.

### Q008. Customers who never ordered  *(medium)*
**Columns:** `CustomerID, FirstName, LastName`. **Order:** CustomerID.
<details><summary>Hint</summary>Anti join: LEFT JOIN plus an IS NULL test on the other table's key, or NOT EXISTS.</details>

### Q009. Products never sold  *(medium)*
Products that appear in no order line.
**Columns:** `ProductID, ProductName`. **Order:** ProductID.

### Q010. Monthly performance 2025  *(medium)*
For each month of 2025 that has orders: the number of **distinct** orders and the revenue, ignoring Cancelled orders.
**Columns:** `MonthNo, OrderCount, Revenue`. **Order:** MonthNo.
<details><summary>Hint</summary>One order has several lines, so a plain COUNT(*) after the join over-counts.</details>

### Q011. Customer tiers  *(medium)*
Every customer with total spend (non-cancelled orders; customers without orders have 0) and a tier:
`Gold` if spend is at least 20000, `Silver` at least 8000, otherwise `Bronze`; customers with no qualifying orders are `None`.
**Columns:** `CustomerID, FirstName, TotalSpend, Tier`. **Order:** CustomerID.
<details><summary>Hint</summary>Aggregate in a CTE first, then LEFT JOIN customers to it, then CASE. Watch NULL vs 0.</details>

### Q012. Shipping speed by channel  *(medium)*
Average number of days from order to shipment per channel, only for orders that have a ShipDate, rounded to 2 decimals.
**Columns:** `Channel, AvgDaysToShip`. **Order:** Channel.
<details><summary>Hint</summary>Integer averages drop decimals: multiply by 1.0 before averaging, then CAST to `DECIMAL(5,2)`.</details>

### Q013. Strong categories  *(medium)*
Categories whose non-cancelled revenue is **more than 150000**.
**Columns:** `Category, Revenue`. **Order:** Revenue highest first.

### Q014. Clean customer list  *(medium)*
Full name (`FirstName` + space + `LastName`) and the city cleaned: no leading/trailing spaces, first letter upper case, the rest lower case (`' varanasi '` becomes `Varanasi`).
**Columns:** `CustomerID, FullName, CleanCity`. **Order:** CustomerID.

### Q015. Above-average spenders  *(harder)*
Customers whose total spend (non-cancelled orders) is higher than the **average spend of customers who ordered**.
**Columns:** `CustomerID, FirstName, TotalSpend`. **Order:** TotalSpend highest first, then CustomerID.
<details><summary>Hint</summary>CTE of spend per customer, then a scalar subquery with AVG over that CTE.</details>
