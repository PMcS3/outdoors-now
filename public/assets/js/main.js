"use strict";
let mapBoxToken = "pk.eyJ1IjoicG1jczMiLCJhIjoiY2tibDAzaG1qMTRiOTJxbWwxbzM2YmZtMCJ9.ELKTHnbZqERM3UaoUZ29Pw";

$("form").submit(
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

$(document).on("click", ".info", function (e) {
    let thisID = jQuery(this).attr("id");

    getInfo(thisID);

    return false;
});

$("#button").click(function () {
    $("form").hide();
});

async function getInfo(id) {
    try {

        let url = "http://localhost:3000/api/trails/" + id;

        return $.ajax({
            type: "GET", // method
            url: url // path
        }).done(result => {
            //use JSON data as HTML text
            //console.log(JSON.stringify(result));
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

// async function to get data
async function getData() {
    try {
        let city = $("#city").val().toLowerCase();
        let state = $("#state").val().toLowerCase();
        if (city == "" || state == "") {
            return;
        }

        let url = "http://localhost:3000/api/trails/" + city + "/" + state;

        return $.ajax({
            type: "GET", // method
            url: url // path
        }).done(result => {
            // tests
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
                str += `<li class="list-group-item">&nbsp;<img src="` + trails[i].imgSqSmall + `">&nbsp;&nbsp;<strong>` + trails[i].name + " </strong> - " + trails[i].location + `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="info btn btn-success" id=${trails[i].id} type="button"> More Info </button> </li>`;
                createMarker(trails[i].latitude, trails[i].longitude, trails[i].name, trails[i].location);
            }
            $("#trails").html(str);
            $(".card-title").html(heading);


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