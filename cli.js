'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	// util = require('util'),
	async = require('async'),
	backupController,
	archiver = require('archiver'),
	mongoose,
	logger,
	// datafile,
	appSettings,
	filterRegexFunction = function(file){
	var returnValTest = file.match(/^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/node_modules\/(?:(?!(?:\/|^)\.).)*?)$).*$/) && file.match(/^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/content\/files\/backup\/(?:(?!(?:\/|^)\.).)*?)$).*$/);
	if(returnValTest){
		return true;
	}
	else{
		return false;
	}
},
	d = new Date(),
	defaultExportFileName = 'periodicbackup' + '-' + d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate() + '-' + d.getTime();

/**
 * cli backup controller
 * @module cliDBSeedController
 * @{@link https://github.com/typesettin/periodicjs.ext.backup}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:path
 * @requires module:fs-extra
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           backup cli
 *
 * /^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/node_modules\/(?:(?!(?:\/|^)\.).)*?)$).*$/
 */
var extscript = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	backupController = require('./controller/backup')(resources);
	// node index.js --cli --extension backup --task sampledata
	var cli = function (argv) {
		if (argv.task === 'backup') {
			var contentDir = path.resolve(process.cwd(),'content/'),
				publicDir = path.resolve(process.cwd(),'public/'),
				backupContentDir = path.resolve(process.cwd(),'content/files/backup/.tempbackup/',defaultExportFileName,'content'),
				backupPublicDir = path.resolve(process.cwd(),'content/files/backup/.tempbackup/',defaultExportFileName,'public');
			async.series({
				ensuredir:function(cb){
					fs.ensureDir(path.resolve(process.cwd(),'content/files/backup/.tempbackup'),cb);
				},
				copycontent:function(cb){
					fs.copy(contentDir,backupContentDir,filterRegexFunction,cb);
				},
				copypublicdir:function(cb){
					fs.copy(publicDir,backupPublicDir,filterRegexFunction,cb);
				}
			},function(err,results){
				console.log('err',err,'results',results);
				//https://github.com/ctalkington/node-archiver/blob/master/examples/pack-zip.js
				//
				//
				var output = fs.createWriteStream(path.join(process.cwd(),'content/files/backup/',defaultExportFileName+'.zip'));
				var archive = archiver('zip');

				output.on('close', function() {
				  console.log(archive.pointer() + ' total bytes');
				  console.log('archiver has been finalized and the output file descriptor has closed.');
				});

				archive.on('error', function(err) {
				  throw err;
				});

				archive.pipe(output);

				// var file1 = __dirname + '/fixtures/file1.txt';
				// var file2 = __dirname + '/fixtures/file2.txt';

				// archive
				//   .append(fs.createReadStream(file1), { name: 'file1.txt' })
				//   .append(fs.createReadStream(file2), { name: 'file2.txt' })
				//   .finalize();
				archive.bulk([
				  { src: [path.join(process.cwd(),'content/files/backup/.tempbackup/',defaultExportFileName)+'/**/*.*'], 
				  dest: path.resolve(process.cwd(),'content/files/backup/.tempbackup/',defaultExportFileName) }
				]).finalize();
				process.exit(0);
			});
		}
		else if (argv.task === 'restore') {
			console.log('Restore');
			// datafile = path.resolve(argv.file);

			// fs.readJson(datafile, function (err, backupjson) {
			// 	if (err) {
			// 		logger.error(err.stack.toString());
			// 		logger.error(err.toString());
			// 		process.exit(0);
			// 	}
			// 	else {
			// 		console.time('Importing Seed Data');
			// 		backupController.importSeed({
			// 			jsondata: backupjson,
			// 			insertsetting: 'upsert'
			// 		}, function (err, status) {
			// 			console.timeEnd('Importing Seed Data');
			// 			if (err) {
			// 				console.log(err);
			// 				logger.error(err.toString());
			// 			}
			// 			else {
			// 				console.info('Import status', util.inspect(status));
			// 			}
			// 			process.exit(0);
			// 		});
			// 	}
			// });
		}
		else {
			logger.silly('invalid backup task', argv);
			process.exit(0);
		}
	};

	return {
		cli: cli
	};
};

module.exports = extscript;
