#!/usr/bin/env node
var fs = require('fs');
var getopt = require('node-getopt');
var logger = require(__dirname + '/../lib/logger');
var elsClient = require('elasticsearch-client');
var elsQuery = require('elasticsearch-query');

var opt = getopt.create([
    ['i', 'index=ARG', 'index to export (default to all)'],
    ['t', 'type=ARG', 'type to export'],
    ['q', 'query=ARG', 'export by a query'],
    ['e', 'elsQuery=ARG', 'export by a elasticsearch query'],
    ['o', 'output=ARG', 'name of file where the JSON will be extract'],
    ['s', 'size=ARG', 'get this number of entities'],
    ['f', 'from=ARG', 'get entities from this number'],
    ['', 'jsonELS', 'get the json with the _source'],
    ['P', 'port=ARG', 'port to connect to (default to 9200)'],
    ['H', 'host=ARG', 'server to connect to (default to localhost)'],
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
var output = opt.options.output ? opt.options.output : 'output.json';
var size = opt.options.size ? opt.options.size : 'all';
var from = opt.options.from ? opt.options.from : 0;
var jsonELS = opt.options.jsonELS ? opt.options.jsonELS : null;
var manualQueryELS = opt.options.elsQuery ? opt.options.elsQuery : null;

/*
** Initialization elasticsearch client & query
*/
function writeData(res, callback) {
	console.log('res', res);
	if (res && res.hits && res.hits.total > 0) {
	    if (!jsonELS) {
			fs.writeFileSync(output, JSON.stringify(res.hits.hits));
			callback(null);
	    } else {
			var datas = [];
			for (iterator in res.hits.hits) {
			    res.hits.hits[iterator]._source._id = res.hits.hits[iterator]._id;
			    datas.push(res.hits.hits[iterator]._source);
			}
			fs.writeFileSync(output, JSON.stringify(datas));
			callback(null);
	    }
	} else {
		callback(null);
	}
}

new elsClient(host, port, function(client, msg) {
    if (!client)
		throw ('Couldn\'t connect to ELS');
    var scope = this;
    var elsQueryGenerator = undefined;
    new elsQuery(function(tmpQuery) {
		elsQueryGenerator = tmpQuery;
    });

    var options = {
		size: size,
		from: from
    };

    if (!opt.options.size) {
		elsQueryGenerator.generate(type, query, null, {term: true}, function(err, queryELS) {
		    if (err) {
				console.log(err);
		    } else {
			    if (manualQueryELS) {
			    	try {
			    		console.log('manualQueryELS', manualQueryELS);
						query = JSON.parse(manualQueryELS);
					} catch (e) {
						console.log(e);
						query = {};
					}
				} else {
					query = queryELS;
				}
				console.log('query', JSON.stringify(query));
				client.count(index, query, options, function(err, result) {
					console.log('count', result);
					if (size === 'all') {
					    size = result.count;
					    options.size = size;
					}
				    if (size > 0 && result.count > 0) {
	    			    logger.info('elasticsearch-exported => ' + size + ' files exported on file ' + output);
						client.search(index, query, options, function(err, res) {
						    writeData(res, function(err) {
							if (err)
							    console.log(err);
								process.kill(process.pid);				
						    });

						});
				    } else {
						logger.info('elasticsearch-exported => no file exported');
						process.kill(process.pid);
				    }
				});
		    }
		});
    } else {
		client.search(index, query, options, function(err, res) {
		    logger.info('elasticsearch-exported => '+ size + ' files exported on file ' + output);
		    fs.writeFileSync(output, JSON.stringify(res.hits.hits));
		    process.kill(process.pid);
		});
    }
});