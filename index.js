'use strict';
var path = require('path');
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
	var backupRouter = periodic.express.Router(),
		backupController = require('./controller/backup')(periodic);

	for (var x in periodic.settings.extconf.extensions) {
		if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.admin') {
			backupRouter.post('/uploadbackup', backupController.import_upload);
			backupRouter.post('/downloadbackup', backupController.export_download);
			backupRouter.post('/custombackup', backupController.import_custombackup);
			backupRouter.get('/', backupController.index);
		}
	}

	periodic.app.use('/p-admin/backup', backupRouter);
};
