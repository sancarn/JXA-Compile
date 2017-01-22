# JXA-Compile
JXA has a problem with adding libraries that contain classes. See http://macscripter.net/viewtopic.php?id=45465. This library gives the ability to build projects back to the JXA programmer, using an atom text editor.

With this code a user can simply do:

`include("some/file/directory/myLib.txt")`

and all the code contained in `myLib.txt` will be placed into the file at that location.

The code also allows for relative filePaths to be used:

```
include("someFile.js")
include("../other/dir/someFile.js")
```

I also intend to make it compatible with compiled `.scpt` files.

See it in action:
[![See it in action!](http://img.youtube.com/vi/7qgOoWOXCk4/0.jpg)](http://www.youtube.com/watch?v=7qgOoWOXCk4)
