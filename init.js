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

atom.commands.add('atom-text-editor', 'jxa:compile', function(){
    var fs = require('fs');
    var path = require('path');

    //Get the active editor and it's filepath:
    //var editor = oAtom.workspace.getActiveTextEditor();
    var editor = atom.workspace.getActiveTextEditor();
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
    var newFilepath = dir + "/" + file + "_transpiled.scpt";

    //Write new file:
    fs.writeFile(newFilepath,script);

});
