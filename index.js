var express = require("express");
const app = express();
const PORT = 3000;

var compression = require("compression");
var request = require("request");
var bodyParser = require("body-parser"); //to get the object from the url
var firebase = require("firebase");
var nodemailer = require("nodemailer");
const algoliasearch = require("algoliasearch");
const dotenv = require("dotenv");
dotenv.config();

var config = {
  apiKey: "AIzaSyA77CMnccmWSuX-cgzFkT8RjPRQbeJJ25k",
  //authDomain: "auth.booksnation.ca",
  authDomain: "bookstore2july24.firebaseapp.com",
  databaseURL: "https://bookstore2july24.firebaseio.com",
  projectId: "bookstore2july24",
  storageBucket: "bookstore2july24.appspot.com",
  messagingSenderId: "581038020415"
};

firebase.initializeApp(config);

var submittedBookss_ref = firebase.database().ref("submittedBookss");

var alertRef = firebase.database().ref("alerts");

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(compression());
app.use(bodyParser.json());
app.disable("etag");

var cors = require("cors");
app.use(cors());

const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);
//
const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);
// var index2 = algolia.initIndex(process.env.algli_2);

// main search bar algolia
app.post("/search", (req, res) => {

  console.log('main search bar algolia')
  let search = req.body.searchString;
  // let indexName_ = req.body.indexName;
  let indexName_ = "submittedBooks"
  var array = [];
  var obj = {};

  var index2 = algolia.initIndex(indexName_);

  // index2.search("ankesh").then()

  index
    .search(search)
    .then(({ hits }) => {

      hits.forEach(temp => {

        obj = {
          title: temp.title,
          condition: temp.condition,
          course: temp.course,
          department: temp.department,
          description: temp.description,
          isbn: temp.isbn,
          numberOfCopies: temp.numberOfCopies,
          price: temp.price,
          authors: temp.authors,
          image: temp.image,
          timeStamp: temp.timeStamp,
          postedDate: temp.postedDate,
          childValue: temp.childValue,
          uid: temp.uid,
          seller_emaiL: temp.seller_emaiL,
          seller_username: temp.seller_username,
          phoneNumber: temp.phoneNumber,
          collegeName_: temp.collegeName
        };

        // console.log(obj)

        array.push(obj);


      })
      // console.log(array)
      res.json(array);



    })


  // index2.search(search, function (err, content) {
  //   content.hits.forEach(temp => {
  //     obj = {
  //       title: temp.title,
  //       condition: temp.condition,
  //       course: temp.course,
  //       department: temp.department,
  //       description: temp.description,
  //       isbn: temp.isbn,
  //       numberOfCopies: temp.numberOfCopies,
  //       price: temp.price,
  //       authors: temp.authors,
  //       image: temp.image,
  //       timeStamp: temp.timeStamp,
  //       postedDate: temp.postedDate,
  //       childValue: temp.childValue,
  //       uid: temp.uid,
  //       seller_emaiL: temp.seller_emaiL,
  //       seller_username: temp.seller_username,
  //       phoneNumber: temp.phoneNumber
  //     };
  //     console.log(obj)
  //     array.push(obj);
  //   });
  //   obj.length = array.length;
  //   res.json(array);
  // });


});

app.post("/showingAllAvailable", (req, res) => {
  // console.log('showing all available .... ')





  var array = [];
  var obj = {};


  index
    .search()
    .then(({ hits }) => {

      hits.forEach(temp => {

        obj = {
          title: temp.title,
          condition: temp.condition,
          course: temp.course,
          department: temp.department,
          description: temp.description,
          isbn: temp.isbn,
          numberOfCopies: temp.numberOfCopies,
          price: temp.price,
          authors: temp.authors,
          image: temp.image,
          timeStamp: temp.timeStamp,
          postedDate: temp.postedDate,
          childValue: temp.childValue,
          uid: temp.uid,
          seller_emaiL: temp.seller_emaiL,
          seller_username: temp.seller_username,
          phoneNumber: temp.phoneNumber,
          collegeName_: temp.collegeName

        };

        // console.log(obj)

        array.push(obj);


      })
      // console.log(array)
      res.json(array);



    })
    .catch(err => {
      console.log(err);
    });





  // var array = [];
  // var obj = {};


  // index.search( function(err, content) {
  //     console.log(content)
  //   content.hits.forEach(temp => {

  //     obj = {
  //       title: temp.title,
  //       condition: temp.condition,
  //       course: temp.course,
  //       department: temp.department,
  //       description: temp.description,
  //       isbn: temp.isbn,
  //       numberOfCopies: temp.numberOfCopies,
  //       price: temp.price,
  //       authors: temp.authors,
  //       image: temp.image,
  //       timeStamp: temp.timeStamp,
  //       postedDate: temp.postedDate,
  //       childValue: temp.childValue,
  //       uid: temp.uid,
  //       seller_emaiL: temp.seller_emaiL,
  //       seller_username: temp.seller_username,
  //       phoneNumber: temp.phoneNumber
  //     };
  //   });

  //   console.log(array);
  //   obj.length = array.length;
  //   res.json(array);
  //   // res.json("fuck")
  // });
});

const path = require('path');
app.use(express.static(path.join(__dirname, './dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist', '/index.html'));
});

app.get('/*', function (req, res, next) {
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  next();
});

//direct all url to the angular.
app.get("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

//google search..
app.post("/mannualBookSearch_loginPanel", (req, res) => {
  let isbn = req.body.searchstring;
  isbn = isbn.split(" ").join("+");
  request(`https://www.googleapis.com/books/v1/volumes?q="` + isbn, function (
    error,
    response,
    body
  ) {
    try {
      var json = JSON.parse(body);

      if (json.totalItems == 0) {
        res.json("BOOK_NA");
      } else {
        res.json([json]);
      }
    } catch (error) {
      res.json("BOOK_NA");
    }
  });
});

//will use later
app.post("/userDetail", (req, res) => {
  let uid = req.body.uid;
  var obj = [];
  // console.log(uid)
  var userRef = firebase.database().ref("users");
  var db = userRef.equalTo(uid).orderByChild("userid");
  db.once("value").then(snapshot => {
    snapshot.forEach(e => {
      obj = e.val();
    });
    // console.log(obj)
    res.json(obj);
  });
});

//posting books...
app.post("/postBook", (req, res) => {
  let data = req.body;
  submittedBookss_ref.push(data).then(snap => {
    submittedBookss_ref.child(snap.key).update({
      childValue: snap.key
    });
  });
  //sending alert if it matches the data in the submitted books....
  alertRef.once("value").then(snapshot => {
    snapshot.forEach(e => {
      if (
        (e.val().course === data.course &&
          e.val().department === data.department) ||
        e.val().title === data.title
      ) {
        sendingAlertEmail(e.val());
      }
    });
  });
});

//fuction to send email
function sendingAlertEmail(obj) {
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: "possiblecreations.ankesh@gmail.com",
      pass: "great@creations22"
    }
  });
  var mailList = [obj.email];
  var mailOptions = {
    from: "possiblecreations.ankesh@gmail.com",
    to: mailList,
    subject: obj.title + " Is available - booksnation.ca",
    html:
      `        
                <html>
          <head/>
          <body>
            <div style="background-color:#e9ecef" style="width:100%">
          <div style="width: 80%; margin:10%; text-align: center !important;display: block; border-radius: 0.3rem">
                <div  style="margin-top: -20px;display: block;margin-bottom: 2rem;background-color: #e9ecef;border-radius: 0.3rem">
                    <img  src="cid:logopicture" height="200" width="200" style="text-align: center !important;max-width: 100%;height: auto;vertical-align: middle;border-style: none"/>
                    <div style="background-color: white;padding: 45px 60px 60px 60px;display: block">
                        <p style="font-size: 1.3em">Thank you! </p>
                        <br>
                        Your book  ` +
      obj.title +
      `<br> Department: ` +
      obj.department +
      `<br> CourseNumber: ` +
      obj.course +
      `
                        is Available <br>
                        <br>
                    Go to the website booksnation.ca to get your book..
                    </div>
        
                    <br/>
                </div>
               </div>
           </div>
        </body>
        </html>`,
    attachments: [
      {
        filename: "booksnation_logo.png",
        path: "booksnation_logo.png",
        cid: "logopicture"
      }
    ]
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // return console.log(error);
    }
    // console.log('Message %s sent: %s', info.messageId, info.response);
    // res.sendStatus(200);
  });
}

//creating alert from front end...and sending email.
app.post("/alert", (req, res) => {
  var data = req.body;
  var temp_child;
  try {
    temp_child = data.title.replace(/\./g, ""); //removing dots' if there is any.
    temp_child = data.title.replace(/[, ]+/g, ""); //removing [] brackets
    temp_child = data.title.replace(/\./g, ""); //removing dots again, because the first time it didn't remove all dots even after using /g.

    alertRef.push(data);
    // alertRef.child(data.uid + temp_child + data.department+data.course).set(data);
    // sendingAlertEmail_notification(data);

    res.json("success");
  } catch (error) {
    res.json("error" + error);
  }

  // alertRef.set(data);
});

//saving user info
//will use later
app.post("/savingUserInfo", (req, res) => {
  let data = req.body;
  let uid = data.userid;
  var userRef = firebase.database().ref("users");
  userRef.once("value").then(snapshot => {
    if (!snapshot.hasChild(uid)) {
      try {
        userRef.child(uid).set(data);
      } catch (error) {
        res.json("Error");
      }
      res.json(" new data , pushing data to the database");
    } else {
      res.json("data already exist.");
    }
  });
});

//removing the post...
app.post("/remove", (req, res) => {
  let node = req.body.val;
  submittedBookss_ref
    .child(node)
    .remove()
    .then(function () {
      res.json(node + " removed");
    })
    .catch(function (error) {
      res.json(error);
    });
});

//sending departments for the posting with details method front end.
app.post(`/departmentsAbr`, (req, res) => {
  res.send(abbrevArr_department);
});

var abbrevArr_department = [];
var getAllAbbreviations = new Promise((resolve, reject) => {
  var temp = firebase
    .database()
    .ref("departments")
    .orderByChild("abrev");
  temp.on("child_added", function (snap) {
    var course_number = snap.val().coursenumber;
    if (
      abbrevArr_department[abbrevArr_department.length - 1] != snap.val().abrev
    ) {
      abbrevArr_department.push(snap.val().abrev);
    }
  });
});


/////



///get all collleges

var collegeArray = [];
var getCollegeArray = new Promise((resolve, reject) => {
  collegeArray = [];
  var obj = {};
  var array = [];
  var userRef = firebase.database().ref("allColleges");

  userRef.on("value", function (snap) {
    snap.forEach(temp => {
      obj = {
        collegeName: temp.key,
        collegeCourse: temp.val()
      }
      collegeArray.push(obj)
    })

  })

})

app.post("/getCollege", (req, res) => {

  res.json(collegeArray)

});

//////

//get posted books
app.post("/submittedBooksData", (req, res) => {
  console.log('function submittedbooks data getting called')
  let uid = req.body.uid;
  var obj = [];

  index.search(uid).then(({ hits }) => {
    hits.forEach(temp => {
      obj.push(temp)
    })
    res.json(obj)
  })

  // index
  // .search(search)
  // .then(({ hits }) => {

  //   hits.forEach(temp => {



  // index.search(uid, function (err, content) {
  //   content.hits.forEach(temp => {
  //     obj.push(temp);
  //     console.log(obj)
  //     // res.json(obj);
  //   });
  //   res.json(obj);
  // });

  // database.ref('submittedBookss').equalTo(uid).orderByChild('uid').once('value', contacts => {
  //     // Build an array of all records to push to Algolia
  //     const records = [];
  //     contacts.forEach(contact => {

  //         const childKey = contact.key;
  //         const childData = contact.val();

  //         childData.objectID = childKey;
  //             records.push(childData);

  //     });

  //     // Add or update new objects
  //     index2
  //         .saveObjects(records)
  //         .then(() => {
  //             // console.log('Contacts imported into Algolia');
  //         })
  //         .catch(error => {
  //             console.error('Error when importing contact into Algolia', error);
  //             process.exit(1);
  //         });
  // });

  // if (uid === "mannual") {
  //     obj = [];
  //     submittedBookss_ref.once('value').then(snapshot => {
  //         snapshot.forEach(e => {
  //             obj.push(e.val());
  //         });
  //         res.json(obj);
  //     });
  // } else {
  //     obj = [];
  //     var db = submittedBookss_ref.equalTo(uid).orderByChild("uid");
  //     db.once('value').then(snapshot => {
  //         snapshot.forEach(e => {
  //             obj.push(e.val());
  //         });
  //         res.json(obj);
  //         index2
  //             .saveObjects(obj)
  //             .then(() => {
  //                 console.log('user data updated')
  //             })
  //             .catch(error => {
  //                 console.error('Error when importing contact into Algolia', error);
  //                 process.exit(1);
  //             });
  //    });
  // }
});

app.listen(3000, "0.0.0.0", function () {
  console.log("Listening to port:  " + 3000);
});

// var config = {
//   apiKey: "AIzaSyBOAeC0mMPDdv6b-0Fl_3fyd2xEXMZjQZU",
//   authDomain: "march-23-49e4f.firebaseapp.com",
//   databaseURL: "https://march-23-49e4f.firebaseio.com",
//   projectId: "march-23-49e4f",
//   storageBucket: "march-23-49e4f.appspot.com",
//   messagingSenderId: "916344382767"
// };

dotenv.config();
const database = firebase.database();

const contactsRef = database.ref("submittedBookss");
contactsRef.on("child_added", addOrUpdateIndexRecord);
contactsRef.on("child_changed", addOrUpdateIndexRecord);
contactsRef.on("child_removed", deleteIndexRecord);

// Get all contacts from Firebase
database.ref("submittedBookss").once("value", contacts => {
  // Build an array of all records to push to Algolia
  const records = [];
  contacts.forEach(contact => {
    // get the key and data from the snapshot
    const childKey = contact.key;
    const childData = contact.val();
    // We set the Algolia objectID as the Firebase .key
    childData.objectID = childKey;
    // Add object for indexing
    records.push(childData);
  });

  // Add or update new objects
  index
    .saveObjects(records)
    .then(() => {
      // console.log('Contacts imported into Algolia');
    })
    .catch(error => {
      console.error("Error when importing contact into Algolia", error);
      process.exit(1);
    });
});

function addOrUpdateIndexRecord(contact) {
  // Get Firebase object
  const record = contact.val();
  // Specify Algolia's objectID using the Firebase object key
  record.objectID = contact.key;
  // Add or update object
  index
    .saveObject(record)
    .then(() => {
      // console.log('Firebase object indexed in Algolia', record.objectID);
    })
    .catch(error => {
      console.error("Error when indexing contact into Algolia", error);
      process.exit(1);
    });
}

function deleteIndexRecord(contact) {
  // Get Algolia's objectID from the Firebase object key
  const objectID = contact.key;
  // Remove the object from Algolia
  index
    .deleteObject(objectID)
    .then(() => {
      // console.log('Firebase object deleted from Algolia', objectID);
    })
    .catch(error => {
      console.error("Error when deleting contact from Algolia", error);
      process.exit(1);
    });
}
