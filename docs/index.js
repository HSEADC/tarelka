(()=>{"use strict";console.log("main")})();

document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('burger');
  const header = document.querySelector('.header');
  if (burger && header) {
    burger.addEventListener('click', function () {
      header.classList.toggle('open');
    });

    const menuLinks = document.querySelectorAll('.menu_link');
    menuLinks.forEach(link => {
      link.addEventListener('click', function () {
        header.classList.remove('open');
      });
    });
  }
});