const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get("", async function (req, res, next) {
  try {
    let results = await db.query(`SELECT code, industry FROM industries`);
    return res.json({ industries: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.post("", async function (req, res, next) {
  try {
    let code = slugify(req.body.industry, { lower: true, strict: true });
    let results = await db.query(
      `
        INSERT INTO industries (code, industry)
        VALUES ($1,$2)
        RETURNING code, industry
     `,
      [code, req.body.industry]
    );
    return res.json({ industry: { ...results.rows[0] } });
  } catch (err) {
    return next(err);
  }
});

router.post("/:comp_code", async function (req, res, next) {
  try {
    let comp_code = req.params.comp_code;
    let indust_code = req.body.indust_code;
    let results = await db.query(
      `
        INSERT INTO comp_industries (comp_code, indust_code)
        VALUES ($1,$2)
        RETURNING comp_code, indust_code
     `,
      [comp_code, indust_code]
    );
    if (!results.rowCount) {
      const err = new ExpressError("Not Found", 404);
      return next(err);
    }
    return res.json({ added: { ...results.rows[0] } });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:comp_code/:indust_code", async function (req, res, next) {
  try {
    let { comp_code, indust_code } = req.params;
    let results = await db.query(
      `
        DELETE FROM comp_industries
        WHERE comp_code=$1
        AND indust_code=$2
        RETURNING comp_code, indust_code
     `,
      [comp_code, indust_code]
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
