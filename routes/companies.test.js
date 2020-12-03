process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

const { setUp, cleanUp } = require("../test-functions");

beforeAll(cleanUp);

beforeEach(setUp);
afterEach(cleanUp);

afterAll(async function () {
  await db.end();
});

describe("GET /companies", function () {
  test("Get all companies", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [
        { code: "apple", name: "Apple Computer" },
        { code: "ibm", name: "IBM" },
      ],
    });
  });
});

describe("GET /companies/:company", function () {
  test("Get a company", async function () {
    const resp = await request(app).get("/companies/apple");
    expect(resp.body.company.invoices.length).toEqual(3);
    expect(resp.body.company.industries).toEqual([
      "Mobile Phones",
      "Personal Computers",
    ]);
    expect(resp.body.company.code).toEqual("apple");
    expect(resp.body.company.name).toEqual("Apple Computer");
    expect(resp.body.company.description).toEqual("Maker of OSX.");
  });
});

describe("POST /companies", function () {
  test("Add a company", async function () {
    const resp = await request(app).post("/companies").send({
      name: "Paige's Test Company",
    });
    expect(resp.body).toEqual({
      company: {
        code: "paiges-test-company",
        name: "Paige's Test Company",
        description: null,
      },
    });
  });
});

describe("PUT /companies/:code", function () {
  test("Update a company", async function () {
    const resp = await request(app).put("/companies/apple").send({
      name: "Apple Inc.",
      description: "We make planned obsolescence",
    });
    expect(resp.body).toEqual({
      company: {
        code: "apple",
        name: "Apple Inc.",
        description: "We make planned obsolescence",
      },
    });
  });
});

describe("DELETE /companies", function () {
  test("Delete a company", async function () {
    const resp = await request(app).delete("/companies/apple").send({});
    expect(resp.body).toEqual({
      status: "deleted",
    });
  });
});
