"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var express_1 = __importDefault(require("express"));
//import uuid from 'uuid';
var Client = /** @class */ (function () {
    function Client(name, password) {
        this.name = name;
        this.password = password;
        this.token = '';
        this.signIn = false;
    }
    return Client;
}());
var Server = /** @class */ (function () {
    function Server() {
        var _this = this;
        this.clients = new Array();
        this.app = express_1.default();
        this.app.use(this.logMiddleware.bind(this));
        this.app.use(express_1.default.static(path.join(__dirname, '../../../Client/InsecureDeserialization/dist/InsecureDeserialization')));
        this.app.use(express_1.default.json());
        this.crypto = require('crypto');
        this.app.get("*", function (req, res) {
            res.sendFile(path.join(__dirname, "../../../Client/InsecureDeserialization/dist/InsecureDeserialization", "index.html"));
        });
        this.app.post('/signin', function (req, res) {
            var isValid = false;
            _this.clients.forEach(function (element) {
                if (element.name === req.body.username && element.password === _this.crypto.createHash("md5").update(req.body.password).digest('hex')) {
                    element.signIn = true;
                    //          element.token = uuid() as string;
                    res.status(200).json({ token: element.token });
                    console.log('Sign in ' + element.name);
                    isValid = true;
                }
            });
            if (isValid === false) {
                res.status(403).json({ reason: 'Wrong credentials.' });
            }
        });
        this.app.post('/register', function (req, res) {
            if (req.body.username.length > 0 &&
                req.body.password.length > 0) {
                var isInvalid_1 = true;
                _this.clients.forEach(function (element) {
                    if (element.name === req.body.username) {
                        isInvalid_1 = false;
                    }
                });
                if (isInvalid_1 === true) {
                    console.log('registered: ' + req.body.username);
                    var password = _this.crypto.createHash("md5");
                    password.update(req.body.password);
                    _this.clients.push(new Client(req.body.username, password.digest('hex')));
                    res.status(200).json({ reason: 'Registered' });
                }
                else {
                    res.status(403).json({ reason: 'Username is already taken, please take another.' });
                }
            }
            else {
                res.status(403).json({ reason: 'Wrong credentials.' });
            }
        });
        this.app.listen(4000, function () { return console.log('started at port 3000/'); });
    }
    Server.prototype.logMiddleware = function (req, res, next) {
        console.log('webserver: ' + req.url);
        next();
    };
    return Server;
}());
exports.Server = Server;
var server = new Server();
