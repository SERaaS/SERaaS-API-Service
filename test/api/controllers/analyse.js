const should = require('should'),
  request = require('supertest'),
  server = require('../../../app'),

  // SERaaS user account ID required to test the API endpoints
  userId = require('./testingCredentials');

describe('controllers', function() {

  describe('analyse', function() {

    describe('POST /analyse/all', function() {

      const _file = './test/api/files/test.wav';

      it('should be able to send an audio file and get the emotional statistics back', function(done) {
        request(server)
          .post(`/analyse/${userId}/all`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should only return the happy emotion back if specified', function(done) {
        request(server)
          .post(`/analyse/${userId}/happy`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should be able to return more than one emotion back if specified', function() {
        request(server)
          .post(`/analyse/${userId}/happy,sad`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should be able to process the emotions periodically every 2 seconds if specified', function(done) {
        request(server)
          .post(`/analyse/${userId}/all/2`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if userId not corresponding with a user was used in query', function(done) {
        request(server)
          .post(`/analyse/4e5baa06dcddac3c105328a2/all`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if invalid userId was used in query', function(done) {
        request(server)
          .post(`/analyse/INSERTRANDOMUSERIDHERE/all`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no userId was used in query', function(done) {
        request(server)
          .post(`/analyse//all`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /html/)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if invalid emotions were sent', function(done) {
        request(server)
          .post(`/analyse/${userId}/invalid,emotion,here`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if emotions periodic query is less than 1 second', function() {
        request(server)
          .post(`/analyse/${userId}/all/0`)
          .attach('file', _file)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if video file was sent', function(done) {
        request(server)
          .post(`/analyse/${userId}/all`)
          .attach('file', './test/api/files/testVideoFile.mp4')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if other file types were sent', function(done) {
        request(server)
          .post(`/analyse/${userId}/all`)
          .attach('file', './test/api/files/testTextFile.txt')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no file given', function(done) {
        request(server)
          .post(`/analyse/${userId}/all`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    });
  })
});