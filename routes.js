"use strict";
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
// middleware to show requests
const middleware = require("./middleware/debug-request-times");
router.use(middleware.showRequests);
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL,
	ssl: {
	  rejectUnauthorized: false
	}
});
var pgp = require('pg-promise')();
const db = pgp({ connectionString: process.env.DATABASE_URL,
	ssl: {
	  rejectUnauthorized: false
	}
});

//const { Client } = require('pg');
//const client = new Client(connection);

let hikingProjectKey = "200729730-1bcb658fe842858c9a2e0e30d0409975";

// website root

router.get('/', function (req, res) {
	res.render("index", {
			title: 'OutdoorsNow'
    });
});

// api root
router.get('/api', async (req, res) => {
	res.json({
		message: "hello"
	});
});
// either make connection here or make it in app.js and share

router.get('/api/trails/:id?', async (req, res) => {
	req.is('text/html');
	req.accepts(['html', 'json']);
	let id = req.params.id;
	console.log(id[0]);
	console.log(id);
	if ( id[0] === "0") {
		const client = await pool.connect();
		console.log("connected");
		client.query("SELECT * FROM outdoors WHERE id = $1 LIMIT 1;", [id], function(err, result) {
            //often you wont want to close a client if there's a query error
            //but if you DO want to close the client you can truthy it to the done method...
            //done(true)  and it will dispose of it for you. Do NOT close it manually because you'll then
            //return a closed client to the pool, and the next person to check the client out will get a weird error
            if(err) {
                client.end();
                console.log(err.stack);
            }
            client.end();
			res.render('info', { 
		
			title : result.rows[0].trailname, 
			trailLocation : result.rows[0].traillocation,
			trailName : result.rows[0].trailname,
			trailSummary : result.rows[0].trailsummary,
			trailLength : result.rows[0].traillength,
			stars : result.rows[0].stars,
			trailID : result.rows[0].id
		
			});
        });
    
		/*
		const client = await pool.connect();
		console.log("connected");
		const result = await client.query({
		rowMode: 'array',
		text: 'SELECT * FROM outdoors WHERE id = ${id} LIMIT 1;',
		});
		res.render("info", {
			title : result.fields[0].trailname, 
			trailLocation : result.fields[0].traillocation,
			trailName : result.fields[0].trailname,
			trailSummary : result.fields[0].trailsummary,
			trailLength : result.fields[0].traillength,
			stars : result.fields[0].stars,
			trailID : result.fields[0].id
	
			});
		console.log(result.rows);
		await client.end();
		/*
		db.any(`SELECT * FROM outdoors WHERE id = ${id} LIMIT 1;`)
		.then(function (data) {
			res.status(200)
			.render("info", {
				title : data[0].trailname, 
				trailLocation : data[0].traillocation,
				trailName : data[0].trailname,
				trailSummary : data[0].trailsummary,
				trailLength : data[0].traillength,
				stars : data[0].stars,
				trailID : data[0].id
		
				});
			})
		.catch(function (err) {
			return err.stack;
		});
		*/

	}
	else {
		let idURL = `https://www.hikingproject.com/data/get-trails-by-id?ids=${id}&key=${hikingProjectKey}`;

		const data = await fetch(idURL);
		const trailData = await data.json();
		let trails = trailData.trails;
		let trail = trails[0];

		let name = JSON.stringify(trail.name).slice(1,-1);

		let location = JSON.stringify(trail.location).slice(1,-1);
		let summary = JSON.stringify(trail.summary).slice(1,-1);
		let pic = JSON.stringify(trail.imgSmallMed).slice(1,-1);
		let stars = JSON.stringify(trail.stars);
		let length = JSON.stringify(trail.length);

		let body = res.render("info", { 
			title : name, 
			trailLocation : location,
			trailName : name,
			trailSummary : summary,
			trailImage : pic,
			trailLength : length,
			stars : stars,
			trailID : id
			}
		);
	}
});

router.post('/api/trails/favorites', async (req, res) => {
	db.any('SELECT * FROM outdoors ORDER BY stars;')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL favorites'
        });
    })
    .catch(function (err) {
      return err.stack;
    });
	
});

router.post('/api/trails/favorites/:id?', async (req, res) => {
	let id = req.params.id;
	console.log(`Posted ${id} to server`);
	
	let idURL = `https://www.hikingproject.com/data/get-trails-by-id?ids=${id}&key=${hikingProjectKey}`;

	const data = await fetch(idURL);
	const trailData = await data.json();
	let trails = trailData.trails;
	let trail = trails[0];

	let name = JSON.stringify(trail.name).slice(1,-1);
	console.log(name);
	let location = JSON.stringify(trail.location).slice(1,-1);
	let summary = JSON.stringify(trail.summary).slice(1,-1);
	let pic = JSON.stringify(trail.imgSmallMed).slice(1,-1);
	let stars = JSON.stringify(trail.stars);
	let length = JSON.stringify(trail.length);
	let lat = JSON.stringify(trail.latitude);
	let lon = JSON.stringify(trail.longitude);
	let ID = JSON.stringify(id).slice(1,-1);
	let smallPic = JSON.stringify(trail.imgSmall).slice(1,-1);
	
	
	console.log(ID);

	const client = await pool.connect();
		console.log("connected");
	
				const text = "INSERT INTO outdoors(ID, trailName, trailLocation, trailSummary, trailLength, stars, trailImage, lat, lon, trailimagesml) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * ";
				const values = [`${ID}`, `${name}`, `${location}`, `${summary}`, `${length}`, `${stars}`, `${pic}`, `${lat}`, `${lon}`, `${smallPic}`];
				console.log(values);
				
			try {
				const res = await client.query(text, values);
				console.log(res.rows[0]);
				// { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
				client.release();
			}
			catch (err) {
				console.log(err.stack);
			}
		console.log(`favorited ${name}`);		

	/*	 
	CREATE TABLE outdoors (
		ID VARCHAR(100) PRIMARY KEY,
		trailName VARCHAR(100),
		trailLocation VARCHAR(100),
		trailSummary VARCHAR(100),
		trailLength VARCHAR(80),
		stars VARCHAR(80),
		trailImage VARCHAR(1000),
		lat VARCHAR(80),
		lon VARCHAR(80)
	  );

	
*/
});


router.get('/api/trails/:city?/:state?', async (req, res) => {

	// set vars
	let city = req.params.city,
		state = req.params.state,
		lat, lon, trails,
		mapUrl = "https://nominatim.openstreetmap.org/search?city=" + city + "&state=" + state + "&format=json";

	// https://github.com/node-fetch/node-fetch
	try {
		const response = await fetch(mapUrl);
		const osm = await response.json();
		console.log(osm);
		// store lat / lon
		if (osm[0] === undefined) {
			res.send(null);
			return;
		}

		lat = osm[0].lat;
		lon = osm[0].lon;


		let trailsURL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=30&maxResults=100&key=${hikingProjectKey}`;

		const fetchy = await fetch(trailsURL);
		const list = await fetchy.json();
		trails = list.trails;
		console.log(trails);
	}
	catch (err) {
		console.log(err.stack);
		res.send(null);
	}

	
	let body = res.json({
		city: city, 
		state: state,
		lat: lat,
		lon: lon,
		trails: trails
	});
	
	
});

router.get('/api/share', async (req, res) => {
	let title = "Share nature :)";
	let page = "Share a favorite (public) outdoor spot!";
	let nameForm = "Enter a name";
	let townForm = "Enter the town/city";
	let stateForm = "Enter the state";
	let summary = "A short summary";
	let length = "Length of the trail";
	let rating = "What would you rate it out of 5 stars?";
	

	res.render("share", {
			title : title,
			page : page,
			name : nameForm,
			town : townForm,
			state : stateForm,
			summary : summary,
			length : length,
			rating : rating
	});
});

router.post('/api/favorites/add', async (req, res) => {
	console.log("POST to server");
	let ID = req.body.id;
	let name = req.body.name;
	let location = req.body.location;
	let summary = req.body.summary;
	let length = req.body.length;
	let stars = req.body.rating;
	const client = await pool.connect();
		console.log("connected");
	
				const text = "INSERT INTO outdoors(ID, trailName, trailLocation, trailSummary, trailLength, stars) VALUES($1, $2, $3, $4, $5, $6) RETURNING * ";
				const values = [`${ID}`, `${name}`, `${location}`, `${summary}`, `${length}`, `${stars}`];
				console.log(values);
				
			try {
				const res = await client.query(text, values);
				console.log(res.rows[0]);
				console.log("ADDED");
				client.release();
			}
			catch (err) {
				console.log(err.stack);
			}
		console.log(`favorited ${name}`);

		res.send("success");
	
});
router.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });


module.exports = router;
