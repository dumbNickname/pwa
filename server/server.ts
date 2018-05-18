import * as express from 'express';
import {readFileSync} from 'fs';
const fallback = require('express-history-api-fallback');

const app = express();

app.get('/api/book', (req, res) => {
    const books = readFileSync(__dirname + '/books.json', 'utf-8').toString();
    res.json(JSON.parse(books));
  }
);

const root = `${__dirname}/../dist`;
app.use(express.static(root));
app.use(fallback('index.html', {root}));

app.listen(9000, () => {
  console.log('Server listening on port 9000!');
});
