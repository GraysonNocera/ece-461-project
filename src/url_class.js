"use strict";
exports.__esModule = true;
exports.url_class = void 0;
var using_apis_1 = require("./using_apis");
var url_class = /** @class */ (function () {
    function url_class(URL, repo, owner) {
        if (URL === void 0) { URL = ""; }
        if (repo === void 0) { repo = ""; }
        if (owner === void 0) { owner = "github"; }
        this.url = URL;
        this.correctness = 0;
        this.bus_factror = 0;
        this.ramp_up = 0;
        this.responsiveness = 0;
        this.license = 0;
        this.score = 0;
        this.repo = repo;
        this.owner = owner;
    }
    //What do we need to call from here?  but possibly interact with whatever API's we need 
    url_class.prototype.calculate_correctness = function () {
        this.correctness = 0;
        (0, using_apis_1.myFunc)(this.repo, this.owner);
    };
    //API?
    url_class.prototype.calculate_bus = function () {
        this.bus_factror = 0;
    };
    //API?
    url_class.prototype.calculate_ramp = function () {
        this.ramp_up = 0;
    };
    //API? 
    url_class.prototype.claculate_responsiveness = function () {
        this.responsiveness = 0;
    };
    //API?
    url_class.prototype.calculate_score = function () {
        //whatever we need to do to calculate formula 
    };
    return url_class;
}());
exports.url_class = url_class;
