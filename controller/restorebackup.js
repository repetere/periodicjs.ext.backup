'use strict';

var async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger;

/**
 * imports backup data into the database
 * @param  {object} options - upsert,jsondata
 * @param  {object} restoreBackupCallback
 * @return {Function} async callback restoreBackupCallback(err,results);
 */
var restoreBackup = function (options, restoreBackupCallback) {
	insertsetting = options.insertsetting;

	resetSeedData();
	var backupjsondata = options.jsondata,
		statusResults = {},
		backupDataValidationError = isValidSeedJSONSync({
			jsondata: backupjsondata
		}),
		startSeed = function (startSeedCallback) {
			var dataForSetSeedObjectArrays = {
				documents: backupjsondata.data
			};
			startSeedCallback(null, dataForSetSeedObjectArrays);
		};

	if (backupDataValidationError) {
		restoreBackupCallback(backupDataValidationError, null);
	}
	else {
		statusResults.numberofdocuments = backupjsondata.data.length;
		async.waterfall([
				startSeed,
				setSeedObjectArrays,
				insertDataIntoDatabase
			],
			function (err, restorebackupresult) {
				restoreBackupCallback(null, restorebackupresult);
			});
	}
};

/**
 * restorebackup module
 * @module restorebackup
 * @{@link https://github.com/typesettin/periodicjs.ext.backup}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           backup
 */
var restoreBackupModule = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);

	return {
		restoreBackup: restoreBackup,
	};
};

module.exports = restoreBackupModule;
