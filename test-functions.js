process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const db = require("./db");

async function setUp() {
  await db.query(
    `
         INSERT INTO companies
         VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');
        `
  );
  await db.query(
    `
         INSERT INTO invoices (comp_Code, amt, paid, paid_date)
         VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);
        `
  );
  await db.query(
    `
         INSERT INTO industries (code, industry)
         VALUES ('mobile', 'Mobile Phones' ),
         ('comps', 'Computer Hardware' ),
         ('pcs', 'Personal Computers' );
        `
  );
  await db.query(
    `
         INSERT INTO comp_industries (comp_code, indust_code)
         VALUES ('ibm', 'comps'),
         ('apple', 'mobile'),
         ('apple', 'pcs');
        `
  );
}

async function cleanUp() {
  await db.query(`DELETE FROM comp_industries`);
  await db.query(`DELETE FROM industries`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);
}

module.exports = { setUp, cleanUp };
