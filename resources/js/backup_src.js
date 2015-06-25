'use strict';

var downloadbutton,
	existingbackuplist,
	importFormContainer,
	importBackupSelectionEl,
	backuppathInput,
	backupassetid,
	backuppathDisplayInput,
	previousbackupInput;

var downloadbuttonClick = function () {
	window.showStylieAlert({
		message: 'creating backup archive, and downloading in the background'
	});
	window.adminRefresh();
};

var setExistingBackup = function (value) {
	backuppathInput.value = value;
	backuppathDisplayInput.value = value;
	backupassetid.value = value;
	previousbackupInput.value = 'usepreviousbackup';
	importBackupSelectionEl.style.display = 'none';
	importFormContainer.style.display = 'block';
};

var useExistingBackupListener = function (e) {
	setExistingBackup(e.target.value);
};

var elementSelectors = function () {
	downloadbutton = document.querySelector('#downloan_periodic-button');
	importFormContainer = document.getElementById('importFormContainer');
	existingbackuplist = document.getElementById('existingbackuplist');
	backupassetid = document.getElementById('backupassetid');
	importBackupSelectionEl = document.getElementById('importBackupSelection');
	backuppathInput = document.getElementById('backuppath');
	previousbackupInput = document.getElementById('previousbackup');
	backuppathDisplayInput = document.getElementById('backuppathdisplay');
};

var eventHandlers = function () {
	downloadbutton.addEventListener('click', downloadbuttonClick, false);
	if (existingbackuplist) {
		existingbackuplist.addEventListener('change', useExistingBackupListener, false);
	}
};
window.displayImportBackupStatus = function (ajaxFormResponse) {
	window.adminRefresh();
	var predata = document.createElement('pre'),
		h5element = document.createElement('h5'),
		hrelement = document.createElement('hr');

	h5element.innerHTML = 'Import Seed Result - Application is currently restarting';
	predata.innerHTML = JSON.stringify(ajaxFormResponse.body.data, null, 2);
	predata.setAttribute('class', 'ts-text-xs ts-overflow-auto');
	predata.setAttribute('style', 'max-height:30em;');

	window.servermodalElement.querySelector('#servermodal-content').innerHTML = '';
	window.servermodalElement.querySelector('#servermodal-content').appendChild(h5element);
	window.servermodalElement.querySelector('#servermodal-content').appendChild(hrelement);
	window.servermodalElement.querySelector('#servermodal-content').appendChild(predata);
	window.AdminModal.show('servermodal-modal');

	window.adminSocket.on('disconnect', function () {
		window.StylieNotificationObject.dismiss();
		window.showStylieAlert({
			message: 'Shutting down application and restarting Periodic.'
		});
	});
	window.adminSocket.on('connect', function () {
		window.StylieNotificationObject.dismiss();
		window.showStylieAlert({
			message: 'Periodic restore from backup completed and application restarted.'
		});
		window.adminRefresh();
	});
	// importstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
};

window.useUploadedBackup = function (data) {
	console.log('data', data);
	var optionElement = document.createElement('option');
	optionElement.value = data.body.data.files[0].filename;
	optionElement.innerHTML = optionElement.value;
	existingbackuplist.appendChild(optionElement);
	existingbackuplist.value = optionElement.value;
	setExistingBackup(optionElement.value);
};

window.backupcompleted = function () {
	window.endPreloader();
	window.showStylieNotification({
		message: 'downloaded back up file'
	});
};

var init = function () {
	elementSelectors();
	eventHandlers();
};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
}
else {
	window.addEventListener('load', init, false);
}


// var componentTab1,
// 	contentEntryModule = require('./../../../periodicjs.ext.admin/resources/js/contententry'),
// 	contententry,
// 	tabelement,
// 	assetidInput,
// 	importstatusoutputel,
// 	backupcustomstatusoutputel,
// 	importBackupSelectionEl,
// 	importFormContainer,
// 	exampleBackupSelect,
// 	ComponentTabs = require('periodicjs.component.tabs');

// var tabEvents = function () {
// 	componentTab1.on('tabsShowIndex', function ( /*index*/ ) {
// 		// codemirrortab(index);
// 	});
// };


// window.showImportStatusResult = function () {
// 	document.getElementById('importstatuscontainer').style.display = 'block';
// 	importstatusoutputel.innerHTML = 'Importing backup data';
// };


// window.displayCustomBackupStatus = function (ajaxFormResponse) {
// 	// console.log(ajaxFormResponse);
// 	backupcustomstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
// };

// window.handleAjaxError = function (errormessage) {
// 	if (errormessage === 'Origin is not allowed by Access-Control-Allow-Origin') {
// 		window.location.reload();
// 	}
// };

// window.addEventListener('load', function () {
// 	backuppathInput = document.getElementById('backuppath');
// 	previousbackupInput = document.getElementById('previousbackup');
// 	backuppathDisplayInput = document.getElementById('backuppathdisplay');
// 	assetidInput = document.getElementById('assetid');
// 	tabelement = document.getElementById('tabs');
// 	exampleBackupSelect = document.getElementById('example-backup-select');
// 	importstatusoutputel = document.getElementById('backupimportstatus');
// 	backupcustomstatusoutputel = document.getElementById('backupcustomstatus');
// 	window.ajaxFormEventListers('._pea-ajax-form');
// 	// exampleBackupSelect.addEventListener('change', exapmleBackupSelectEventHandler, false);
// 	if (tabelement) {
// 		componentTab1 = new ComponentTabs(tabelement);
// 	}
// 	contententry = new contentEntryModule({
// 		uploadfileoptions: {
// 			posturl: '/localasset/new?format=json'
// 		},
// 		mediafileinput: document.getElementById('upload-backup_button'),
// 		uploadmediaCallback: function (mediadoc) {
// 			backuppathInput.value = mediadoc.fileurl;
// 			backuppathDisplayInput.value = mediadoc.fileurl;
// 			assetidInput.value = mediadoc._id;
// 			importBackupSelectionEl.style.display = 'none';
// 			importFormContainer.style.display = 'block';
// 			// console.log('uploadmediaCallback mediadoc', mediadoc);
// 		}
// 	});

// 	tabEvents();
// });
