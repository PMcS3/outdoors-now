"use strict";
let mapBoxToken = "pk.eyJ1IjoicG1jczMiLCJhIjoiY2tibDAzaG1qMTRiOTJxbWwxbzM2YmZtMCJ9.ELKTHnbZqERM3UaoUZ29Pw";

const rootURL = "https://outdoorsnow.herokuapp.com";


$(document).ready( async function (e) {
    
    try {
        let url = `${rootURL}/api/trails/favorites`;

        return $.ajax({
            type: "POST", // method
            url: url,
            data: {}
        }).done(result => {
            // tests
            console.log(result);
            let results = result.data;
            console.log(results);
            let str = "";
            for (let i = 0; i < results.length; i++) {
                let id = results[i].id;
                if ( results[i].trailimagesml) {
                    str += `<li class="list-group-item">&nbsp;<img src="` + results[i].trailimagesml + `"> <br> <br> <strong>` + results[i].trailname + " </strong> <br> " + results[i].traillocation + `<a class="btn btn-sml btn-success float-right" href="/api/trails/${id}" role="button">More Info</a></li>`;
                }
                else {
                    str += `<li class="list-group-item">&nbsp; <br> <strong>` + results[i].trailname + " </strong> <br> " + results[i].traillocation + `<a class="btn btn-sml btn-success float-right" href="/api/trails/${id}" role="button">More Info</a></li>`;
                }
            }
            console.log(str);
            $("#favorites").html(str);

        }).fail(error => {
            console.error("FAIL", JSON.stringify(error));
        }).always((result) => {
            console.log("ALWAYS");
            /* console.log("ALWAYS", JSON.stringify(result)) */


        });
    } 
    catch (err) {
        console.error(err);
    }



});

$(".share").submit( function (e) {
        e.preventDefault();
        let name = $("#name").val();
        let location = $("#town").val() + ", " + $("#state1").val();
        let summary  = $("#summary").val();
        let length = $("#length").val();
        let rating = $("#rating").val();
         
        saveFavorite(name, location, summary, length, rating);
        console.log("saved");
        $(".done").removeClass("btn-success");
        $(".done").addClass("btn-warning");
        $(".done").text("Submitted");
        return false;
        
    }
);



$(".search").submit(
    // anonymous callback function is called
    function (e) {
        //get city coordinates from OSM
        //getCoords();
        //post city coordinates to the server
        //postCoords();
        // post state to the server
        //postState();
        // send call to getData() from server
        // get trail ID of favorited trail to save in "Favorited" database table
        //getID();
        getData();

        return false;
    }
);

$(".btn-small").click( function (e) {
    console.log("smt");
});

$(".fav").ready( function () 
{
    $(".fav").click( function (e) 
    {
        let id = $(this).attr('id');
        console.log(id);
        addFavorite(id);
        $(this).removeClass("btn-outline-success");
        $(this).addClass("btn-warning");
        $(this).text("☆ Favorited");

    });
});


$("#button").click(function () {
    $("form").hide();
    $("h3").hide();
    $("#mapid").show();
});

async function addFavorite(id) {
    try {

        let url = `${rootURL}/api/trails/favorites/` + id;
        console.log(url);
        return $.ajax({
            type: "POST", // method
            url: url, // path
            data: {}
        }).done(result => { 
            console.log("Favorited this trail");
            console.log(JSON.stringify(result));

        }).fail(error => {
            console.error("FAIL", JSON.stringify(error));
        }).always((result) => {
            
             console.log("ALWAYS", JSON.stringify(result));
        });
    } catch (err) {
        console.error(err);
    }

}


// async function to get data
async function getData() {
    try {
        let city = $("#city").val().toLowerCase();
        let state = $("#state").val().toLowerCase();

        if (city == "" || state == "") {
            return;
        }

        let url = `${rootURL}/api/trails/` + city + "/" + state;

        return $.ajax({
            type: "GET", // method
            url: url // path
        }).done(result => {
            if ( result === null || result.trails === undefined) {
                console.log("no data found");
                $(".center").html(`Shucks!  -  We don't have anything near ${city}, but there are plenty of other wide open spaces <a href="/"> to explore<a>`);
                return;
            }
            else {
            let lat = result.lat;
            let lon = result.lon;
            let trails = result.trails; // array of trail objects
            
            //$(".trails").html(JSON.stringify(result));
            let mymap = L.map('mapid').setView([`${lat}`, `${lon}`], 10);
            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: mapBoxToken
            }).addTo(mymap);

            function capitalize(string) {
                if (string.includes(' ') === false) {
                    return string[0].toUpperCase() +
                        string.slice(1);
                } else {
                    var splitStr = string.split(' ');
                    for (var i = 0; i < splitStr.length; i++) {
                        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                    }
                    return splitStr.join(' ');
                }
            }

            function createMarker(lat, lon, name, location) {
                return (
                    new L.marker([lat, lon]).bindPopup(`<b>${name}</b><br>${location}`).openPopup().addTo(mymap)
                );
            }

            let heading = "Outdoors near: " + capitalize(city) + ", " + capitalize(state);

            let str = "";
            for (let i = 0; i < trails.length; i++) {
                let id = trails[i].id;
                str += `<li class="list-group-item">&nbsp;<img src="` + trails[i].imgSqSmall + `">&nbsp;&nbsp;<strong>` + trails[i].name + " </strong> - " + trails[i].location + `<a class="btn btn btn-success float-right" href="/api/trails/${id}" role="button">More Info</a></li>`;
                createMarker(trails[i].latitude, trails[i].longitude, trails[i].name, trails[i].location);
            }
            $("#trails").html(str);
            $(".card-title").html(heading);

            }
        }).fail(error => {
            console.error("FAIL", JSON.stringify(error));
        }).always((result) => {
            console.log("ALWAYS");
            /* console.log("ALWAYS", JSON.stringify(result)) */


        });
    } catch (err) {
        console.error(err);
    }  
}


async function saveFavorite(name, location, summary, length, rating) {
    try {
        let id = "0" + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();


        let url = `${rootURL}/api/favorites/add`;
        return $.ajax({
            type: "POST", // method
            url: url, // path
            data: {
                "id" : id,
                "name" : name,
                "location" : location,
                "summary" : summary,
                "length" : length,
                "rating" : rating
            }
        }).done(result => { 
            
            console.log("ADDED");
            console.log(result);

        }).fail(error => {
            console.error("FAIL", JSON.stringify(error));
        }).always((result) => {
            
             console.log("ALWAYS", JSON.stringify(result));
        });
    } catch (err) {
        console.error(err);
    }
}
