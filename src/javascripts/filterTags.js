function initFilter() {
  const tags = document.querySelectorAll('.A_TagRecipes');
  const allTag = document.querySelector('.A_TagRecipes.all');

  if (!allTag) {
    console.error('Тег "all" не найден');
    return;
  }

  console.log(tags);

  tags.forEach((tag) => {
    tag.addEventListener('click', () => {
      let activeTags = document.querySelectorAll('.A_TagRecipes.active');

      if (tag !== allTag) {
        allTag.classList.remove('active');
        tag.classList.toggle('active');

        activeTags = document.querySelectorAll('.A_TagRecipes.active');

        if (activeTags.length === 0) {
          allTag.classList.add('active');
        }

        filterByTag();
        console.log('фильтрация по тегу');
      } else {
        if (tag.classList.contains('active')) {
          tag.classList.remove('active');
        } else {
          tag.classList.add('active');

          tags.forEach((t) => {
            if (t !== allTag) {
              t.classList.remove('active');
            }
          });
        }

        filterByTag();
        console.log('вывод всех карточек');
      }
    });
  });
}

function filterByTag() {
  const cards = document.querySelectorAll('.M_RecipesCards');
  let activeTags = document.querySelectorAll('.A_TagRecipes.active');
  const isAllActive =
    activeTags.length === 0 ||
    Array.from(activeTags).some((tag) => tag.classList.contains('all'));

  if (isAllActive) {
    cards.forEach((card) => {
      card.style.display = '';
    });

    // Возвращаем big
    document
      .querySelectorAll('.M_RecipesCards[data-was-big]')
      .forEach((card) => {
        card.classList.remove('small');
        card.classList.add('big');
        card.removeAttribute('data-was-big');
      });

    return;
  }

  const activeTagTexts = Array.from(activeTags).map((tag) => tag.innerText);

  cards.forEach((card) => {
    const cardTags = card.querySelectorAll('.A_TagRecipes');
    const cardTagTexts = Array.from(cardTags).map((tag) => tag.innerText);

    const hasMatch = activeTagTexts.some((activeTag) =>
      cardTagTexts.includes(activeTag),
    );

    card.style.display = hasMatch ? '' : 'none';

    // Меняем big на small с дта-атрибутом
    if (card.classList.contains('big')) {
      card.classList.remove('big');
      card.classList.add('small');
      card.setAttribute('data-was-big', 'true');
    }
  });
}

initFilter();
