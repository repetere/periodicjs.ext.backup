'use strict';

var appSettings,
	backupController,
	mongoose,
	// datafile,
	// d = new Date(),
	// util = require('util'),
	// async = require('async'),
	// path = require('path'),
	// fs = require('fs-extra'),
	logger;

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

	resources.app.controller.extension.dbseed = {
		seed: require('../periodicjs.ext.dbseed/controller/dbseed')(resources)
	};
	resources.app.controller.extension.backup = {
		exportbackup: require('./controller/exportbackup')(resources),
		restorebackup: require('./controller/restorebackup')(resources)
	};
	resources.app.controller.extension.backup.backup = require('./controller/backup')(resources);
	backupController = resources.app.controller.extension.backup.backup;

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
			console.time('Restoring periodic');
			backupController.restoreBackup({
					file: argv.file,
					removebackup: argv.removebackup
				},
				function (err, result) {
					console.timeEnd('Restoring periodic');
					if (err) {
						logger.error(err.stack.toString());
						logger.error(err.toString());
					}
					else {
						logger.info('restore backup result', result);
					}
					process.exit(0);
				});
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
