require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('node:dns');
const validUrl = require('valid-url');
// const urlparser = require('url');
const  Url = require('./models/urlModel');   //  importing the model


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

// // the post request
// app.post('/api/shorturl', async (req, res) => {
//   console.log(req.body.url);
//   const enter_url = req.body.url;
//   // Checking if the url is valid
//   try {
//     const urlObj = new URL(enter_url);
//     console.log(urlObj);
//     dns.lookup(urlObj.hostname, async (error, address, family) => {
//       console.log(address)
//       console.log(urlObj.protocol)
//       // if the domain name doesnot exist
//       if ( (!address) || (!validUrl.isWebUri(enter_url)) ) {
//         res.status(401).json({error: 'invalid url'});
//       } 
//       // if (urlObj.protocol != "http:" || urlObj.protocol != "https:") {
//       //   res.status(401).json({error: 'invalid url'});
//       // }
//       else {
//         // if we have a valid url  
//         // checking if the url entered already exists in the database

    
//           let find_url = await Url.findOne({ original_url: urlObj.href })
//             console.log(find_url);
//           // if found
//         if (find_url) {
//           res.json({ original_url: find_url.original_url, shorten_url: find_url.shorten_url })
//         } else {
//           // if it doesnot exit then create it.
//             const urlCount = await Url.countDocuments({})
//             const enter_url = new Url({ original_url: urlObj.href, shorten_url: urlCount })
           
//             // Saving the url in the database
//             await enter_url.save()
//             res.json({ original_url: enter_url.original_url, shorten_url: enter_url.shorten_url })
//         }
        
//       }
//     })
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "no such url!" });
//   }
// })

app.post('/api/shorturl', async (req, res) => {
  // try {}
   console.log(req.body.url);
  // getting the url through the form
  let input_url = req.body.url;

  // generating the unique number
  // let url_code = Math.floor(Math.random() * 100000);
  // console.log(url_code);

  // // Checking if the url is valid
  // if (!validUrl.isWebUri(enter_url)) {
  //     res.status(401).json({
  //       error: 'invalid url'
  //     })
  //   } 
  const urlObj = new URL(input_url);
      console.log(urlObj);
  const dnsLookUp = dns.lookup(urlObj.hostname, async (error, address, family) => {
      if ( (!address) || (!validUrl.isWebUri(input_url)) ) {
      console.log(error);
      res.status(401).json({
        error: 'invalid url'
      })
    } else {
      // checking if the url entered already exists in the database
      try {
        let find_url = await Url.findOne({ original_url: input_url })
        console.log(find_url)
        // if found
        if (find_url) {
          res.json({
            original_url: find_url.original_url,
            shorten_url: find_url.shorten_url
          })
        } else {
          // if it doesnot exit then create it.
          const urlCount = await Url.countDocuments({})
          enter_url = new Url({
            original_url: input_url,
            shorten_url: urlCount
          })
          // Saving the url in the database
          const result = enter_url.save()
          console.log(result)
          res.json({
            original_url: enter_url.original_url,
            shorten_url: enter_url.shorten_url
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
app.get('/api/shorturl/:shortUrl', async (req, res) => {
  try {
    // getting the shorten code from the url and matching with db
    const urlParams = await Url.findOne({
      shorten_url: req.params.shortUrl
    })
    if (urlParams) {
      return res.redirect(urlParams.original_url);
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

//   const enter_url = req.body.url;
//   // Checking if the url is valid
//   const dnsLookUp = dns.lookup(urlparser.parse(enter_url).hostname,options, async (error, address) => {
//     if (!address) {
//       console.log(error);
//       res.status(401).json({
//         error: 'invalid url'
//       })
//     } else {
//       // if the url is valid
//       const urlCount = await Url.countDocuments({})
//       const urlDoc = new Url({
//         original_url: req.body.url,
//         short_url: urlCount
//       })
//     // Saving the url in the database
//       const result = await urlDoc.save()
//       console.log(result)
//       res.json({
//         original_url: urlDoc.original_url,
//         shorten_url: urlDoc.short_url
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
//     res.redirect(urlDoc.original_url)

//   })

// Your first API endpoint
app.get('/api/shorturl', function(req, res) {
  res.json({ greeting: 'hello API' });
});


