require('logthis').config(
    { _on: true,
    'trello-ucm': 'debug' });

var log = require('logthis').logger._create('trello-ucm');
var util = require("util");
var moment = require('moment');
var fs = require('fs-extra');
var fileName = "../trello exports/test.json";
var listName = "Doing";
var idMichiel = "52c4c583101ead8a34004a4d";
  
var trello = require(fileName);
  
  
// console.log(util.inspect(trello.actions, { depth:10, colors: true}));
var listsById = {}; 
  
// console.log('Lists:\n',trello.lists); 
 
function getCards(idList) {
  return trello.cards.filter(function(c) {
    return c.idList === idList;
    }); 
 }; 
 
 function getActionsForCard(idMember, idCard, type) {
     return trello.actions.filter(function(a) {
         return a.idMemberCreator === idMember && 
	     a.type === type &&
             a.data &&
             a.data.card && 
	     a.data.card.id === idCard;
     });
 } 
 
 function getListIdFromName(listName) {
   var lists = trello.lists.filter(function(l) {
     return l.name === listName;
   });
   if (lists.length > 1) throw Error("Two lists with the same name!!!");
   if (!lists.length) throw Error("No list by this name: " + listName);
   if (lists[0].closed) throw Error("Found list with name " + listName + " but it is closed");
   return lists[0].id;
 }

function extractCards(idMember, listName) {
    var cards = getCards(getListIdFromName(listName));

    var cardsAndComments = [];
    cards.forEach(function(c) {
        var card = {
            name: c.name, desc: c.desc,
            comments: getActionsForCard(idMichiel, c.id, "commentCard")
                .map(function(comment) {
                    return { text: comment.data.text, date: comment.date };
                })
        };
        cardsAndComments.push(card);
    });
    return cardsAndComments;

}  

function createCsv(idMember, listName, filter, transform) {
    var cards = extractCards(idMichiel, listName);
    var jobs = [];
    cards.forEach(function(card) {
        var job = { name: card.name, desc: card.desc };
        var comments = card.comments.filter(filter);     
        jobs.push(transform(job, comments));
    });
    return jobs;
}


function filter(comment) {
    return comment.text.split('\n')[0].indexOf('TRACK') !== -1;
}

function extractNumber(s) {
    s = s.toLowerCase();
    var r = /^ *(?:minute[s]?|hour[s]?) *:? *(\d*) *$/;
    var result = s.match(r);
    if (result) return parseInt(result[1]);
    r = /^\D*(\d*) *(?:minute[s]?|hour[s]?).*$/;
    result = s.match(r);
    if (result) return parseInt(result[1]);
    else result = parseInt(s);
    if (result !== result) {
        throw Error('Can\'t parse number in line: \n' + s);
    }
    return result;
}

function extractDate(s) {
    s = s.toLowerCase();
    var r = /^ *(?:when|date) *:? *(.*) *$/;
    var result = s.match(r);
    var date = moment(new Date(result[1]));
    if (date.isValid()) return date.toString();
    throw Error('Can\'t parse date in line: ' + s);
}

var headerLine =  ["Job Title","Hourly Rate","Start Date","Due Date","Completed Date",
                   "Website Name","Customer Name","Type","Status","Staff Member","Tax Name",
                   "Tax Percent","Renewal Date"];

function transform(job, comments) {
    var minutes = 0, hours = 0, date;
    comments.forEach(function(comment) {
        var lines = comment.text.split('\n');
        date = moment(new Date(comment.date));
        if (date.isValid()) date = date.toString();
        lines.forEach(function(line) {
            if (line.toLowerCase().indexOf('minute') !== -1) {
                minutes += extractNumber(line);
            }
            else if (line.toLowerCase().indexOf('hour') !== -1) {
                hours += extractNumber(line);
            }
            else if (line.toLowerCase().indexOf('date') !== -1 ||
                     line.toLowerCase().indexOf('when') !== -1) {
                date = extractDate(line);
            }
        });
    });
    
    return { name: job.name, desc: job.desc, date: date, hours: hours, minutes: minutes};
}

var csv = createCsv(idMichiel, listName, filter, transform);
console.log('Cards and time spent on them for list ' + listName);
console.log(util.inspect(csv, { depth: 10, colors:true}));
// var res = extractDate("1/July/2014");
// console.log(res);

// console.log("Cards and their comments on list " + listName + "\n",
//             util.inspect(extractCards(idMichiel, listName), {depth:10, colors:true}));

// 
// console.log(csv);

// var day = moment(new Date("Sep-11"));
// log(day.isValid());
// log(day.toString());

// https://trello.com/1/connect?key=6f7371ce28909dfcd8a10aa250c1deef&name=axion5&response_type=token&expiration=never
// private token:
// 18e33068ce2dd3207686014fb099c329d3ecf8e1c293f0806de8f4a4807f2d3f
//trelloExportFileLocation, listName, idMember
// 6f7371ce28909dfcd8a10aa250c1deef


// var r = /^ *(?:when|date) *:? *(.*)$/;
// var s = "date: 1/July";
// var result = s.match(r);
// console.log(result);
