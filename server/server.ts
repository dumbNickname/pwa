import * as express from 'express';
import {readFileSync} from 'fs';
import * as basicAuth from 'express-basic-auth';
import * as fallback from 'express-history-api-fallback';
import * as bodyParser from 'body-parser';
import * as webPush from 'web-push';

const app = express();

app.get('/api/book', (req, res) => {
    const books = readFileSync(__dirname + '/books.json', 'utf-8').toString();
    res.json(JSON.parse(books));
  }
);

const vapidKeys = {
  publicKey: 'BK8kQcsdYJxxwtx7Uc3uj5Nbu0-_9cTsaqNZy3ir8h5aq4tm8EwnPuxINuTnGCl146XGY9XVd_IunCkHslfOL_E',
  privateKey: '77neImcUY-JX9NbMeUiwg4HEsnd6JGxzoK8-bLvwXZI'
};

webPush.setVapidDetails(
  'https://github.com/devonfw-ng-adv-training',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const subscriptions = function () {
  const currentSubscriptions = [];

  return {
    add(subscription: any) {
      const index = currentSubscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
      if (index === -1) {
        currentSubscriptions.push(subscription);
      }
    },

    remove(endpoint: string) {
      const indexToDelete = currentSubscriptions.findIndex(sub => sub.endpoint === endpoint);
      if (indexToDelete > -1) {
        currentSubscriptions.splice(indexToDelete, 1);
      }
    },

    map(callbackfn) {
      return currentSubscriptions.map(callbackfn);
    }
  };
}();

app.use(bodyParser.json()); // to get JSON body of POST requests

app.post('/api/subscription', (req, res) => {
    subscriptions.add(req.body);
    res.sendStatus(200);
  }
);

app.delete('/api/subscription/:endpoint', (req, res) => {
    subscriptions.remove(req.params.endpoint);
    res.sendStatus(200);
  }
);

app.use('/api/message', basicAuth({users: {admin: 'secret'}}));

app.post('/api/message', (req, res) => {
    Promise.all(subscriptions.map(sub => webPush.sendNotification(
      sub, JSON.stringify({
        notification: {
          title: 'Hello PWA User!',
          body: 'This is a Push Notification!',
          icon: 'assets/manifest/android-chrome-192x192.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          }
        }
      }))))
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error('Error sending notification, reason: ', err);
        res.sendStatus(500);
      });
  }
);

const root = `${__dirname}/../dist`;
app.use(express.static(root));
app.use(fallback('index.html', {root}));

app.listen(9000, () => {
  console.log('Server listening on port 9000!');
});
