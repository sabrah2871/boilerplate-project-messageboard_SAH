import { use, expect, assert } from 'chai';
import chaiHttp, { request } from 'chai-http';
import server from '../server.js';
import Thread from '../models/threadModel.js';
import Reply from '../models/replyModel.js';

let chai = use(chaiHttp);

describe('Functional Tests', () => {
  const boardText = 'Board Text';

  describe(`Testing Thread's function`, () => {

    let testThread;
    const testThreadProp = {
        board: boardText,
        text: 'Test Thread',
        delete_password: 'valid_password'
    };
    beforeEach(async () => {
      testThread = await Thread.create(testThreadProp);
    });

    it('Creating a new thread: POST request to /api/threads/{board}', (done) => {
      chai.request.execute(server)
        .post(`/api/threads/${boardText}`)
        .send(testThreadProp)
        .redirects(0)
        .end((err, res) => {
          assert.equal(res.status, 302);
          expect(res).to.redirectTo(`/b/Board%20Text/`);
          done();
        });
    });

    it('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{b', (done) => {
      chai.request.execute(server)
        .get(`/api/threads/${boardText}/`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.isObject(res);
          assert.hasAnyKeys(res, ['_id', 'text', 'created_on', 'bumped_on', 'replies', 'replycount']);
          assert.isAtMost(res._body.length, 10);
          res._body.forEach(el => {
            const replyLength = el.replies.length;
            assert.isAtMost(replyLength, 3);
          });
          done();
        });
    });

    it('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', (done) => {
      chai.request.execute(server)
        .delete(`/api/threads/${boardText}/`)
        .send({
          thread_id: testThread._id,
          delete_password: 'invalidPsw',
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    it('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password',  (done) => {
      chai.request.execute(server)
        .delete(`/api/threads/${boardText}/`)
        .send({
          thread_id: testThread._id,
          delete_password: 'valid_password'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'success');
          done();
        });
    });

    it('Reporting a thread: PUT request to /api/threads/{board}', (done) => {
      chai.request.execute(server)
        .put(`/api/threads/${boardText}/`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'reported');
          done();
        });
    });
  });

  describe(`Testing Reply's function`, () => {

    let testThread;
    let testThreadProp = {
        board: boardText,
        text: 'Test Thread',
        delete_password: 'valid_password'
    };
    let testReply;
    let testReplyProp;
    beforeEach(async () => {
      testThread = await Thread.create(testThreadProp);
      testReplyProp = {
          thread_id: String(testThread._id),
          text: 'Test Reply',
          delete_password: 'valid_password'
      };
      testReply = await Reply.create(testReplyProp);
    });

    it('Creating a new reply: POST request to /api/replies/{board}', (done) => {
      chai.request.execute(server)
        .post(`/api/replies/Board%20Text`)
        .send(testReplyProp)
        .redirects(0)
        .end((err, res) => {
          assert.equal(res.status, 302);
          assert.equal(res.type, 'text/plain');
          expect(res).to.redirectTo(`/b/Board%20Text/${testThread._id}`);
          done();
        });
    });

    it('Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
      chai.request.execute(server)
        .get(`/api/replies/Board%20Text`)
        .query({thread_id: String(testThread._id)})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, "_id");
          assert.property(res.body, "text");
          assert.property(res.body, "created_on");
          assert.property(res.body, "bumped_on");
          assert.property(res.body, "replies");
          assert.isArray(res.body.replies);
          assert.notProperty(res.body, "delete_password");
          assert.notProperty(res.body, "reported");
          done();
        });

    });

    it('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', (done) => {
      chai.request.execute(server)
        .delete(`/api/replies/Board%20Text`)
        .send({reply_id: String(testReply._id), delete_password: 'invalid password'})
        .end((err, res) => {
          assert.equal(res.status, 401);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    it('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', (done) => {
      chai.request.execute(server)
        .delete(`/api/replies/Board%20Text`)
        .send({reply_id: String(testReply._id), delete_password: 'valid_password'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'success');
          done();
        });
    });

    it('Reporting a reply: PUT request to /api/replies/{board}', (done) => {
      chai.request.execute(server)
        .put(`/api/replies/Board%20Text`)
        .query({reply_id: String(testReply.id)})
        .end((err, res) => {
          expect(res).to.have.status(200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'reported');
          done();
        });
    });

  });
});

