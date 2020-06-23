"use strict";

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
// middleware to show requests
const middleware = require("./middleware/debug-request-times");
router.use(middleware.showRequests);

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

router.get('/api/trails/:id?', async (req, res) => {
	let id = req.params.id;
	console.log(id);
	let idURL = `https://www.hikingproject.com/data/get-trails-by-id?ids=${id}&key=${hikingProjectKey}`;

	const data = await fetch(idURL);
	const trailData = await data.json();
	let trails = trailData.trails;
	let trail = trails[0];

	let name = JSON.stringify(trail.name);
	let location = JSON.stringify(trail.name);
	res.render('info', { 
		title : name, 
		trailLocation : location,
		trailName : name });
	//console.log(trail);
	// data: name, location, largeImg, length, rating
	/*
	res.json({
		name: trail.name,
		location: trail.location,
		image: trail.imgMedium,
		length: trail.length,
		rating: trail.stars
	});
	*/
});

// trails/city/state
router.get('/api/trails/:city?/:state?', async (req, res) => {

	// set vars
	let city = req.params.city,
		state = req.params.state,
		lat, lon,
		mapUrl = "https://nominatim.openstreetmap.org/search?city=" + city + "&state=" + state + "&format=json";

	// https://github.com/node-fetch/node-fetch
	const response = await fetch(mapUrl);
	const osm = await response.json();
	console.log(osm);
	// store lat / lon
	lat = osm[0].lat;
	lon = osm[0].lon;


	let trailsURL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&maxResults=20&key=${hikingProjectKey}`;

	const fetchy = await fetch(trailsURL);
	const list = await fetchy.json();
	const trails = list.trails;
	console.log(trails);

	
	let body = res.json({
		city: city, 
		state: state,
		lat: lat,
		lon: lon,
		trails: trails
	});
	
	
});



module.exports = router;
