'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	// util = require('util'),
	async = require('async'),
	backupController,
	mongoose,
	logger,
	// datafile,
	appSettings,
	d = new Date();

/**
 * cli backup controller
 * @module cliBackupController
 * @{@link https://github.com/typesettin/periodicjs.ext.backup}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:path
 * @requires module:fs-extra
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           backup cli
 */
var extscript = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	backupController = require('./controller/backup')(resources);
	// node index.js --cli --extension backup --task sampledata
	var cli = function (argv) {
		if (argv.task === 'backup') {
			console.time('Backing up periodic');
			backupController.exportBackup({
					filepath: argv.filepath,
					filename: argv.filename,
					outputpath: argv.outputpath
				},
				function (err, result) {
					console.timeEnd('Backing up periodic');
					if (err) {
						logger.error(err.stack.toString());
						logger.error(err.toString());
					}
					else {
						logger.info('backup result', result);
					}
					process.exit(0);
				});
		}
		else if (argv.task === 'restore') {
			console.log('Restore');
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
