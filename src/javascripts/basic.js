import '../stylesheets/style1.css';

animation_logo();

function animation_logo() {
  const logo = document.querySelector('.A_NavigationLogo');
  const items = document.querySelectorAll('[class^="Q_LogoMove_"]');

  logo.addEventListener('mouseenter', () => {
    items.forEach(el => el.classList.add('animation'));

    setTimeout(() => {
      items.forEach(el => el.classList.remove('animation'));
    }, 610);
  });
}

burgerMenu()

function burgerMenu(){
  let burger = document.querySelector('#burger')

  burger.addEventListener('click', () =>{
    burger.classList.toggle('active')
  })
}
