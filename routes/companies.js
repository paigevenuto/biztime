const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("", async function (req, res, next) {
  try {
    let results = await db.query(`SELECT code, name FROM companies`);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    let results = await db.query(
      `
        SELECT code, name, description 
        FROM companies 
        WHERE code=$1
      `,
      [req.params.code]
    );
    let invoices = await db.query(
      `
          SELECT id
          FROM invoices
          WHERE comp_code=$1
          `,
      [results.rows[0].code]
    );
    invoices = Object.keys(invoices.rows).map((x) => x * 1);
    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    return res.json({
      company: { ...results.rows[0], invoices: [...invoices] },
    });
  } catch (err) {
    return next(err);
  }
});

router.post("", async function (req, res, next) {
  try {
    let { code, name, description } = req.body;
    let results = await db.query(
      `
        INSERT INTO companies (code,name,description)
        VALUES ($1,$2,$3)
        RETURNING code, name, description
     `,
      [code, name, description]
    );
    return res.json({ company: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.put("/:code", async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = req.params.code;
    let results = await db.query(
      `
        UPDATE companies
        SET name=$1, description=$2
        WHERE code=$3
        RETURNING code, name, description
          `,
      [name, description, code]
    );
    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    return res.json({ company: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    await db.query(
      `
        DELETE FROM companies
        WHERE code=$1
      `,
      [req.params.code]
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
