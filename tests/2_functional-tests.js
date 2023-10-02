const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
// Creating a new thread: POST request to /api/threads/{board}
// Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
// Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
// Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
// Reporting a thread: PUT request to /api/threads/{board}
// Creating a new reply: POST request to /api/replies/{board}
// Viewing a single thread with all replies: GET request to /api/replies/{board}
// Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
// Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
// Reporting a reply: PUT request to /api/replies/{board}
suite("Functional Tests", function () {
  let threadId; // Store thread ID for testing

  // Test 1: Creating a new thread
  test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .post("/api/threads/test-board") // Replace 'test-board' with your board name
      .send({ text: "New Thread", delete_password: "password" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        threadId = res.body._id; // Store the thread ID for future tests
        done();
      });
  });

  // Test 2: Viewing the 10 most recent threads with 3 replies each
  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .get("/api/threads/test-board") // Replace 'test-board' with your board name
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10); // Ensure there are at most 10 threads
        res.body.forEach((thread) => {
          assert.isArray(thread.replies);
          assert.isAtMost(thread.replies.length, 3); // Ensure there are at most 3 replies per thread
        });
        done();
      });
  });

  // Test 3: Deleting a thread with the incorrect password
  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test-board") // Replace 'test-board' with your board name
      .send({ thread_id: threadId, delete_password: "incorrect" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Incorrect Password");
        done();
      });
  });

  // Test 4: Deleting a thread with the correct password
  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test-board") // Replace 'test-board' with your board name
      .send({ thread_id: threadId, delete_password: "password" }) // Use the correct password
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Thread deleted successfully");
        done();
      });
  });

  // Add more tests for the remaining requirements...
  // Test 5: Reporting a thread
  test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .put(`/api/threads/test-board/${threadId}`) // Replace 'test-board' with your board name
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Thread reported");
        done();
      });
  });

  let replyId; // Store reply ID for testing

  // Test 6: Creating a new reply
  test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .post("/api/replies/test-board") // Replace 'test-board' with your board name
      .send({
        thread_id: threadId,
        text: "New Reply",
        delete_password: "reply_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        replyId = res.body.replies[0]._id; // Store the reply ID for future tests
        done();
      });
  });

  // Test 7: Viewing a single thread with all replies
  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .get(`/api/replies/test-board?thread_id=${threadId}`) // Replace 'test-board' with your board name
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "replies");
        assert.isArray(res.body.replies);
        assert.isAtLeast(res.body.replies.length, 1); // Ensure at least one reply is present
        done();
      });
  });

  // Test 8: Deleting a reply with the incorrect password
  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test-board") // Replace 'test-board' with your board name
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: "incorrect",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Incorrect Password");
        done();
      });
  });

  // Test 9: Deleting a reply with the correct password
  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test-board") // Replace 'test-board' with your board name
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: "reply_password",
      }) // Use the correct password
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Reply deleted successfully");
        done();
      });
  });

  // Test 10: Reporting a reply
  test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .put(`/api/replies/test-board/${threadId}`) // Replace 'test-board' with your board name
      .send({ reply_id: replyId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Reply reported");
        done();
      });
  });
});
