/* Learn-SQL course engine: navigation, SQL highlighter, table renderer, step-by-step visualiser */
(function () {
  const SRC = document.currentScript.src;
  const ROOT = new URL("../", SRC).href;

  // ---------- Table of contents (order follows the video chapters) ----------
  const TOC = [
    ["beg", "Beginner", [
      ["01-intro", "Intro: how to use this course"],
      ["02-intro-to-sql", "Introduction to SQL"],
      ["03-setup", "Setup your environment"],
      ["04-select", "Query data (SELECT)"],
      ["05-ddl", "DDL commands"],
      ["06-dml", "DML commands"]]],
    ["int", "Intermediate", [
      ["07-filtering", "Filtering data"],
      ["08-joins-basic", "SQL joins (basics)"],
      ["09-joins-advanced", "SQL joins (advanced)"],
      ["10-set-operators", "Set operators"],
      ["11-sql-functions", "SQL functions (overview)"],
      ["12-string-functions", "String functions"],
      ["13-numeric-functions", "Numeric functions"],
      ["14-date-functions", "Date and time functions"],
      ["15-null-functions", "NULL functions"],
      ["16-case", "CASE statement"],
      ["17-aggregate", "Aggregate functions"],
      ["18-window-basics", "Window functions: basics"],
      ["19-window-aggregate", "Window aggregate"],
      ["20-window-ranking", "Window ranking"],
      ["21-window-value", "Window value (LAG, LEAD...)"]]],
    ["adv", "Advanced", [
      ["22-advanced-techniques", "Advanced SQL techniques"],
      ["23-subqueries", "Subqueries"],
      ["24-cte", "Common Table Expressions"],
      ["25-views", "Views"],
      ["26-ctas-temp", "CTAS and temp tables"],
      ["27-compare-techniques", "Compare advanced techniques"],
      ["28-stored-procedures", "Stored procedures"],
      ["29-triggers", "Triggers"],
      ["30-indexes", "Indexes"],
      ["31-execution-plan", "Execution plan"],
      ["32-partitions", "Partitions"],
      ["33-performance-tips", "30 performance tips"],
      ["34-ai-and-sql", "AI and SQL"]]]
  ];
  const FLAT = [];
  TOC.forEach(([lvl, name, items]) => items.forEach(([f, t]) => FLAT.push({ f, t, lvl, name })));

  const store = {
    get() { try { return JSON.parse(localStorage.getItem("learnsql.done") || "{}"); } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem("learnsql.done", JSON.stringify(v)); } catch (e) {} }
  };

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- SQL highlighter ----------
  const KW = new Set(("SELECT FROM WHERE GROUP BY HAVING ORDER ASC DESC TOP DISTINCT AS AND OR NOT IN BETWEEN LIKE IS NULL " +
    "JOIN INNER LEFT RIGHT FULL OUTER CROSS ON UNION ALL EXCEPT INTERSECT INSERT INTO VALUES UPDATE SET DELETE TRUNCATE " +
    "CREATE ALTER DROP TABLE VIEW INDEX DATABASE CONSTRAINT PRIMARY KEY FOREIGN REFERENCES DEFAULT UNIQUE CHECK ADD COLUMN " +
    "CASE WHEN THEN ELSE END OVER PARTITION ROWS RANGE BETWEEN UNBOUNDED PRECEDING FOLLOWING CURRENT ROW WITH RECURSIVE " +
    "EXISTS ANY SOME PROCEDURE PROC FUNCTION TRIGGER BEGIN DECLARE RETURN RETURNS EXEC EXECUTE AFTER BEFORE INSTEAD OF FOR " +
    "IF WHILE PRINT GO USE OFFSET FETCH NEXT ONLY MERGE USING MATCHED OUTPUT CLUSTERED NONCLUSTERED INCLUDE STATISTICS " +
    "TRY CATCH TRANSACTION COMMIT ROLLBACK TEMP IDENTITY INT VARCHAR NVARCHAR CHAR DATE DATETIME DECIMAL FLOAT BIT " +
    "SCHEME SCHEMA PERCENT TIES READONLY NOCOUNT ON OFF GRANT REVOKE").split(" "));
  function hl(code) {
    const re = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|\b(\d+(?:\.\d+)?)\b|(@{0,2}#{0,2}[A-Za-z_][\w]*)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="c">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="d">' + m[3] + "</span>";
      else {
        const w = m[4], nxt = code.slice(re.lastIndex).match(/^\s*\(/);
        if (KW.has(w.toUpperCase()) && !nxt) out += '<span class="k">' + esc(w) + "</span>";
        else if (nxt) out += '<span class="f">' + esc(w) + "</span>";
        else out += esc(w);
      }
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  // ---------- Table helpers ----------
  const isNum = v => /^-?\d+(\.\d+)?$/.test(v);
  function cell(v, hlc) {
    const cls = [];
    if (hlc) cls.push("hl");
    if (v === null || v === "NULL") { cls.push("null"); v = "NULL"; }
    else if (typeof v === "number" || isNum(String(v))) cls.push("num");
    return "<td" + (cls.length ? " class='" + cls.join(" ") + "'" : "") + ">" + esc(String(v)) + "</td>";
  }
  function tableHTML(cols, rows, marks, hlCols) {
    let h = "<table class='t'><tr>" + cols.map((c, i) => "<th" + (hlCols && hlCols.includes(i) ? " class='hl'" : "") + ">" + esc(c) + "</th>").join("") + "</tr>";
    rows.forEach((r, i) => {
      h += "<tr" + (marks && marks[i] ? " class='" + marks[i] + "'" : "") + ">" + r.map((v, j) => cell(v, hlCols && hlCols.includes(j))).join("") + "</tr>";
    });
    return h + "</table>";
  }
  function box(title, cols, rows, extra, marks, hlCols) {
    return "<div class='tblbox " + (extra || "") + "'><div class='cap'>" + esc(title) + "</div><div class='scroll'>" + tableHTML(cols, rows, marks, hlCols) + "</div></div>";
  }
  function parseTbl(text) {
    const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean).map(l => l.split("|").map(x => x.trim()));
    return { cols: lines[0], rows: lines.slice(1) };
  }

  // ---------- Standard sample tables (same as sql/00_setup.sql) ----------
  const N = null;
  const DATA = {
    customers: { id: "customers", title: "Customers", cols: ["CustomerID", "FirstName", "LastName", "Country", "Score"], rows: [
      [1, "Jossef", "Goldberg", "Germany", 350], [2, "Kevin", "Brown", "USA", 900], [3, "Mary", N, "USA", 750],
      [4, "Mark", "Schwarz", "Germany", 500], [5, "Anna", "Adams", "USA", N]] },
    employees: { id: "employees", title: "Employees", cols: ["EmployeeID", "FirstName", "LastName", "Department", "BirthDate", "Gender", "Salary", "ManagerID"], rows: [
      [1, "Frank", "Lee", "Marketing", "1988-01-12", "M", 55000, N], [2, "Kevin", "Brown", "Marketing", "1972-11-25", "M", 65000, 1],
      [3, "Mary", "Dax", "Sales", "1986-01-05", "F", 75000, 1], [4, "Michael", "Ray", "Sales", "1977-02-10", "M", 90000, 2],
      [5, "Carol", "Baker", "Sales", "1982-02-11", "F", 55000, 3]] },
    products: { id: "products", title: "Products", cols: ["ProductID", "Product", "Category", "Price"], rows: [
      [101, "Bottle", "Accessories", 10], [102, "Tire", "Accessories", 20], [103, "Socks", "Clothing", 15],
      [104, "Gloves", "Clothing", 45], [105, "Helmet", "Accessories", 25]] },
    orders: { id: "orders", title: "Orders", cols: ["OrderID", "CustomerID", "ProductID", "SalesPersonID", "OrderDate", "ShipDate", "OrderStatus", "Quantity", "Sales"], rows: [
      [1001, 2, 101, 3, "2025-01-01", "2025-01-05", "Delivered", 2, 20], [1002, 3, 102, 3, "2025-01-05", "2025-01-10", "Shipped", 3, 60],
      [1003, 1, 101, 5, "2025-01-10", "2025-01-25", "Delivered", 1, 10], [1004, 6, 104, 5, "2025-01-20", "2025-01-25", "Shipped", 2, 90],
      [1005, 4, 102, 4, "2025-02-01", "2025-02-05", "Delivered", 2, 40], [1006, 2, 105, 4, "2025-02-05", "2025-02-10", "Delivered", 1, 25],
      [1007, 3, 101, 3, "2025-02-15", N, "Processing", 4, 40], [1008, 1, 105, 5, "2025-03-01", "2025-03-04", "Delivered", 2, 50],
      [1009, 2, 102, 3, "2025-03-10", "2025-03-15", "Shipped", 1, 20], [1010, 4, 104, 4, "2025-03-15", "2025-03-20", "Delivered", 1, 45]] }
  };
  // Narrow copy of a standard table: pick(DATA.orders, ["OrderID","Sales"])
  function pick(t, names, title) {
    const ix = names.map(n => t.cols.indexOf(n));
    return { id: t.id, title: title || t.title, cols: names, rows: t.rows.map(r => ix.map(i => r[i])) };
  }

  // ---------- Visualiser ----------
  window.VIZ = window.VIZ || {};
  function initViz(el) {
    const spec = window.VIZ[el.dataset.id];
    if (!spec) { el.innerHTML = "<em>(visual missing: " + el.dataset.id + ")</em>"; return; }
    let i = 0, timer = null;
    const T = spec.tables || [];
    const steps = spec.steps;
    el.innerHTML =
      "<div class='vt'><small>VISUAL</small>" + esc(spec.title || "") + "</div>" +
      (spec.query ? "<pre><code>" + hl(spec.query) + "</code></pre>" : "") +
      "<div class='stage'></div><div class='note'></div>" +
      "<div class='ctl'><button class='alt' data-a='reset'>⟲ Start</button><button class='alt' data-a='prev'>◀ Back</button>" +
      "<button data-a='next'>Next ▶</button><button class='alt' data-a='play'>▶▶ Auto-play</button><span class='stepno'></span></div>" +
      "<div class='legend'><i style='background:var(--g)'></i>kept / matched<i style='background:var(--r)'></i>dropped<i style='background:var(--y)'></i>being looked at" +
      "<i style='background:var(--b)'></i>group A<i style='background:var(--p)'></i>group B<i style='background:var(--o)'></i>group C</div>";
    const stage = el.querySelector(".stage"), note = el.querySelector(".note"), sn = el.querySelector(".stepno");
    const btn = a => el.querySelector("[data-a=" + a + "]");
    function resultAt(k) {
      let rows = [], cols = spec.result ? spec.result.cols : null, fresh = 0;
      for (let s = 0; s <= k; s++) {
        const st = steps[s];
        if (st.rcols) cols = st.rcols;
        if (st.result) { rows = st.result.slice(); fresh = s === k ? rows.length : 0; }
        if (st.add) { rows = rows.concat(st.add); if (s === k) fresh = st.add.length; }
        if (s === k && !st.add && !st.result) fresh = 0;
      }
      return { cols, rows, fresh };
    }
    function draw() {
      const st = steps[i], mk = st.mark || {}, hc = st.cols || {};
      let h = T.map(t => box(t.title || t.id, t.cols, t.rows, "", mk[t.id], hc[t.id])).join("");
      if (spec.result) {
        const r = resultAt(i);
        h += "<div class='res'>" + box(spec.result.title || "Result", r.cols, r.rows, "res", r.rows.map((_, n) => (n >= r.rows.length - r.fresh ? "newrow" : "")), null) + "</div>";
      }
      stage.innerHTML = h;
      note.innerHTML = st.note;
      sn.textContent = "Step " + (i + 1) + " / " + steps.length;
      btn("prev").disabled = i === 0; btn("next").disabled = i === steps.length - 1;
    }
    function stop() { clearInterval(timer); timer = null; btn("play").textContent = "▶▶ Auto-play"; }
    el.addEventListener("click", e => {
      const a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === "next" && i < steps.length - 1) { i++; }
      if (a === "prev" && i > 0) { i--; }
      if (a === "reset") { i = 0; stop(); }
      if (a === "play") {
        if (timer) { stop(); return; }
        btn("play").textContent = "❚❚ Pause";
        if (i === steps.length - 1) i = 0;
        draw();
        timer = setInterval(() => { if (i < steps.length - 1) { i++; draw(); } else stop(); }, 2200);
        return;
      }
      draw();
    });
    draw();
  }

  // ---------- Page chrome ----------
  function chrome() {
    const body = document.body, page = body.dataset.page;
    const idx = FLAT.findIndex(x => x.f === page), done = store.get();
    const nDone = FLAT.filter(x => done[x.f]).length;
    const nav = TOC.map(([lvl, name, items]) => "<h4>" + name + "</h4>" + items.map(([f, t]) => {
      const n = FLAT.findIndex(x => x.f === f) + 1;
      return "<a href='" + ROOT + "pages/" + f + ".html' class='" + (f === page ? "cur " : "") + (done[f] ? "done" : "") + "'><span class='n'>" + n + "</span><span>" + esc(t) + "</span></a>";
    }).join("")).join("");
    const main = document.querySelector("main");
    const wrap = document.createElement("div");
    wrap.innerHTML =
      "<header class='top'><button class='menu' aria-label='Menu'>☰</button><a href='" + ROOT + "index.html'>Learn SQL</a><span class='sp'></span><span class='prog'>" + nDone + " / " + FLAT.length + " topics done</span></header>" +
      "<div class='layout'><nav class='side'><a href='" + ROOT + "index.html'><span class='n'>⌂</span><span>Course home</span></a><a href='" + ROOT + "sql/00_setup.sql'><span class='n'>⛁</span><span>Sample database script</span></a>" + nav + "</nav></div>";
    body.insertBefore(wrap.firstElementChild, body.firstChild);
    const layout = wrap.firstElementChild;
    body.insertBefore(layout, main);
    layout.appendChild(main);
    body.querySelector(".menu").onclick = () => body.classList.toggle("nav-open");
    const cur = body.querySelector("nav.side a.cur"); if (cur) cur.scrollIntoView({ block: "center" });

    if (idx >= 0) {
      const lv = FLAT[idx], p = FLAT[idx - 1], n = FLAT[idx + 1];
      const h1 = main.querySelector("h1");
      if (h1) h1.insertAdjacentHTML("beforebegin", "<span class='lvl " + lv.lvl + "'>" + lv.name.toUpperCase() + " · TOPIC " + (idx + 1) + " OF " + FLAT.length + "</span>");
      main.insertAdjacentHTML("beforeend",
        "<button class='donebtn " + (done[page] ? "on" : "") + "'>" + (done[page] ? "✓ Completed" : "Mark as completed") + "</button>" +
        "<div class='pager'>" + (p ? "<a href='" + ROOT + "pages/" + p.f + ".html'><small>◀ Previous</small>" + esc(p.t) + "</a>" : "<span></span>") +
        (n ? "<a class='nx' href='" + ROOT + "pages/" + n.f + ".html'><small>Next ▶</small>" + esc(n.t) + "</a>" : "<span></span>") + "</div>");
      main.querySelector(".donebtn").onclick = function () {
        const d = store.get(); d[page] = !d[page]; store.set(d);
        this.classList.toggle("on", !!d[page]); this.textContent = d[page] ? "✓ Completed" : "Mark as completed";
        document.querySelector("header.top .prog").textContent = FLAT.filter(x => d[x.f]).length + " / " + FLAT.length + " topics done";
        const a = [...document.querySelectorAll("nav.side a")].find(x => x.classList.contains("cur")); if (a) a.classList.toggle("done", !!d[page]);
      };
    }
  }

  function enhance() {
    document.querySelectorAll("pre.sql").forEach(pre => {
      const code = pre.textContent.replace(/^\n/, "").replace(/\s+$/, "");
      const w = document.createElement("div"); w.className = "codewrap";
      pre.parentNode.insertBefore(w, pre); pre.innerHTML = "<code>" + hl(code) + "</code>"; w.appendChild(pre);
      const b = document.createElement("button"); b.className = "copy"; b.textContent = "Copy";
      b.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(code); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1200); };
      w.appendChild(b);
    });
    document.querySelectorAll(".tbl").forEach(el => {
      const hc = el.dataset.hl ? el.dataset.hl.split(",").map(Number) : null;
      if (el.dataset.src) {
        let t = DATA[el.dataset.src];
        if (el.dataset.cols) t = pick(t, el.dataset.cols.split(","));
        el.outerHTML = box(t.title, t.cols, t.rows, "", null, hc); return;
      }
      const t = parseTbl(el.textContent);
      el.outerHTML = box(el.dataset.title || "Result", t.cols, t.rows, el.dataset.kind === "res" || !el.dataset.title ? "res" : "", null, hc);
    });
    document.querySelectorAll(".viz").forEach(initViz);
  }

  document.addEventListener("DOMContentLoaded", () => { enhance(); if (document.body.dataset.page) chrome(); });
  // ---------- Join animation builder ----------
  // o = {title, query, L, R, lk, rk (column indexes), type, cols, out(l, r) -> row, lname, rname}
  function joinSpec(o) {
    const t = o.type, L = o.L, R = o.R, lid = L.id, rid = R.id, ln = o.lname || L.title, rn = o.rname || R.title;
    const keepL = ["left", "full", "leftanti", "fullanti"].includes(t), keepR = ["right", "full", "rightanti", "fullanti"].includes(t);
    const anti = t.endsWith("anti"), cross = t === "cross", innerOut = !anti;
    const lkv = r => r[o.lk], rkv = r => r[o.rk];
    const steps = [{ note: cross ? "<b>CROSS JOIN</b>: no ON condition. Every " + ln + " row is paired with every " + rn + " row." :
      "Join condition: <code>" + ln + "." + L.cols[o.lk] + " = " + rn + "." + R.cols[o.rk] + "</code>. For each " + ln + " row the engine looks for matching " + rn + " rows." }];
    const used = new Set(), rows = [];
    L.rows.forEach((lr, i) => {
      const m = []; R.rows.forEach((rr, j) => { if (cross || (lkv(lr) !== null && lkv(lr) === rkv(rr))) m.push(j); });
      m.forEach(j => used.add(j));
      const mark = {}; mark[lid] = {}; mark[lid][i] = "y"; mark[rid] = {}; m.forEach(j => mark[rid][j] = "g");
      let add = [], note;
      if (m.length) {
        if (innerOut) { add = m.map(j => o.out(lr, R.rows[j])); note = "<b>" + ln + " row " + (i + 1) + "</b> (yellow) matches " + m.length + " " + rn + " row" + (m.length > 1 ? "s" : "") + " (green). " + (cross ? "" : "One output row per match.");}
        else note = "<b>" + ln + " row " + (i + 1) + "</b> has " + m.length + " match" + (m.length > 1 ? "es" : "") + ", so an anti join <b>drops</b> it.";
      } else if (keepL) { add = [o.out(lr, null)]; note = "<b>" + ln + " row " + (i + 1) + "</b> has <b>no match</b>. It is kept, and the " + rn + " columns are filled with NULL."; }
      else { mark[lid][i] = "r"; note = "<b>" + ln + " row " + (i + 1) + "</b> has <b>no match</b>, so it is dropped from the result."; }
      rows.push(...add);
      steps.push({ note, mark, add });
    });
    const un = []; R.rows.forEach((rr, j) => { if (!used.has(j)) un.push(j); });
    if (un.length) {
      const mark = {}; mark[rid] = {}; un.forEach(j => mark[rid][j] = keepR ? "y" : "r");
      steps.push(keepR ? { note: "Now the " + rn + " rows that matched nothing (" + un.length + "): they are kept and the " + ln + " columns become NULL.", mark, add: un.map(j => o.out(null, R.rows[j])) }
        : { note: "The " + rn + " rows that matched nothing (red, " + un.length + ") are not in the result.", mark });
    }
    steps.push({ note: "<b>Done.</b> The result has <b>" + (rows.length + (keepR ? un.length : 0)) + "</b> rows." });
    return { title: o.title, query: o.query, tables: [L, R], result: { title: "Result", cols: o.cols }, steps };
  }

  window.LearnSQL = { TOC, FLAT, hl, DATA, pick, joinSpec };
  window.joinSpec = joinSpec;
  window.D = DATA; window.pick = pick;
})();
