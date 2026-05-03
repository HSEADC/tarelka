"use strict";
(self["webpackChunkTarelka"] = self["webpackChunkTarelka"] || []).push([["basic"],{

/***/ "./src/javascripts/basic.js":
/*!**********************************!*\
  !*** ./src/javascripts/basic.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _stylesheets_style1_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../stylesheets/style1.css */ "./src/stylesheets/style1.css");

animation_logo();
function animation_logo() {
  var logo = document.querySelector('.A_NavigationLogo');
  var items = document.querySelectorAll('[class^="Q_LogoMove_"]');
  logo.addEventListener('mouseenter', function () {
    items.forEach(function (el) {
      return el.classList.add('animation');
    });
    setTimeout(function () {
      items.forEach(function (el) {
        return el.classList.remove('animation');
      });
    }, 610);
  });
}

/***/ }),

/***/ "./src/stylesheets/style1.css":
/*!************************************!*\
  !*** ./src/stylesheets/style1.css ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/javascripts/basic.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaWMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBbUM7QUFFbkNBLGNBQWMsQ0FBQyxDQUFDO0FBRWhCLFNBQVNBLGNBQWNBLENBQUEsRUFBRztFQUN4QixJQUFNQyxJQUFJLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLG1CQUFtQixDQUFDO0VBQ3hELElBQU1DLEtBQUssR0FBR0YsUUFBUSxDQUFDRyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQztFQUVqRUosSUFBSSxDQUFDSyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsWUFBTTtJQUN4Q0YsS0FBSyxDQUFDRyxPQUFPLENBQUMsVUFBQUMsRUFBRTtNQUFBLE9BQUlBLEVBQUUsQ0FBQ0MsU0FBUyxDQUFDQyxHQUFHLENBQUMsV0FBVyxDQUFDO0lBQUEsRUFBQztJQUVsREMsVUFBVSxDQUFDLFlBQU07TUFDZlAsS0FBSyxDQUFDRyxPQUFPLENBQUMsVUFBQUMsRUFBRTtRQUFBLE9BQUlBLEVBQUUsQ0FBQ0MsU0FBUyxDQUFDRyxNQUFNLENBQUMsV0FBVyxDQUFDO01BQUEsRUFBQztJQUN2RCxDQUFDLEVBQUUsR0FBRyxDQUFDO0VBQ1QsQ0FBQyxDQUFDO0FBQ0osQzs7Ozs7Ozs7Ozs7QUNmQSIsInNvdXJjZXMiOlsid2VicGFjazovL1RhcmVsa2EvLi9zcmMvamF2YXNjcmlwdHMvYmFzaWMuanMiLCJ3ZWJwYWNrOi8vVGFyZWxrYS8uL3NyYy9zdHlsZXNoZWV0cy9zdHlsZTEuY3NzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi4vc3R5bGVzaGVldHMvc3R5bGUxLmNzcyc7XG5cbmFuaW1hdGlvbl9sb2dvKCk7XG5cbmZ1bmN0aW9uIGFuaW1hdGlvbl9sb2dvKCkge1xuICBjb25zdCBsb2dvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLkFfTmF2aWdhdGlvbkxvZ28nKTtcbiAgY29uc3QgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbY2xhc3NePVwiUV9Mb2dvTW92ZV9cIl0nKTtcblxuICBsb2dvLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgaXRlbXMuZm9yRWFjaChlbCA9PiBlbC5jbGFzc0xpc3QuYWRkKCdhbmltYXRpb24nKSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGl0ZW1zLmZvckVhY2goZWwgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0aW9uJykpO1xuICAgIH0sIDYxMCk7XG4gIH0pO1xufVxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307Il0sIm5hbWVzIjpbImFuaW1hdGlvbl9sb2dvIiwibG9nbyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsIml0ZW1zIiwicXVlcnlTZWxlY3RvckFsbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJmb3JFYWNoIiwiZWwiLCJjbGFzc0xpc3QiLCJhZGQiLCJzZXRUaW1lb3V0IiwicmVtb3ZlIl0sInNvdXJjZVJvb3QiOiIifQ==