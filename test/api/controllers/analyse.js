const should = require('should'),
    request = require('supertest'),
    server = require('../../../app');

describe('controllers', function() {

    describe('analyse', function() {

        describe('GET /analyse', function() {

            it('should return a default string', function(done) {

                request(server)
                  .get('/analyse')
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end(function(err, res) {
                    should.not.exist(err);
        
                    res.body.should.eql('Hello, stranger!');
        
                    done();
                  });
              });
        
              it('should accept a name parameter', function(done) {
        
                request(server)
                  .get('/analyse')
                  .query({ name: 'Scott'})
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end(function(err, res) {
                    should.not.exist(err);
        
                    res.body.should.eql('Hello, Scott!');
        
                    done();
                  });
              });        
        })

        describe('POST /analyse/all', function() {

          const _file = './test/api/files/test.wav';

          it('should be able to send an audio file and get the emotional statistics back', function(done) {
            request(server)
              .post('/analyse/all')
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
              .post('/analyse/happy')
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
              .post('/analyse/happy,sad')
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
              .post('/analyse/all/2')
              .attach('file', _file)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                if (err) { done(new Error(err)); }
                else { done(); }
              });
          });

          it('should give error if invalid emotions were sent', function(done) {
            request(server)
              .post('/analyse/invalid,emotion,here')
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
              .post('/analyse/all/0')
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
              .post('/analyse/all')
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
              .post('/analyse/all')
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
              .post('/analyse/all')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(400)
              .end(function(err, res) {
                if (err) { done(new Error(err)); }
                else { done(); }
              });
          });
        })

        // Demo API endpoint was a concept test for actual API endpoint
        /*
        describe('POST /analyse/demo', function() {

          const _demoCode='Imicrowavecereal',
            _file='./test/api/files/test.wav';

          it('should be able to send an audio file and get a classified emotion back', function(done) {
            request(server)
              .post('/analyse/demo')
              .field('demoCode', _demoCode)
              .attach('file', _file)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                if (err) { done(new Error(err)); }
                else { done(); }
              });
          });

          it('should give error if video file was sent', function(done) {
            request(server)
              .post('/analyse/demo')
              .field('demoCode', _demoCode)
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
              .post('/analyse/demo')
              .field('demoCode', _demoCode)
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
              .post('/analyse/demo')
              .field('demoCode', _demoCode)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(400)
              .end(function(err, res) {
                if (err) { done(new Error(err)); }
                else { done(); }
              });
          });

          it('should give error if invalid demoCode givne', function(done) {
            request(server)
              .post('/analyse/demo')
              .field('demoCode', 'invalid demoCode')
              .attach('file', _file)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(400)
              .end(function(err, res) {
                if (err) { done(new Error(err)); }
                else { done(); }
              });
          });

          it('should give error if no demoCode given', function() {
            request(server)
              .post('/analyse/demo')
              .attach('file', _file)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(400)
              .end(function(err, res) {
                if (err) { done(new Error(err)); }
                else { done(); }
              });
          });
        })
        */
    })
});