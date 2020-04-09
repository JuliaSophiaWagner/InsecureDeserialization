import * as path from "path";
import express from "express";
//import uuid from 'uuid';

class Client {
  public name: string;
  public password: string;
  public token: string;
  public signIn: boolean;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
    this.token = '';
    this.signIn = false;
  }
}

export class Server {
  private app: express.Express;
  private crypto: any; 
  private clients: Array<Client>;
  constructor() {
    this.clients = new Array<Client>();
    this.app = express();
    this.app.use(this.logMiddleware.bind(this));
    this.app.use(express.static(path.join(__dirname, '../../../Client/InsecureDeserialization/dist/InsecureDeserialization')));
    this.app.use(express.json());
    this.crypto = require('crypto');
    this.app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../../../Client/InsecureDeserialization/dist/InsecureDeserialization", "index.html"));
    });

    this.app.post('/signin', (req, res) => {
      let isValid = false;
      this.clients.forEach(element => {
        if (element.name === req.body.username && element.password === this.crypto.createHash("md5").update(req.body.password).digest('hex')) {
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

    
    this.app.post('/register', (req, res) => {
      if (req.body.username.length > 0 &&
        req.body.password.length > 0) {
            let isInvalid = true;
            this.clients.forEach(element => {
            if (element.name === req.body.username) {
              isInvalid = false;
            }
          });

          if (isInvalid === true) {
            console.log('registered: ' + req.body.username);
            let password = this.crypto.createHash("md5");
            password.update(req.body.password);
            this.clients.push(new Client(req.body.username, password.digest('hex')));
            res.status(200).json({ reason: 'Registered' });
          } else {
            res.status(403).json({ reason: 'Username is already taken, please take another.' });
          }
        
      } else {
        res.status(403).json({ reason: 'Wrong credentials.' });
      }
    });

    this.app.listen(3000, () => console.log('started at port 3000/'));
  }

  private logMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('webserver: ' + req.url);
    next();
  }
}

let server: Server = new Server();

