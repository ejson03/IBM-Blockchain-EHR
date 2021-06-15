"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let Doctor = class Doctor {
    constructor(doctorId, licenseId, name, age, phNo) {
        this.doctorId = doctorId;
        this.licenseId = licenseId;
        this.name = name;
        this.age = age;
        this.phNo = phNo;
        this.type = "doctor";
        return this;
    }
};
__decorate([
    fabric_contract_api_1.Property(),
    __metadata("design:type", String)
], Doctor.prototype, "doctorId", void 0);
__decorate([
    fabric_contract_api_1.Property(),
    __metadata("design:type", String)
], Doctor.prototype, "licenseId", void 0);
__decorate([
    fabric_contract_api_1.Property(),
    __metadata("design:type", String)
], Doctor.prototype, "name", void 0);
__decorate([
    fabric_contract_api_1.Property(),
    __metadata("design:type", String)
], Doctor.prototype, "age", void 0);
__decorate([
    fabric_contract_api_1.Property(),
    __metadata("design:type", String)
], Doctor.prototype, "phNo", void 0);
__decorate([
    fabric_contract_api_1.Property(),
    __metadata("design:type", String)
], Doctor.prototype, "type", void 0);
Doctor = __decorate([
    fabric_contract_api_1.Object(),
    __metadata("design:paramtypes", [String, String, String, String, String])
], Doctor);
exports.Doctor = Doctor;
//# sourceMappingURL=Doctor.js.map