# Practice plan: 120 SQL questions

Target: 2 to 3 questions a day, about 8 to 10 weeks. Dialect: SQL Server (T-SQL). Each set has its own database, `setup.sql`, questions in `README.md`, your answers in `answers/`, expected outputs in `expected/` and reference solutions in `_solutions/`.

| Set | Theme | Questions | Focus | Status |
|---|---|---|---|---|
| 1 | Retail foundations | Q001-Q015 | filtering, joins, aggregates, CASE, dates, strings | ready |
| 2 | HR and payroll | Q016-Q030 | self joins, set operators, NULL logic, subqueries | planned |
| 3 | E-commerce analytics | Q031-Q045 | window functions: ranking, running totals, LAG/LEAD | planned |
| 4 | Banking ledger | Q046-Q060 | transactions, balances, reconciliation, gaps and islands | planned |
| 5 | Hospital / school | Q061-Q075 | CTEs, recursion, dedup, top-N per group, pivots | planned |
| 6 | Subscriptions (SaaS) | Q076-Q090 | cohorts, retention, SCD2 history, date logic | planned |
| 7 | Programmability | Q091-Q105 | views, temp tables, stored procedures, triggers, error handling | planned |
| 8 | Performance | Q106-Q120 | indexes, execution plans, rewrites, partitions, case studies | planned |

## Workflow

```powershell
$env:SQL_SERVER = "your-server-name"      # once per terminal
sqlcmd -S $env:SQL_SERVER -E -C -i practice\set01\setup.sql   # once per set
# write practice\set01\answers\Q001.sql, then:
.\scripts\check.ps1 Q001
```

## Progress

| Question | Solved | Reviewed |
|---|---|---|
| Q001-Q015 | 0 / 15 | 0 / 15 |
