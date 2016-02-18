var tmtxt = tmtxt || {};

// Detect OS
tmtxt.os = {};
tmtxt.os.name = (function() {
  var os = Components.classes["@mozilla.org/xre/app-info;1"]
      .getService(Components.interfaces.nsIXULRuntime).OS;
  return os;
})();
tmtxt.os.inLinux = function(exec) {
  if(this.name === 'Linux') {
    exec();
  }
};
tmtxt.os.inMac = function(exec) {
  if(this.name === 'Darwin') {
    exec();
  }
};

// OSX mapping: Command => A | Option => M
tmtxt.os.inMac(function(){
  modifiers.M = new modifier(function (event) { return event.altKey; },
                             function (event) { event.altKey = true; });
  modifiers.A = new modifier(function (event) { return event.metaKey; },
                             function (event) { event.metaKey = true; });

  define_key(default_global_keymap, "A-`", null, $fallthrough);
});

// add directory dir inside .conkerorrc to load_paths
tmtxt.addPath = function(dir) {
  var path = get_home_directory();
  path.appendRelativePath(".conkerorrc");
  path.appendRelativePath(dir);
  load_paths.unshift(make_uri(path).spec);
};

// require external libraries that not use conkeror module system
tmtxt.require = function(module) {
  require(module);
  if (!featurep(module)) {
    provide(module);
  }
};

// Some useful modules
require("daemon.js");
require("dom-inspector.js");
require("page-modes/gmail.js");
require("global-overlay-keymap");
require("clicks-in-new-buffer.js");
require("page-modes/google-search-results.js");
tmtxt.addPath("modules");
tmtxt.require("underscore.js");
tmtxt.require("content-delay.js");

// my config files
tmtxt.addPath("config");
require("tmtxt-development.js");
require("tmtxt-appearance.js");
require("tmtxt-webjumps.js");
require("tmtxt-buffer-switcher.js");
require("tmtxt-buffer-interaction.js");
require("tmtxt-modeline.js");
// require("tmtxt-useragent.js");
require("tmtxt-minibuffer.js");
require("tmtxt-download.js");
require("tmtxt-sites.js");
require("tmtxt-form.js");
require("tmtxt-facebook.js");
require("tmtxt-env.js");
require("tmtxt-extensions.js");
require("tmtxt-hinting.js");
require("tmtxt-session.js");
require("tmtxt-navigation.js");
require("tmtxt-keybindings.js");

// some config
user_pref('accessibility.browsewithcaret', false); // disable caret mode
user_pref("browser.history_expire_day", 365);
session_pref("layout.spellcheckDefault", 2);

url_remoting_fn = load_url_in_new_buffer;
clicks_in_new_buffer_target = OPEN_NEW_BUFFER_BACKGROUND;

/// clear cache function
interactive("tmtxt-cache-clear-all", "clear all cache",
            function (I) {
			        cache_clear(CACHE_ALL);
            });
define_key(default_global_keymap, "C-`", "tmtxt-cache-clear-all");

tmtxt.permissionsList = [
  {desc: "Audio Capture", value: "audio-capture"},
  {desc: "Video Capture", value: "video-capture"},
  {desc: "Geo Location", value: "geolocation"},
  {desc: "Desktop Notification", value: "desktop-notification"}
];
tmtxt.readPermission = function(I) {
  return I.minibuffer.read(
    $prompt = "permission",
    $completer = new all_word_completer(
      $completions = tmtxt.permissionsList,
      $get_string = function(x) {return x.value;},
      $get_description = function(x) {return x.desc;}
    )
  );
};
tmtxt.addPermission = function(I) {
  var permissionManager = tmtxt.xpcom.permissionManager;
  var perm = yield tmtxt.readPermission(I);
  var uri = make_uri(I.buffer.current_uri.prePath);
  var allow = Components.interfaces.nsIPermissionManager.ALLOW_ACTION;

  permissionManager.add(uri, perm, allow);
};
tmtxt.removePermission = function(I) {
  var permissionManager = tmtxt.xpcom.permissionManager;
  var perm = yield tmtxt.readPermission(I);
  var uri = make_uri(I.buffer.current_uri.prePath);
  var deny = Components.interfaces.nsIPermissionManager.DENY_ACTION;

  permissionManager.add(uri, perm, deny);
};

interactive("b", "b", tmtxt.addPermission);
interactive("c", "c", tmtxt.removePermission);

interactive("a", "a", function(I){
  var permsList = [
    {desc: "Audio Capture", value: "audio-capture"},
    {desc: "Video Capture", value: "video-capture"},
    {desc: "Geo Location", value: "geolocation"},
    {desc: "Desktop Notification", value: "desktop-notification"}
  ];

  var perm = yield I.minibuffer.read(
    $prompt = "permission",
    $completer = new all_word_completer(
      $completions = permsList,
      $get_string = function(x) {return x.value;},
      $get_description = function(x) {return x.desc;}
    )
  );

  I.minibuffer.message(I.buffer.current_uri.prePath);
});
