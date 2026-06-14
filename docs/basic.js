(() => {
  "use strict";
  var e, t, n;
  ((e = document.querySelector(".A_NavigationLogo")),
    (t = document.querySelectorAll('[class^="Q_LogoMove_"]')),
    e.addEventListener("mouseenter", function () {
      (t.forEach(function (e) {
        return e.classList.add("animation");
      }),
        setTimeout(function () {
          t.forEach(function (e) {
            return e.classList.remove("animation");
          });
        }, 610));
    }),
    (n = document.querySelector("#burger")).addEventListener(
      "click",
      function () {
        n.classList.toggle("active");
      },
    ));
})();
