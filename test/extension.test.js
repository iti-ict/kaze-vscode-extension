"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'assert' provides assertion methods from node
var assert = require("assert");
// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {
    // Defines a Mocha unit test
    test("Something 1", function () {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});
//# sourceMappingURL=extension.test.js.map