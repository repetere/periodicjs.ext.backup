'use strict';
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const async = Promisie.promisifyAll(require('async'));
const Decompress = require('decompress');
const path = require('path');
const moment = require('moment');
const defaultRestoreDir = path.join(__dirname, '../../../content/files/backups/.restoretemp');
const npmhelper = require(path.join(__dirname, '../../../scripts/npmhelper'))({});

var removeBackupArchieve = false;
var backupFileStatus = {};
var backupSeedFileJSON = {};
var seedController;
var CoreUtilities;
var CoreController;
var appSettings;
var mongoose;
var Asset;
var restoreBackUpSettings;
var logger;
var d = moment();
var defaultExportFileName = `dbemptybackup-${moment().format('YYYY-MM-DD-hh:mm:ss')}.json`;

var restartApplicationAndCopyContentFiles = function (cb) {
  let contentDir = path.join(__dirname, '../../../content');
  let backupContentDir = path.join(defaultRestoreDir, 'content');
  let copy = function (callback) {
    try {
      if (backupFileStatus.backupinfo && backupFileStatus.backupinfo.backupconfigcontent) {
        fs.copyAsync(backupContentDir, contentDir)
          .then(() => fs.removeAsync(defaultRestoreDir))
          .then(result => callback(null, result))
          .catch(callback);
      }
      else {
        CoreUtilities.restart_app({
          callback: err => {
            if (err) { callback(err); }
            else { fs.remove(defaultRestoreDir, callback); }
          }
        });
      }
    }
    catch (e) {
      callback(e);
    }
  };
  if (typeof cb === 'function') { copy(cb); }
  else { return Promisie.promisify(copy)(); }
};

var removeBackupDirectory = function (cb) {
  let remove = function (callback) {
    try {
      let operations = [];
      if (restoreBackUpSettings.backupassetid && restoreBackUpSettings.removeBackupAsset) {
        operations.push(Promisie.promisify(Asset.remove, Asset)({
          fileurl: new RegExp(restoreBackUpSettings.backupassetid, 'gi')
        }));
      }
      else { operations.push('skip removing asset from DB'); }
      if (restoreBackUpSettings.removeBackupAsset) {
        let backuparchivepath = path.join(__dirname, '../../../content/files/backups', restoreBackUpSettings.backuppath);
        operations.push(fs.removeAsync(backuparchivepath));
      }
      else { operations.push('skip deleting backup files'); }
      Promise.all(operations)
        .then(result => callback(null, result))
        .catch(callback);
    }
    catch (e) {
      callback(e);
    }
  };
  if (typeof cb === 'function') { remove(cb); }
  else { return Promisie.promisify(remove)(); }
};

var restoreDBSeed = function (cb) {
  let restore = function (callback) {
    try {
      let results = {};
      if (backupFileStatus.backupinfo.backupdatabase) {
        seedController.exportSeed({
          outputPath: path.join(__dirname, '../../../content/files/dbseeds', defaultExportFileName)
        })
          .then(result => {
            results.createBackupSeedFile = result;
            return (restoreBackUpSettings.wipeAndReplaceDB) ? Promisie.promisify(seedController.emptyDB)({}) : 'skip wiping database';
          })
          .then(result => {
            results.wipeDataBeforeInserting = result;
            return fs.readJsonAsync(path.join(defaultRestoreDir, 'backupseed.json'))
              .then(json => {
                backupSeedFileJSON = json;
                return 'got backup json status';
              }, e => Promise.reject(e));
          })
          .then(result => {
            results.loanBackupSeedFile = result;
            return seedController.importSeed({
              file: backupSeedFileJSON
            });
          })
          .then(result )
      }
      else { callback(null, 'do not import database seed'); }
    }
    catch (e) {
      callback(e);
    }
  };
  if (typeof cb === 'function') { restore(cb); }
  else { return Promisie.promisify(restore)(); }
};