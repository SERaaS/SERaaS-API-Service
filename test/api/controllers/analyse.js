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

        describe('POST /analyse/demo', function() {

          function testEmotionClassification(
            {_demoCode='Imicrowavecereal', _file='./test/api/files/test.wav', _errorCode=200} = {}
          ) {
            // console.log(_demoCode);
            // console.log(_file);
            // console.log(_errorCode);

            return request(server)
              .post('/analyse/demo')
              .attach('file', _file)
              .field('demoCode', _demoCode)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(_errorCode)
              .end(function(err, res) {
                console.log(err);
                console.log(res);
              })
          }

          it('should be able to send an audio file and get a classified emotion back', function(done) {
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

          it('should give error if invalid demoCode givne', function(done) {
            done();
          });

          it('should give error if no demoCode given', function(done) {
            done();
          });
        })
    })
});