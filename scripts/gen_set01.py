"""Generates practice/set01/setup.sql (database P01_Retail). Deterministic: same data on every run."""
import random, datetime as dt, pathlib
random.seed(101)
out = pathlib.Path(__file__).resolve().parent.parent / "practice" / "set01" / "setup.sql"
q = lambda s: "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"

first = ["Aarav","Anita","Amit","Asha","Bhavna","Chetan","Deepak","Divya","Esha","Farhan","Gaurav","Hema","Ishaan","Jyoti","Karan","Kavita","Lalit","Meera","Nitin","Neha","Omkar","Pooja","Rahul","Rekha","Sanjay","Seema","Tarun","Usha","Vikram","Yogita"]
last = ["Sharma","Verma","Singh","Gupta","Mishra","Yadav","Patel","Joshi","Tiwari","Pandey"]
places = [("Varanasi","Uttar Pradesh"),("Prayagraj","Uttar Pradesh"),("Jaunpur","Uttar Pradesh"),("Chitrakoot","Uttar Pradesh"),
          ("Gopiganj","Uttar Pradesh"),("Lucknow","Uttar Pradesh"),("Delhi","Delhi"),("Mumbai","Maharashtra"),("Pune","Maharashtra"),
          ("Patna","Bihar"),("Kolkata","West Bengal")]
lines = ["USE master;", "IF DB_ID('P01_Retail') IS NOT NULL BEGIN ALTER DATABASE P01_Retail SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE P01_Retail; END",
         "CREATE DATABASE P01_Retail;", "GO", "USE P01_Retail;", "GO",
"""CREATE TABLE Customers (CustomerID INT PRIMARY KEY, FirstName VARCHAR(40) NOT NULL, LastName VARCHAR(40) NOT NULL, City VARCHAR(40) NULL, State VARCHAR(40) NULL, Email VARCHAR(80) NULL, JoinDate DATE NOT NULL, Segment VARCHAR(20) NOT NULL);
CREATE TABLE Products (ProductID INT PRIMARY KEY, ProductName VARCHAR(60) NOT NULL, Category VARCHAR(30) NOT NULL, UnitPrice DECIMAL(10,2) NOT NULL, Cost DECIMAL(10,2) NOT NULL);
CREATE TABLE Orders (OrderID INT PRIMARY KEY, CustomerID INT NOT NULL REFERENCES Customers(CustomerID), OrderDate DATE NOT NULL, ShipDate DATE NULL, Status VARCHAR(20) NOT NULL, Channel VARCHAR(10) NOT NULL);
CREATE TABLE OrderItems (OrderItemID INT PRIMARY KEY, OrderID INT NOT NULL REFERENCES Orders(OrderID), ProductID INT NOT NULL REFERENCES Products(ProductID), Quantity INT NOT NULL, Discount DECIMAL(4,2) NOT NULL);
GO"""]
cust = []
for i in range(1, 31):
    c, s = places[(i * 7 + i // 3) % len(places)]
    if i % 6 == 0: c = " " + c.lower() + " "          # messy: spaces + lower case
    elif i % 11 == 0: c = c.upper()                    # messy: upper case
    email = None if i % 5 == 0 else f"{first[i-1].lower()}.{last[i % 10].lower()}@example.com"
    jd = dt.date(2024, 1, 1) + dt.timedelta(days=random.randint(0, 700))
    cust.append((i, first[i-1], last[i % 10], c, s, email, jd, "Corporate" if i % 7 == 0 else "Retail"))
lines.append("INSERT INTO Customers VALUES\n" + ",\n".join("(%d,%s,%s,%s,%s,%s,%s,%s)" % (r[0], q(r[1]), q(r[2]), q(r[3]), q(r[4]), q(r[5]), q(r[6]), q(r[7])) for r in cust) + ";")
prods = [("Wireless Mouse","Electronics",799,520),("Bluetooth Speaker","Electronics",2499,1700),("USB-C Cable","Electronics",299,120),("Smart Watch","Electronics",5999,4100),
 ("Table Lamp","Home",1199,700),("Bed Sheet Set","Home",1799,950),("Water Bottle","Home",499,210),("Cookware Set","Home",3499,2200),
 ("Cotton T-Shirt","Fashion",599,280),("Denim Jeans","Fashion",1999,1100),("Running Shoes","Fashion",2999,1800),("Leather Wallet","Fashion",899,420),
 ("Basmati Rice 5kg","Grocery",650,520),("Olive Oil 1L","Grocery",899,700),("Green Tea Box","Grocery",350,210),("Almonds 1kg","Grocery",1100,850),
 ("Desk Organizer","Home",699,350),("Phone Stand","Electronics",399,150),("Gift Hamper","Grocery",1999,1300),("Yoga Mat","Fashion",1299,640)]
lines.append("INSERT INTO Products VALUES\n" + ",\n".join("(%d,%s,%s,%s,%s)" % (i+1, q(p[0]), q(p[1]), p[2], p[3]) for i, p in enumerate(prods)) + ";")
orders, items, oi = [], [], 1
for o in range(1, 81):
    cid = random.randint(1, 26)                       # customers 27-30 never order
    od = dt.date(2025, 1, 1) + dt.timedelta(days=random.randint(0, 364))
    st = random.choices(["Delivered","Shipped","Cancelled","Processing"], [70, 10, 10, 10])[0]
    sd = od + dt.timedelta(days=random.randint(1, 9)) if st in ("Delivered", "Shipped") else None
    orders.append((o, cid, od, sd, st, random.choice(["Online","Store","App"])))
    for p in random.sample(range(1, 19), random.randint(1, 4)):       # products 19 and 20 are never sold
        items.append((oi, o, p, random.randint(1, 5), random.choice([0, 0, 0.05, 0.10, 0.15]))); oi += 1
lines.append("INSERT INTO Orders VALUES\n" + ",\n".join("(%d,%d,%s,%s,%s,%s)" % (r[0], r[1], q(r[2]), q(r[3]), q(r[4]), q(r[5])) for r in orders) + ";")
lines.append("INSERT INTO OrderItems VALUES\n" + ",\n".join("(%d,%d,%d,%d,%s)" % r for r in items) + ";")
lines.append("GO\nSELECT (SELECT COUNT(*) FROM Customers) AS Customers, (SELECT COUNT(*) FROM Products) AS Products, (SELECT COUNT(*) FROM Orders) AS Orders, (SELECT COUNT(*) FROM OrderItems) AS OrderItems;")
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("written", out)
