var fns = require('../index.js');
var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});


describe('hello-npm-script', function() {
  describe('#add', function() {
  	it('should return NaN when param invalid', function() {
  	  assert.equal(fns.add('s', 1), 'NaN');
  	})
  	it('should return sum when param are numbers', function() {
  	  assert.equal(fns.add(2, 1), 3);
  	})
  });
  describe('#minus', function() {
    it('should return NaN when param invalid', function() {
      assert.equal(fns.minus('s', 1), 'NaN');
    })
    it('should return sum when param are numbers', function() {
      assert.equal(fns.minus(2, 1), 1);
    })
  });
});