const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Message = require("../models/messages");

const newMessage = {
    __v : 0,
    _id: "69af169c47d95cb0927abbed",
    _userId: "69af169c47d95cb0927abbed",
    message: "Au revoir à tous !",
    eventId: "69af6928572e1d0afa641809",
    date: "2026-03-12T00:00:00.000Z",
};

beforeAll(async () => {
    expect(Message).toBeDefined();

    const newFakeMessage = new Message(newMessage);
    await newFakeMessage.save();
});

it("GET /messages/:eventId", async () => {
    const res = await request(app).get("/messages/69af6928572e1d0afa641809");

    expect(res.statusCode).toBe(200);
    console.log(res.body.messages);
    expect(res.body.messages).toEqual(expect.arrayContaining([newMessage]));
});

afterAll(async () => {
    await Message.deleteMany();
    mongoose.connection.close();
});

