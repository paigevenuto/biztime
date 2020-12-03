const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("", async function (req, res, next) {
  try {
    let results = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    let results = await db.query(
      `
            SELECT id, amt, paid, add_date, paid_date, name AS company
            FROM invoices
            LEFT JOIN companies ON invoices.comp_code=companies.code
            WHERE id=$1`,
      [req.params.id]
    );
    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    return res.json({ invoice: { ...results.rows[0] } });
  } catch (err) {
    return next(err);
  }
});

router.post("", async function (req, res, next) {
  try {
    let { comp_code, amt } = req.body;
    let results = await db.query(
      `
            INSERT INTO invoices (comp_code, amt, add_date)
            VALUES ($1, $2, CURRENT_DATE)
            RETURNING id, comp_code, amt, paid, add_date, paid_date
            `,
      [comp_code, amt]
    );
    return res.json({ invoice: { ...results.rows[0] } });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    let { amt, paid } = req.body;
    let results = paid
      ? await db.query(
          `
                UPDATE invoices 
                SET amt=$1, paid=$2, paid_date=CURRENT_DATE
                WHERE id=$3
                RETURNING id, comp_code, amt, paid, add_date, paid_date
              `,
          [amt, paid, req.params.id]
        )
      : await db.query(
          `
                UPDATE invoices 
                SET amt=$1, paid=$2, paid_date=NULL
                WHERE id=$3
                RETURNING id, comp_code, amt, paid, add_date, paid_date
              `,
          [amt, paid, req.params.id]
        );

    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    return res.json({ invoice: { ...results.rows[0] } });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let results = await db.query(
      `
            DELETE FROM invoices
            WHERE id=$1`,
      [req.params.id]
    );
    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
