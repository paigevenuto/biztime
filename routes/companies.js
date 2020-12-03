const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

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
        SELECT c.code, c.name, c.description, i.id
        FROM companies AS c
        LEFT JOIN invoices AS i
        ON c.code = i.comp_code
        WHERE c.code=$1
      `,
      [req.params.code]
    );
    let industries = await db.query(
      `
        SELECT ind.industry
        FROM comp_industries AS ci
        LEFT JOIN industries AS ind
        ON ci.indust_code =  ind.code
        WHERE ci.comp_code=$1
    `,
      [req.params.code]
    );
    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    let { code, name, description, indust_code } = results.rows[0];
    let invoices = results.rows.map((i) => i.id);
    industries = industries.rows.map((i) => i.industry);
    return res.json({
      company: { code, name, description, invoices, industries },
    });
  } catch (err) {
    return next(err);
  }
});

router.post("", async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true, strict: true });
    let results = await db.query(
      `
        INSERT INTO companies (code,name,description)
        VALUES ($1,$2,$3)
        RETURNING code, name, description
     `,
      [code, name, description]
    );
    return res.json({ company: { ...results.rows[0] } });
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
    return res.json({ company: { ...results.rows[0] } });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    let results = await db.query(
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
