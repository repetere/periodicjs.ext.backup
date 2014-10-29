'use strict';

var componentTab1,
	contentEntryModule = require('./../../../periodicjs.ext.admin/resources/js/contententry'),
	contententry,
	tabelement,
	backuppathInput,
	backuppathDisplayInput,
	previousbackupInput,
	assetidInput,
	existingbackuplist,
	importstatusoutputel,
	backupcustomstatusoutputel,
	importBackupSelectionEl,
	importFormContainer,
	codeMirrorJSEditorsElements,
	exampleBackupSelect,
	codeMirrors = [],
	CodeMirror = require('codemirror'),
	ComponentTabs = require('periodicjs.component.tabs');


require('../../node_modules/codemirror/addon/edit/matchbrackets');
require('../../node_modules/codemirror/addon/comment/comment');
require('../../node_modules/codemirror/addon/comment/continuecomment');
require('../../node_modules/codemirror/addon/fold/foldcode');
require('../../node_modules/codemirror/addon/fold/comment-fold');
require('../../node_modules/codemirror/addon/fold/indent-fold');
require('../../node_modules/codemirror/addon/fold/brace-fold');
require('../../node_modules/codemirror/addon/fold/foldgutter');
require('../../node_modules/codemirror/mode/css/css');
require('../../node_modules/codemirror/mode/htmlembedded/htmlembedded');
require('../../node_modules/codemirror/mode/javascript/javascript');


var useExistingBackupListener = function (e) {
	backuppathInput.value = e.target.value;
	backuppathDisplayInput.value = e.target.value;
	previousbackupInput.value = 'usepreviousbackup';
	importBackupSelectionEl.style.display = 'none';
	importFormContainer.style.display = 'block';
};

/**
 * resize codemirror on window resize
 */
var styleWindowResizeEventHandler = function () {
	if (codeMirrorJSEditorsElements) {
		for (var y in codeMirrors) {
			codeMirrors[y].refresh();
			// codeMirrorJSEditors[y].setSize('auto', '80%');
		}
	}
};

var initCodemirrors = function () {
	for (var cm = 0; cm < codeMirrorJSEditorsElements.length; cm++) {
		console.log('codeMirrorJSEditorsElements[cm].id', codeMirrorJSEditorsElements[cm].id);
		codeMirrors[codeMirrorJSEditorsElements[cm].id] = CodeMirror.fromTextArea(
			codeMirrorJSEditorsElements[cm], {
				lineNumbers: true,
				lineWrapping: true,
				matchBrackets: true,
				autoCloseBrackets: true,
				mode: 'application/json',
				indentUnit: 4,
				indentWithTabs: true,
				'overflow-y': 'hidden',
				'overflow-x': 'auto',
				lint: true,
				gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
				foldGutter: true
			}
		);
	}
	window.codeMirrors = codeMirrors;
};

var tabEvents = function () {
	componentTab1.on('tabsShowIndex', function ( /*index*/ ) {
		// codemirrortab(index);
		styleWindowResizeEventHandler();
	});
};

var exapmleBackupSelectEventHandler = function (e) {
	var newCMValue = JSON.stringify(window.examplebackup[e.target.value], null, 2);
	codeMirrors['example-backup-ta'].doc.setValue(newCMValue);
};

window.addEventListener('resize', styleWindowResizeEventHandler, false);

window.showImportStatusResult = function () {
	document.getElementById('importstatuscontainer').style.display = 'block';
	importstatusoutputel.innerHTML = 'Importing backup data';
};

window.displayImportBackupStatus = function (ajaxFormResponse) {
	// console.log(ajaxFormResponse);
	importstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
};

window.showCustomStatusResult = function () {
	document.getElementById('custombackup-codemirror').innerHTML = codeMirrors['custombackup-codemirror'].getValue();
	document.getElementById('customstatuscontainer').style.display = 'block';
	backupcustomstatusoutputel.innerHTML = 'Customing backup data';
};

window.displayCustomBackupStatus = function (ajaxFormResponse) {
	// console.log(ajaxFormResponse);
	backupcustomstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
};

window.addEventListener('load', function () {
	backuppathInput = document.getElementById('backuppath');
	previousbackupInput = document.getElementById('previousbackup');
	backuppathDisplayInput = document.getElementById('backuppathdisplay');
	assetidInput = document.getElementById('assetid');
	tabelement = document.getElementById('tabs');
	exampleBackupSelect = document.getElementById('example-backup-select');
	importFormContainer = document.getElementById('importFormContainer');
	existingbackuplist = document.getElementById('existingbackuplist');
	importstatusoutputel = document.getElementById('backupimportstatus');
	importBackupSelectionEl = document.getElementById('importBackupSelection');
	backupcustomstatusoutputel = document.getElementById('backupcustomstatus');
	codeMirrorJSEditorsElements = document.querySelectorAll('.codemirroreditor');
	window.ajaxFormEventListers('._pea-ajax-form');
	// exampleBackupSelect.addEventListener('change', exapmleBackupSelectEventHandler, false);
	if (tabelement) {
		componentTab1 = new ComponentTabs(tabelement);
	}
	contententry = new contentEntryModule({
		// ajaxFormToSubmit: document.getElementById('edit-collection-form'),
		mediafileinput: document.getElementById('upload-backup_button'),
		uploadmediaCallback: function (mediadoc) {
			backuppathInput.value = mediadoc.fileurl;
			backuppathDisplayInput.value = mediadoc.fileurl;
			assetidInput.value = mediadoc._id;
			importBackupSelectionEl.style.display = 'none';
			importFormContainer.style.display = 'block';
			// console.log('uploadmediaCallback mediadoc', mediadoc);
		}
	});
	if (existingbackuplist) {
		existingbackuplist.addEventListener('change', useExistingBackupListener, false);
	}
	initCodemirrors();
	tabEvents();
});
