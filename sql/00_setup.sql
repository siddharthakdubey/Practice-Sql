/* =====================================================================
   Learn-SQL : sample database (SQL Server / T-SQL)
   Run this whole script once in SSMS or Azure Data Studio.
   It is safe to re-run: it drops and recreates everything.
   ===================================================================== */
USE master;
GO
IF DB_ID('MyDatabase') IS NOT NULL
BEGIN
    ALTER DATABASE MyDatabase SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE MyDatabase;
END
GO
CREATE DATABASE MyDatabase;
GO
USE MyDatabase;
GO

/* ---------- Customers ---------- */
CREATE TABLE Customers (
    CustomerID INT          NOT NULL CONSTRAINT pk_customers PRIMARY KEY,
    FirstName  VARCHAR(50)  NOT NULL,
    LastName   VARCHAR(50)  NULL,
    Country    VARCHAR(50)  NULL,
    Score      INT          NULL
);
INSERT INTO Customers (CustomerID, FirstName, LastName, Country, Score) VALUES
(1, 'Jossef', 'Goldberg', 'Germany', 350),
(2, 'Kevin',  'Brown',    'USA',     900),
(3, 'Mary',   NULL,       'USA',     750),
(4, 'Mark',   'Schwarz',  'Germany', 500),
(5, 'Anna',   'Adams',    'USA',     NULL);

/* ---------- Employees ---------- */
CREATE TABLE Employees (
    EmployeeID INT           NOT NULL CONSTRAINT pk_employees PRIMARY KEY,
    FirstName  VARCHAR(50)   NOT NULL,
    LastName   VARCHAR(50)   NOT NULL,
    Department VARCHAR(50)   NOT NULL,
    BirthDate  DATE          NULL,
    Gender     CHAR(1)       NULL,
    Salary     DECIMAL(10,2) NULL,
    ManagerID  INT           NULL CONSTRAINT fk_emp_manager REFERENCES Employees(EmployeeID)
);
INSERT INTO Employees (EmployeeID, FirstName, LastName, Department, BirthDate, Gender, Salary, ManagerID) VALUES
(1, 'Frank',   'Lee',   'Marketing', '1988-01-12', 'M', 55000, NULL),
(2, 'Kevin',   'Brown', 'Marketing', '1972-11-25', 'M', 65000, 1),
(3, 'Mary',    'Dax',   'Sales',     '1986-01-05', 'F', 75000, 1),
(4, 'Michael', 'Ray',   'Sales',     '1977-02-10', 'M', 90000, 2),
(5, 'Carol',   'Baker', 'Sales',     '1982-02-11', 'F', 55000, 3);

/* ---------- Products ---------- */
CREATE TABLE Products (
    ProductID INT           NOT NULL CONSTRAINT pk_products PRIMARY KEY,
    Product   VARCHAR(50)   NOT NULL,
    Category  VARCHAR(50)   NULL,
    Price     DECIMAL(10,2) NULL
);
INSERT INTO Products (ProductID, Product, Category, Price) VALUES
(101, 'Bottle', 'Accessories', 10),
(102, 'Tire',   'Accessories', 20),
(103, 'Socks',  'Clothing',    15),
(104, 'Gloves', 'Clothing',    45),
(105, 'Helmet', 'Accessories', 25);

/* ---------- Orders ----------
   CustomerID has NO foreign key on purpose: order 1004 points to a customer
   that does not exist (6). Real data is messy and joins must cope with it.   */
CREATE TABLE Orders (
    OrderID       INT          NOT NULL CONSTRAINT pk_orders PRIMARY KEY,
    CustomerID    INT          NULL,
    ProductID     INT          NOT NULL CONSTRAINT fk_orders_product REFERENCES Products(ProductID),
    SalesPersonID INT          NULL     CONSTRAINT fk_orders_emp REFERENCES Employees(EmployeeID),
    OrderDate     DATE         NOT NULL,
    ShipDate      DATE         NULL,
    OrderStatus   VARCHAR(20)  NOT NULL,
    Quantity      INT          NOT NULL,
    Sales         DECIMAL(10,2) NOT NULL
);
INSERT INTO Orders (OrderID, CustomerID, ProductID, SalesPersonID, OrderDate, ShipDate, OrderStatus, Quantity, Sales) VALUES
(1001, 2, 101, 3, '2025-01-01', '2025-01-05', 'Delivered',  2, 20),
(1002, 3, 102, 3, '2025-01-05', '2025-01-10', 'Shipped',    3, 60),
(1003, 1, 101, 5, '2025-01-10', '2025-01-25', 'Delivered',  1, 10),
(1004, 6, 104, 5, '2025-01-20', '2025-01-25', 'Shipped',    2, 90),
(1005, 4, 102, 4, '2025-02-01', '2025-02-05', 'Delivered',  2, 40),
(1006, 2, 105, 4, '2025-02-05', '2025-02-10', 'Delivered',  1, 25),
(1007, 3, 101, 3, '2025-02-15', NULL,         'Processing', 4, 40),
(1008, 1, 105, 5, '2025-03-01', '2025-03-04', 'Delivered',  2, 50),
(1009, 2, 102, 3, '2025-03-10', '2025-03-15', 'Shipped',    1, 20),
(1010, 4, 104, 4, '2025-03-15', '2025-03-20', 'Delivered',  1, 45);
GO
SELECT 'Setup complete' AS Status,
       (SELECT COUNT(*) FROM Customers) AS Customers,
       (SELECT COUNT(*) FROM Employees) AS Employees,
       (SELECT COUNT(*) FROM Products)  AS Products,
       (SELECT COUNT(*) FROM Orders)    AS Orders;
