import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "../src/server.js";
import ProductsModel from "../src/api/products/model.js";

dotenv.config(); // This command forces .env vars to be loaded into process.env. This is the way to do it whenever you can't use -r dotenv/config

// supertest is capable of executing server.listen of our Express app if we pass the Express server to it
// It will give us back a client that can be used to run http requests on that server

const client = supertest(server);

/* describe("Test APIs", () => {
  it("Should test that GET /test endpoint returns 200 and a body containing a message", async () => {
    const response = await client.get("/test")
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual("Test successfull")
  })
})
 */

const validProduct = {
  name: "A valid product",
  description: "balllablalblabl",
  price: 100,
};

const notValidProduct = {
  name: "A not valid product",
  price: 100,
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL_TEST);
  const product = new ProductsModel({
    name: "test",
    description: "blalblabla",
    price: 20,
  });
  await product.save();
});
// beforeAll is a Jest hook ran before all the tests, usually it is used to connect to the db and to do some initial setup (like inserting some mock data in the db)

afterAll(async () => {
  await ProductsModel.deleteMany();
  await mongoose.connection.close();
});
// afterAll hook could be used to clean up the situation (close the connection to Mongo gently and clean up db/collections)

describe("Test APIs", () => {
  it("Should test that the env vars are set correctly", () => {
    expect(process.env.MONGO_URL_TEST).toBeDefined();
  });

  it("Should test that POST /products returns a valid _id and 201", async () => {
    const response = await client
      .post("/products")
      .send(validProduct)
      .expect(201);
    expect(response.body._id).toBeDefined();
  });

  it("Should test that GET /products returns a success status and a body", async () => {
    const response = await client.get("/products").expect(200);
    console.log(response.body);
  });

  it("Should test that POST /products with a not valid product returns a 400", async () => {
    await client.post("/products").send(notValidProduct).expect(400);
  });
});
