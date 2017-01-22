/*
# Your init script
#
# Atom will evaluate this file each time a new window is opened. It is run
# after packages are loaded/activated and after the previous editor state
# has been restored.
#
# An example hack to log to the console when each text editor is saved.
#
# atom.workspace.observeTextEditors (editor) ->
#   editor.onDidSave ->
#     console.log "Saved! #{editor.getPath()}"
*/

/*
    //If isPackage then require atom
    var atom = require('atom')
*/

/*
// To hook on ".onDidSave"
editor.getBuffer().onDidSave(function () {console.log('Did save event')})

//List of events here:
https://github.com/atom/text-buffer/blob/master/src/text-buffer.coffee#L202

Also look at:
https://discuss.atom.io/t/how-to-modify-the-buffer-just-before-saving-and-just-after-loading/14839/4
*/


atom.commands.add('atom-text-editor', 'jxa:compile', function(){
    var fs = require('fs');
    var path = require('path');

    //Get the active editor and it's filepath:
    //var editor = oAtom.workspace.getActiveTextEditor();
    var editor = atom.workspace.getActiveTextEditor();

    //Build project into file
    var builtFile = build(editor)
    var compiFile = path.dirname(builtFile) + '/' + path.basename(builtFile,path.extname(builtFile)) + '.scpt'

    //Delete compiled file, if exists
    if(fs.existsSync(compiFile)){
        fs.unlinkSync(compiFile);
    }

    //Run command:
    //osacompile -l JavaScript -o newFilepath newFilepath
    //To compile to script using .scpt as newFilepath extension
    var exec = require('child_process').exec;
    var cmd = 'osacompile -l JavaScript -o ' + compiFile + ' -s ' + builtFile;
    var child = exec(cmd, function(error, stdout, stderr) {
        // command output is in stdout
        console.log('Error:' + error)
        console.log('StdOut:' + stdout)
        console.log('StdErr:' + stderr)
    });

    //Delete built file after compilation has finished.
    child.on('exit',function(){
        fs.unlinkSync(builtFile);
    })
});

atom.commands.add('atom-text-editor', 'jxa:compileApp', function(){
    var fs = require('fs');
    var path = require('path');

    //Get the active editor and it's filepath:
    //var editor = oAtom.workspace.getActiveTextEditor();
    var editor = atom.workspace.getActiveTextEditor();

    //Build project into file
    var builtFile = build(editor)
    var compiFile = path.dirname(builtFile) + '/' + path.basename(builtFile,path.extname(builtFile)) + '.app'

    //Delete compiled file, if exists
    if(fs.existsSync(compiFile)){
        //Remove application / 'directory'
        rmDirRecursive(compiFile);
    }

    //Run command:
    //osacompile -l JavaScript -o newFilepath newFilepath
    //To compile to app use .App as newFilepath extension
    var exec = require('child_process').exec;
    var cmd = 'osacompile -l JavaScript -o ' + compiFile + ' -s ' + builtFile;
    var child = exec(cmd, function(error, stdout, stderr) {
        // command output is in stdout
        console.log('Error:' + error)
        console.log('StdOut:' + stdout)
        console.log('StdErr:' + stderr)
    });

    //Delete built file after compilation has finished.
    child.on('exit',function(){
        fs.unlinkSync(builtFile);
    })
});

atom.commands.add('atom-text-editor', 'jxa:execute', function(){
    var fs = require('fs');
    var path = require('path');

    //Get the active editor and it's filepath:
    //var editor = oAtom.workspace.getActiveTextEditor();
    var editor = atom.workspace.getActiveTextEditor();

    //Build project into file
    var builtFile = build(editor)
    var compiFile = path.dirname(builtFile) + '/' + path.basename(builtFile,path.extname(builtFile)) + '.scpt'

    var alreadyCompiled = fs.existsSync(compiFile)
    //Delete compiled file, if exists
    if(alreadyCompiled){
        fs.unlinkSync(compiFile);
    }

    //Run command:
    //osacompile -l JavaScript -o newFilepath newFilepath
    //To compile to app use .App as newFilepath extension
    var exec = require('child_process').exec;
    var cmd = 'osacompile -l JavaScript -o ' + compiFile + ' ' + builtFile;
    exec(cmd, function(error, stdout, stderr) {
        // command output is in stdout
        console.log('Error:' + error)
        console.log('StdOut:' + stdout)
        console.log('StdErr:' + stderr)
    });

    //Sleep until compiled
    while(!fs.existsSync(compiFile)){}

    //Run command:
    //osacompile -l JavaScript -o newFilepath newFilepath
    //To compile to app use .App as newFilepath extension
    var exec = require('child_process').exec;
    var cmd = 'osascript ' + compiFile
    var child = exec(cmd, function(error, stdout, stderr) {
        // command output is in stdout
        console.log('Error:' + error)
        console.log('StdOut:' + stdout)
        console.log('StdErr:' + stderr)
    });

    //When executed delete compiFile and builtFile
    child.on('exit', function(){
        // Delete compiFile if it wasn't compiled before
        if(!alreadyCompiled){
            fs.unlinkSync(compiFile);
        }

        // Delete builtFile
        fs.unlinkSync(builtFile);
    })
});


//********************
//* HELPER FUNCTIONS *
//********************


function build(editor){
    var fs = require('fs');
    var path = require('path');

    var activeFilepath = editor.buffer.file.path;

    //Get path variables
    var ext     = path.extname(activeFilepath)
    var dir     = path.dirname(activeFilepath)
    var file    = path.basename(activeFilepath,ext)

    //Cut if file name != *.js | *.jxa | .applescript | .scpt
    if([".js",".jxa",".applescript",".scpt"].indexOf(ext) == -1){
        console.log('file extension "' + ext + '" is not a valid JXA extension.')
        return
    }

    //Get active JXA script
    var script = editor.getText();

    //Find include("my/file/path.extension") and replace with contents of file.
    var needle = /include\("(.*)"\)/;
    script = script.replace(needle, function(match, c1){
        if(fs.existsSync(c1)){
            //If absolute file path:
            console.log('Found file "' + c1 + '" at absolute location.');
            return fs.readFileSync(c1).toString();
        }

        //If c1 is relative path:
        var absPath = path.resolve(dir,c1)

        if(fs.existsSync(absPath)){
            console.log('Found file "' + c1 + '" at relative location "' + absPath + '"');
            return fs.readFileSync(absPath).toString();
        } else {
            console.log('File "%1" does not exist.'.replace('%1',c1));
            return match;
        }
    });

    //Script contains full JXA script
    var newFilepath = dir + "/" + file + "_transpiled.js";

    //Delete built file, if exists
    if(fs.existsSync(newFilepath)){
        fs.unlinkSync(newFilepath);
    }
    
    //Write new file:
    fs.writeFileSync(newFilepath,script);

    return newFilepath
}

function rmDirRecursive(path) {
  var fs = require('fs');
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        rmDirRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
