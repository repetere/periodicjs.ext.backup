'use strict';
// var path = require('path');
/**
 * An extension to import json backups into periodic mongodb.
 * @{@link https://github.com/typesettin/periodicjs.ext.backup}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @exports periodicjs.ext.backup
 * @param  {object} periodic variable injection of resources from current periodic instance
 */
module.exports = function (periodic) {
	// express,app,logger,config,db,mongoose
	periodic.app.controller.extension.backup = {
		exportbackup: require('./controller/exportbackup')(periodic),
		restorebackup: require('./controller/restorebackup')(periodic)
	};
	periodic.app.controller.extension.backup.backup = require('./controller/backup')(periodic);

	var backupRouter = periodic.express.Router(),
		backupController = periodic.app.controller.extension.backup.backup;

	for (var x in periodic.settings.extconf.extensions) {
		if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.asyncadmin') {
			backupRouter.post('/restorebackup', backupController.restore_backup);
			backupRouter.post('/downloadbackup', backupController.download_backup);
			backupRouter.get('/', backupController.index);
		}
	}

	periodic.app.use('/' + periodic.app.locals.adminPath + '/backup', backupRouter);
	return periodic;
};
