"use strict";

const Thread = require("../models").Thread;
const mongoose = require("mongoose");

module.exports = function (app) {
  // POST request to create a new thread
  app.post("/api/threads/:board", (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;
    const newThread = new Thread({
      text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password,
      replies: [],
    });

    newThread.save((err, thread) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect(`/b/${board}`);
      }
    });
  });

  // POST request to create a new reply
  app.post("/api/replies/:board", (req, res) => {
    const { board } = req.params;
    const { thread_id, text, delete_password } = req.body;

    Thread.findById(thread_id, (err, thread) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else if (!thread) {
        res.status(404).send("Thread not found");
      } else {
        const newReply = {
          _id: new mongoose.Types.ObjectId(),
          text,
          created_on: new Date(),
          delete_password,
          reported: false,
        };
        thread.replies.push(newReply);
        thread.bumped_on = new Date();

        thread.save((err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.redirect(`/b/${board}/${thread_id}`);
          }
        });
      }
    });
  });

  // GET request to retrieve recent threads
  app.get("/api/threads/:board", (req, res) => {
    const { board } = req.params;

    Thread.find({})
      .sort({ bumped_on: -1 })
      .limit(10)
      .exec((err, threads) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } else {
          threads = threads.map((thread) => {
            const recentReplies = thread.replies.slice(0, 3).map((reply) => ({
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on,
            }));

            return {
              _id: thread._id,
              text: thread.text,
              created_on: thread.created_on,
              bumped_on: thread.bumped_on,
              replies: recentReplies,
            };
          });

          res.json(threads);
        }
      });
  });

  // DELETE request to delete a thread
  app.delete("/api/threads/:board", (req, res) => {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;

    // Find the thread by ID and check if the delete_password matches
    Thread.findById(thread_id, (err, thread) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else if (!thread) {
        res.status(404).send("Thread not found");
      } else if (thread.delete_password !== delete_password) {
        res.status(400).send("Incorrect Password");
      } else {
        // Delete the thread if the password is correct
        thread.remove((err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.send("Thread deleted successfully");
          }
        });
      }
    });
  });

  // PUT request to report a thread
  app.put("/api/threads/:board", (req, res) => {
    const { board } = req.params;
    const { thread_id } = req.body;

    // Find the thread by ID and mark it as reported
    Thread.findByIdAndUpdate(
      thread_id,
      { reported: true },
      { new: true },
      (err, updatedThread) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } else if (!updatedThread) {
          res.status(404).send("Thread not found");
        } else {
          res.send("Thread reported");
        }
      }
    );
  });

  // DELETE request to delete a reply
  app.delete("/api/replies/:board", (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id, delete_password } = req.body;

    // Find the thread by ID and check if the delete_password matches
    Thread.findById(thread_id, (err, thread) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else if (!thread) {
        res.status(404).send("Thread not found");
      } else {
        // Find the reply by ID within the thread and check the delete_password
        const reply = thread.replies.find((reply) =>
          reply._id.equals(reply_id)
        );
        if (!reply) {
          res.status(404).send("Reply not found");
        } else if (reply.delete_password !== delete_password) {
          res.status(400).send("Incorrect Password");
        } else {
          // Mark the reply as deleted by changing its text
          reply.text = "[deleted]";
          thread.save((err) => {
            if (err) {
              console.error(err);
              res.status(500).send("Internal Server Error");
            } else {
              res.send("Reply deleted successfully");
            }
          });
        }
      }
    });
  });

  // PUT request to report a reply
  app.put("/api/replies/:board", (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id } = req.body;

    // Find the thread by ID and mark the reply as reported
    Thread.findOneAndUpdate(
      { _id: thread_id, "replies._id": reply_id },
      { $set: { "replies.$.reported": true } },
      { new: true },
      (err, updatedThread) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } else if (!updatedThread) {
          res.status(404).send("Thread or Reply not found");
        } else {
          res.send("Reply reported");
        }
      }
    );
  });
};
