require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
// const { nanoid } = require('nanoid');
// const shortID = require('shortid');
const validUrl = require('valid-url');
//importing the model
const  Url = require('./urlModel');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// database connection
const conn = "mongodb+srv://blog123:blog123@cluster0.x6chg7g.mongodb.net/urlShorter?retryWrites=true&w=majority";
mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  app.listen(port, function() {
  console.log(`Listening on port ${port} and db connected`);
});
})
.catch((err) => {
  console.log(err);
})



// getting the url link submitted through the form
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// app.post('/api/shorturl', (req, res) => {
//   // console.log(req.body.url)
//   const inputUrl = req.body.url;
 
//   let shortUrl = 1;
//   Url.findOne({})
//   .sort({shortenUrl: -1 })
//   .exec((err, results) => {
//     if (!err && results != undefined) {
//       shortUrl += results + 1
//     }
  
//     if (!err) {
//       Url.findOneAndUpdate(
//         {originalUrl: inputUrl},
//         {originalUrl: inputUrl, shortenUrl: shortUrl},
//         {new: true, upsert: true},
//         (err, savedUrl) => {
//           const  shorturl = savedUrl.shortenUrl;
//           res.json({original_url: inputUrl, short_url: shorturl});
//         }
//       )
//     }
//   })


  
// })
app.post('/api/shorturl', async (req, res) => {
//  console.log(req.body.url);

  // getting the url through the form
  let input_url = req.body.url;
  
  // generating the unique number
  let url_code = Math.floor(Math.random() * 100000);
  // console.log(url_code);

  // Checking if the url is valid
  if (!validUrl.isWebUri(input_url)) {
      res.status(401).json({
        error: 'invalid url'
      })
    } else {
      // checking if the url entered already exists in the database
      try {
        let find_url = await Url.findOne({
          originalUrl: input_url
        })
        // if found
        if (find_url) {
          res.json({
            originalUrl: input_url.originalUrl,
            shortenUrl: input_url.shortenUrl
          })
        } else {
          // if it doesnot exit then create it.
          input_url = new Url({
            originalUrl: input_url,
            shortenUrl: url_code
          })
          // Saving the url in the database
          await input_url.save()
          res.json({
            originalUrl: input_url.originalUrl,
            shortenUrl: input_url.shortenUrl
          })
        }       

      } catch (error) {
        console.log(error);
        res.status(500).send("Server error!");
      }
    }
  }
)

// endpoint to load the url using the numner generated
app.get('/api/shorturl/:shortenUrl', async (req, res) => {
  try {
    // getting the shorten code from the url and matching with db
    const urlParams = await Url.findOne({
      shortenUrl: req.params.shortenUrl
    })
    if (urlParams) {
      return res.redirect(urlParams.originalUrl);
    } else {
      return res.status(404).send("page not found!");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error!");
  }
})


// Your first API endpoint
app.get('/api/shorturl', function(req, res) {
  res.json({ greeting: 'hello API' });
});


