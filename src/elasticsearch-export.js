var fs = require('fs');
var getopt = require('node-getopt');
var logger = require(__dirname + '/../lib/logger');
var ELSCLIENT = require(__dirname + '/../lib/ElsClient').ElsClient;
var ELSQUERY = require(__dirname + '/../lib/ElsQuery').ElsQuery;

var opt = getopt.create([
    ['i', 'index=ARG', 'index to export (default to all)'],
    ['t', 'type=ARG', 'type to export'],
    ['q', 'query=ARG', 'export by a query'],
    ['o', 'output=ARG', 'name of file where the JSON will be extract'],
    ['s', 'size=ARG', 'get this number of entities'],
    ['f', 'from=ARG', 'get entities from this number'],
    ['P', 'port=ARG', 'port to connect to'],
    ['H', 'host=ARG', 'server to connect to'],
    ['h', 'help', 'display this help'],
    ['v', 'version', 'show version']
])
    .bindHelp()
    .parseSystem();

/*
** Recuperation Arguments
*/
var port = opt.options.port ? opt.options.port : 9200;
var host = opt.options.host ? opt.options.host : 'localhost';
var query = opt.options.query ? opt.options.query : {};
var index = opt.options.index ? opt.options.index : '_all';
var type = opt.options.type ? opt.options.type : index;
var output = opt.options.output ? opt.options.output : 'output';
var size = opt.options.size ? opt.options.size : 10;
var from = opt.options.from ? opt.options.from : 0;

/*
** Initialization elasticsearch client & query
*/
new ELSCLIENT(host, port, function(elsClient, msg) {
    if (!elsClient)
	throw('Couldn\'t connect to ELS');
    var scope = this;
    var elsQuery = undefined;
    new ELSQUERY(function(tmpQuery) {
	elsQuery = tmpQuery;
    });

    var options = {
	size: size,
	from: from
    };


    if (!opt.options.size) {
	elsQuery.generate(type, query, null, {term: true}, function(err, queryELS) {
	    if (err) {
		console.log(err);
	    } else {
		query = queryELS;
		elsClient.count(index, query, function(err, result) {
		    size = result.count;
		    options.size = size;
		    if (size > 0) {
			elsClient.search(index, query, options, function(err, res) {
			    logger.info('elasticsearch-exported=> '+ size + ' files exported on file ' + output);
			    fs.writeFileSync(output, JSON.stringify(res.hits.hits));
			    process.kill();
			});
		    } else {
			logger.info('elasticsearch-exported=> no file exported');
			process.kill();
		    }
		});
	    }
	});
    } else {
	elsClient.search(index, query, options, function(err, res) {
	    logger.info('elasticsearch-exported=> '+ size + ' files exported on file ' + output);
	    fs.writeFileSync(output, JSON.stringify(res.hits.hits));
	    process.kill();
	});
    }
});