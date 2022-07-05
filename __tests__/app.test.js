const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../db/app.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("nc news", () => {
  describe("Get /api/topics", () => {
    test("Responds with 200 and array of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          topics.forEach((topic) => {
            expect(topic).toHaveProperty("description");
            expect(topic).toHaveProperty("slug");
          });
        });
    });
    test("Responds with 404 when given a path that does not exist ie: /api/tropics", () => {
      return request(app)
        .get("/api/tropics")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid path");
        });
    });
  });
  describe("Get /api/articles/", () => {
    test("Responds with 200 and array of article objects ", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("body");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
          });
        });
    });
  });
});
describe("Get /api/articles/:article_id", () => {
  test("Responds with 200 and relevant article object with correct article ID ", () => {
    const article_id = 2;
    return request(app)
      .get(`/api/articles/${article_id}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          votes: 0,
        });
      });
  });
  test("Responds with 404 and error message if given an ID that does not exist", () => {
    const article_id = 220;
    return request(app)
      .get(`/api/articles/${article_id}`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`No article found for article_id: ${article_id}`);
      });
  });
  test("Responds with 400 and error message if given a string instead of number for ID", () => {
    const article_id = "PinaColada";
    return request(app)
      .get(`/api/articles/${article_id}`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Incorrect type - this must be a number");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("Responds with status 200 and object with increased vote count", () => {
    const article_id = 3;
    const voteUpdate = { inc_votes: 5 };
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send(voteUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 5,
        });
      });
  });
  test("Responds with status 200 and object with decreased vote count", () => {
    const article_id = 1;
    const voteUpdate = { inc_votes: -20 };
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send(voteUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 80,
        });
      });
  });
  test("Responds with status 400 if given an empty object", () => {
    const article_id = 6;
    const voteUpdate = {};
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send(voteUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("missing required fields");
      })
  });
  test("Responds with status 400 if given incorrect value type for vote update", () => {
    const article_id = 6;
    const voteUpdate = {inc_votes: "Here are some extra votes"};
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send(voteUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Incorrect type - this must be a number");
      })
  });
test("Responds with status 404 if give article_id that does not exist", () => {
  const article_id = 687;
  const voteUpdate = {inc_votes: 6};
  return request(app)
    .patch(`/api/articles/${article_id}`)
    .send(voteUpdate)
    .expect(404)
    .then(({ body: { msg } }) => {
      expect(msg).toBe(`No article found for article_id: ${article_id}`);
    })
});
test("Responds with 400 and error message if given a string instead of number for ID", () => {
  const article_id = "tofu";
  const voteUpdate = {inc_votes: 8};
  return request(app)
    .patch(`/api/articles/${article_id}`)
    .send(voteUpdate)
    .expect(400)
    .then(({ body: { msg } }) => {
      expect(msg).toBe("Incorrect type - this must be a number");
    })
});
});

