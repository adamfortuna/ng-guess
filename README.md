# angular-seed

This is a starter project for how I personally like to setup my Angular projects.

## Setup

Clone this repo and install dependencies.

```bash
npm install
bower install
```

Once that's done, you can start compiling JavaScript and Stylesheets.

```bash
gulp javascript:vendor javascript:templates javascript:application
gulp
```

In another terminal, you can start a server:

```
npm start
```

```
{
  "rules": {
    // public read access
    ".read": true,
    "users": {
      "$uid": {
        // write access only to your own data
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Now you can open up [http://localhost:8080](http://localhost:8080) and see if everything worked!
