/* jshint esversion: 6 */

/* Set environment variables */
require("dotenv").config();

/* Load keys */
var keys = require("./keys");

/* Load libraries */
const Twitter = require("twitter");
const client = new Twitter(keys.twitter);
const Spotify = require("node-spotify-api");
const spotify = new Spotify(keys.spotify);
const request = require("request");
const fs = require("fs");

/* Variables */
const randomLiriFile = "./random.txt";
const twitterUsername = "nikitas2191";

/* Retrieve input from user */
var cmdArgs = process.argv;

var liriCommand = cmdArgs[2];
var liriParameter = buildLiriParameter();

processLiriCommand(liriCommand, liriParameter);

/* Liri functions */
function processLiriCommand(theCommand, theParameter) {
    switch (theCommand) {
        case "my-tweets":
            myTweets();
            break;
        case "spotify-this-song":
            searchSong(theParameter);
            break;
        case "movie-this":
            searchMovie(theParameter);
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
        default:
            console.log("\nInvalid command!\nPlease enter one of the following commands:\n'my-tweets' (Twitter)\n'spotify-this-song' (Spotify)\n'movie-this' (OMDB Movies)\n'do-what-it-says' (Do What It Says)\n");
            break;
    }
}

function buildLiriParameter() {
    let result = "";
    for (let i = 3; i < cmdArgs.length; i++) {
        result += cmdArgs[i] + " ";
    }
    return result.trim();
}

function myTweets() {
    let params = {
        screen_name: twitterUsername,
        count: 20
    };

    client.get("statuses/user_timeline", params, function (error, tweets, response) {
        if (error)
            return console.log("Error occurred:", error);

        if (!error && response.statusCode == 200) {
            console.log("\n==================LAST " + params.count + " TWEETS==================\n");
            tweets.forEach(element => {
                console.log("------------------------------------------");
                console.log("Twitter SN:", element.user.screen_name);
                console.log("Tweet:", element.text);
                console.log("Created:", element.created_at);
                console.log("------------------------------------------");
            });
            console.log("\n==================================================\n");
        }
    });
}

function searchSong(songToSearch) {
    if (!songToSearch)
        songToSearch = "The Sign Ace of Base";

    let params = {
        type: "track",
        query: songToSearch,
        limit: 5
    };

    spotify.search(params, function (error, data) {
        if (error) {
            return console.log("Error occurred:", error);
        }

        console.log("\n==============SPOTIFY SEARCH RESULTS==============\n");
        console.log("Songs found " + data.tracks.total);
        console.log("Showing top 5 results\n\n");
        data.tracks.items.forEach(element => {
            console.log("------------------------------------------");
            console.log("Artist(s):", buildSpotifyArtistList(element.artists));
            console.log("Song:", element.name);
            console.log("Preview:", element.preview_url);
            console.log("Album:", element.album.name);
            console.log("------------------------------------------");
        });
        console.log("\n==================================================\n");
    });
}

function buildSpotifyArtistList(artistArray) {
    let result = "";
    for (let i = 0; i < artistArray.length; i++) {
        result += artistArray[i].name + ", ";
    }
    return result.slice(0, -2);
}

function searchMovie(movieToSearch) {
    if (!movieToSearch)
        movieToSearch = "Mr. Nobody";

    let queryUrl = encodeURI("http://www.omdbapi.com/?t=" + movieToSearch + "&plot=short&apikey=" + keys.omdb.apikey);
    console.log(queryUrl);

    request(queryUrl, function (error, response, body) {
        if (error)
            return console.log("Error occurred:", error);

        if (!error && response.statusCode === 200) {
            if (JSON.parse(body).Response == "True") {
                console.log("\n===================MOVIES FOUND===================\n");
                console.log("Title:", JSON.parse(body).Title);
                console.log("Year:", JSON.parse(body).Year);
                console.log("Rating:", JSON.parse(body).imdbRating);
                console.log("Rotten Tomatoes Rating:", JSON.parse(body).Ratings.find(x => x.Source == "Rotten Tomatoes").Value);
                console.log("Country Produced:", JSON.parse(body).Country);
                console.log("Language:", JSON.parse(body).Language);
                console.log("Plot:", JSON.parse(body).Plot);
                console.log("Actors:", JSON.parse(body).Actors);
                console.log("\n==================================================\n");
            }
            else {
                console.log("Movie not found!");
            }
        }
    });
}

function doWhatItSays() {
    fs.readFile(randomLiriFile, "utf8", function (error, data) {
        if (error)
            return console.log("Error occurred:", error);

        let dataArray = data.split(",");

        if (dataArray.length > 0) {
            let inputCommand = dataArray[0].trim();

            if (inputCommand == "do-what-it-says")
                return console.log("No infinite loops here!");

            let inputParameter = "";

            if (dataArray.length === 2)
                inputParameter = dataArray[1].replace("\"", "").trim();

            processLiriCommand(inputCommand, inputParameter);
        }
        else {
            console.log("\nInvalid command!\nPlease enter one of the following commands:\n'my-tweets' (Twitter)\n'spotify-this-song' (Spotify)\n'movie-this' (OMDB Movies)\n'do-what-it-says' (Do What It Says)\n");
        }
    });
}