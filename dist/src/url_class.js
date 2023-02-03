"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runner = void 0;
const correctness_1 = require("./correctness");
class Runner {
    constructor(URL = "", repo = "", owner = "github") {
        this.url = URL;
        this.correctness = 0;
        this.bus_factor = 0;
        this.ramp_up = 0;
        this.issues = 0;
        this.responsiveness = 0;
        this.license = 0;
        this.score = 0;
        this.repo = repo;
        this.owner = owner;
    }
    calculate_correctness() {
        return __awaiter(this, void 0, void 0, function* () {
            this.correctness = 0;
            this.issues = yield (0, correctness_1.get_issues)(this.repo, this.owner);
            console.log(this.issues);
        });
    }
    calculate_bus() {
        this.bus_factor = 0;
    }
    calculate_ramp() {
        this.ramp_up = 0;
    }
    claculate_responsiveness() {
        this.responsiveness = 0;
    }
    calculate_score() {
        this.score = 0.35 * this.bus_factor + 0.25 * this.license + 0.2 * this.correctness + 0.1 * this.ramp_up + 0.1 * this.responsiveness;
    }
}
exports.Runner = Runner;
//# sourceMappingURL=url_class.js.map