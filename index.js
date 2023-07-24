require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
const  Url = require('./urlModel');   //  importing the model
// import { url } from 'inspector';

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

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


app.post('/api/shorturl', async (req, res) => {
  //  console.log(req.body.url);
  // getting the url through the form
  let input_url = req.body.url;

  // generating the unique number
  // let url_code = Math.floor(Math.random() * 100000);
  // console.log(url_code);

  // // Checking if the url is valid
  // if (!validUrl.isWebUri(input_url)) {
  //     res.status(401).json({
  //       error: 'invalid url'
  //     })
  //   } 
  const dnsLookUp = dns.lookup(urlparser.parse(input_url).hostname, async (error, address) => {
      if (!address) {
      console.log(error);
      res.status(401).json({
        error: 'invalid url'
      })
    } else {
      // checking if the url entered already exists in the database
      try {
        let find_url = await Url.findOne({
          originalUrl: input_url
        })
        console.log(find_url)
        // if found
        if (find_url) {
          res.json({
            originalUrl: find_url.originalUrl,
            shortenUrl: find_url.shortenUrl
          })
        } else {
          // if it doesnot exit then create it.
          const urlCount = await Url.countDocuments({})
          input_url = new Url({
            originalUrl: input_url,
            shortenUrl: urlCount
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
        res.status(500).json({
          error: "no such url!"
        });
      }
    }
  })
  })

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
      return res.status(404).json({
        error: "No short URL found for the given input"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Wrong format"
    });
  }
})

// app.post('/api/shorturl', async (req, res) => {

//   const input_url = req.body.url;
//   // Checking if the url is valid
//   const dnsLookUp = dns.lookup(urlparser.parse(input_url).hostname,options, async (error, address) => {
//     if (!address) {
//       console.log(error);
//       res.status(401).json({
//         error: 'invalid url'
//       })
//     } else {
//       // if the url is valid
//       const urlCount = await Url.countDocuments({})
//       const urlDoc = new Url({
//         originalUrl: req.body.url,
//         shortenUrl: urlCount
//       })
//     // Saving the url in the database
//       const result = await urlDoc.save()
//       console.log(result)
//       res.json({
//         original_url: urlDoc.originalUrl,
//         shorten_url: urlDoc.shortenUrl
//       })

//     }
//    }
//   )
// })

// // endpoint to load the url using the numner generated
// app.get('/api/shorturl/:short_url', async (req, res) => {
//     // getting the shorten code from the url and matching with db
//     const shortUrl = req.params.short_url;
//     const urlDoc = await Url.findOne({ short_url: +shortUrl })
//     res.redirect(urlDoc.originalUrl)

//   })

// Your first API endpoint
app.get('/api/shorturl', function(req, res) {
  res.json({ greeting: 'hello API' });
});


