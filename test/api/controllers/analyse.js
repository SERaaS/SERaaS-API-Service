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

          it('should be able to send an audio file and get the emotional statistics back', function(done) {
            done();
          });

          it('should give error if video file was sent', function(done) {
            done();
          });

          it('should give error if other file types were sent', function(done) {
            done();
          });

          it('should give error if no file given', function(done) {
            done();
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