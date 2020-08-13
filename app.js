const express = require("express");
const app = express();
const mysql = require("mysql");
const session = require("express-session");
const { request } = require("express");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "info",
});

app.get("/", (req, res) => {
  res.render("login.ejs", { error: null });
});

app.get("/index", (req, res) => {
  connection.query("SELECT * FROM mahasiswa", (error, results) => {
    res.render("index.ejs", { mahasiswa: results });
  });
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/create", (req, res) => {
  connection.query(
    "INSERT INTO mahasiswa SET ?",
    { nim: req.body.itemNim, nama: req.body.itemName },
    (error, results) => {
      res.redirect("/index");
    }
  );
});

app.post("/delete/:nim", (req, res) => {
  connection.query(
    "DELETE FROM mahasiswa WHERE nim = ?",
    [req.params.nim],
    (error, results) => {
      res.redirect("/index");
    }
  );
});

app.get("/edit/:nim", (req, res) => {
  connection.query(
    "SELECT * FROM mahasiswa WHERE nim= ?",
    [req.params.nim],
    (error, results) => {
      res.render("edit.ejs", { id: results[0] });
    }
  );
});

app.post("/update/:id", (req, res) => {
  let sql =
    "UPDATE mahasiswa SET nim='" +
    req.body.itemNim +
    "', nama='" +
    req.body.itemName +
    "' WHERE id_mahasiswa=" +
    req.body.itemId;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect("/index");
  });
});

app.post("/auth", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    connection.query(
      "SELECT * FROM user WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        console.log(results);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.user = results;
          response.redirect("/top");
        } else {
          //request.session.error = "user atau password salah"
          response.render("login.ejs", { error: "Gagal Login" });
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
    //request.session.error = "Please enter Username and Password!"
    //res.
  }
});

app.get("/top", (request, response) => {
  //console.log(request.session.user[0].username);
  request.session.user[0].type === 1

  if (request.session.loggedin) {
    request.session.user[0].type === 1
      ? response.render("top.ejs")
      : request.session.user[0].type === 2
      ? response.render("top.ejs")
      : request.session.user[0].type === 3
      ? response.render("top.ejs")
      : response.render("login.ejs");
    //response.render('top.ejs');
  } else {
    response.render("login.ejs");
  }
  response.end();
});

app.get("/login", (req, res) => {
  connection.query("SELECT * FROM admin", (error, results) => {
    res.render("login.ejs", { admin: results , error:null});
  });
});

app.get("/newlogin", (req, res) => {
  res.render("newlogin.ejs");
});

app.post("/createlogin", (req, res) => {
  connection.query(
    "INSERT INTO user SET ?",
    { user: req.body.itemUser, password: req.body.itemPassword, type: req.body.itemType},
    (error, results) => {
      res.redirect("/login");
    }
  );
});



app.get("/hasilkelas", (req, res) => {
  connection.query(
    "SELECT * FROM mahasiswa a JOIN id b ON a.id_mahasiswa=b.id_mahasiswa JOIN kelas c ON b.id_kelas=c.id_kelas",
    (error, results) => {
      res.render("hasilkelas.ejs", { hasilkelas: results });
    }
  );
});

app.get("/kelas", (request, res) => {
  request.session.user[0].type === 1 
  ?
  connection.query("SELECT * FROM kelas", (error, results) => {
    res.render("kelas.ejs", { kelas: results });
  })
  :
  res.render("notallowed.ejs")
});

app.get("/kelas_mahasiswa/:id_kelas", (req, res) => {
  connection.query(
    "SELECT * FROM mahasiswa a JOIN id b ON a.id_mahasiswa=b.id_mahasiswa JOIN kelas c ON b.id_kelas=c.id_kelas WHERE c.id_kelas= " +
      req.params.id_kelas,
    (error, results) => {
      //console.log(results[0].kelas)
      res.render("kelas_mahasiswa.ejs", {
        result: results,
        kelas: results[0].kelas,
      });
    }
  );
});

app.get("/newkelas", (req, res) => {
  res.render("newkelas.ejs");
});

app.post("/createkelas", (req, res) => {
  connection.query(
    "INSERT INTO kelas SET ?",
    { id_kelas: req.body.itemId, kelas: req.body.itemKelas },
    (error, results) => {
      res.redirect("/kelas");
    }
  );
});

app.post("/deletekelas/:id_kelas", (req, res) => {
  connection.query(
    "DELETE FROM kelas WHERE id_kelas = ?",
    [req.params.id_kelas],
    (error, results) => {
      res.redirect("/kelas");
    }
  );
});

app.listen(3000);
