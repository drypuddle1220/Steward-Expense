// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e)
    n += e;
  else if ("object" == typeof e)
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else
      for (f in e)
        e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++)
    (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var clsx_default = clsx;

// node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r2 in t)
        ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

export {
  clsx_default,
  _extends
};
//# sourceMappingURL=chunk-EU7EINW7.js.map
