const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Photo = require("../models/photos");

const newPhoto = {
  __v: 0,
  _id: "69b1c58c9234006b150b1915",
  _userId: "69af0d48bb49d412baa7c80f",
  uri: "https://res.cloudinary.com/dstfu7vnu/image/upload/v1773258121/szidfckv…",
  eventId: "69b1a842496b9961caf75832",
  date: "2026-03-11T19:42:01.000Z",
};

beforeAll(async () => {
  expect(Photo).toBeDefined();

  const newFakePhoto = new Photo(newPhoto);
  await newFakePhoto.save();
});

it("GET /photos/:eventId", async () => {
  const res = await request(app).get("/photos/69b1a842496b9961caf75832");

  expect(res.statusCode).toBe(200);
  console.log(res.body.photos);
  expect(res.body.photos).toEqual(expect.arrayContaining([newPhoto]));
});
afterAll(async () => {
  await Photo.deleteMany();
  mongoose.connection.close();
});
