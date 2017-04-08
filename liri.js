var inquirer = require("inquirer");
var spotify = require('spotify');
var fs = require('fs'); 
var request = require('request');
var Twit = require('twit');
var keys = require('./keys');

// get the contents of the random.txt file and send the contents to be processed
function readFile()
{
	var fileName = "random.txt";
	fs.readFile(fileName, "utf8", function (error, fileData){
		if (error)
		{
			console.log("Error when reading File"+fileName);
		}
		else
		{
			var fileContent =  fileData.split(",");
			processChoice(fileContent[0], fileContent[1]);
		}
	});
	
}

// create the Twit object 
function getTwitterCreds()
{
	return  new Twit(keys.twitterKeys);
}


// process the "my-tweets" command
function myTweets(user)
{ var tweetCount=20;
	var twitter = getTwitterCreds();
	var tweetsBy = 'from:'+user;
	var search = { 
				q: tweetsBy,
				count: tweetCount		
	}
	
	function processData(err, data, response)
	{
		if(err)
		{
			console.log("Error Occured while processing Tweets");
		}
		else
		{
			for (i=0; i<data.statuses.length; i++)
			{
				console.log("Tweet: "+data.statuses[i].text);
				console.log("Tweeted on: "+data.statuses[i].created_at);
				console.log("--------------------------------------------------------------------");
			}
		}
	}
	
	twitter.get('search/tweets',
	             search,
							 processData); 
}

// Process the "spotify-this-song" command
function spotifyThisSong(song)
{
	var theSong = song;
	// default to the sign if no song is given
	if (theSong.trim().length < 1 || !theSong)
	{
		theSong = 'The Sign'
	}
	
	spotify.search({ type: 'track', query: theSong }, function(err, data) {
    if ( err ) 
		{
      console.log('Error occurred: ' + err);
      return;
    }
 
		// output to the console
		var songData = data;
		for (var i=0; i < songData.tracks.items.length; i++)
		{
			console.log('Song: ' +songData.tracks.items[i].name);
			console.log('Artist: '+ songData.tracks.items[i].artists[0].name);
			console.log('Album: '+songData.tracks.items[i].album.name);
			console.log('Preview: '+songData.tracks.items[i].preview_url);
			console.log('-------------------------------------------------------------------');
		}
	});
}

// process the "movie-this" command
function movieThis(movie)
{
	var theMovie ;
	if (movie.trim().length = 0 || !movie)
	{
		theMovie = 'http://www.omdbapi.com/?t=Dirty+Dozen';
	}
	else
	{
		// handle multi word titles
		theMovie = 'http://www.omdbapi.com/?t='+movie.split(' ').join('+');
	}
	
	request(theMovie, function (error, response, data) {
		if (error)
		{
			console.log("Error Occured while processing");
			return;
		}
		else
		{
			var body = JSON.parse(data) 
			
			console.log("Movie Title: "+body.Title);
			console.log("Release Year: "+body.Year);
			console.log("IMBD Rating: "+body.Rated);
			console.log("Produced In: "+body.Country);
			console.log("Language: "+body.Language);
			console.log("Plot: "+body.Plot);
			console.log("Actors: "+body.Actors);
			//console.log("Rotten Tomatoes Rating: "+body.body.Ratings.);
		}
	});
}

// print error if unexpected command is recieved
function unExpectedResponse(theResponse)
{
	console.log("unexpected option encountered")
}

// identify which command has been given and call the correct function
function processChoice(finalPickOption, finalPickEntry)
{
	switch(finalPickOption)
	{
		case "my-tweets":
			myTweets(finalPickEntry);
			break;
		case "spotify-this-song":
			spotifyThisSong(finalPickEntry);
			break;
		case "movie-this":
			movieThis(finalPickEntry);
			break;
		default:
			unExpectedResponse(finalPickOption, finalPickEntry)
	};	 
}

// recognise and process the command comming grom the file
function userChoice(pick)
{
	switch (pick.option)
	{
		case "do-what-it-says":
			readFile();
		break;
		default:
			processChoice(pick.option, pick.entry);
	}
	
}

// implement a multi choice command line option 		
function graphicalUI()
{
	inquirer.prompt([
		{type: "list",
		 message: "Pick one of the following options",
		 choices: ["my-tweets", "spotify-this-song","movie-this","do-what-it-says"],
		 name: "option"
		},
		{type: "item",
		 message: "Please enter the item associated with your choice",
		 name: "entry"
		}
	]).then(function(pick)
	{
		userChoice(pick);
	});
}

// initiate processing
(function ()
{
	// check for command line options being given and process if that is the case
	if (process.argv.length > 2)
	{
		var pick = {
			option: process.argv[2],
			entry: process.argv[3]
		}
		userChoice(pick);
	}
	else
	{
		graphicalUI();
	}
})();

