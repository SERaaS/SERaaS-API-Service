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
    })
});