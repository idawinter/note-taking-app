describe('App', function () {
  it('should load the homepage and return status 200', function (done) {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
