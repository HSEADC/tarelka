import { supabase } from './supabase';

document.addEventListener('DOMContentLoaded', () => {
  getCardTeasers().then((content) => {
    createRecipesTeasersCards(content);
    createRecipesTeasersCardsM(content);
    
    // ЗАПУСКАЕМ ФИЛЬТР ПОСЛЕ СОЗДАНИЯ КАРТОЧЕК
    setTimeout(initFilter, 100);
  });

  async function getCardTeasers() {
    const { data, error } = await supabase
      .from('Recepies')
      .select('*')
      .order('Direction', { ascending: true })
      .limit(20);

    console.log(data);
    console.log(error);

    if (error) {
      console.error(error);
      return [];
    }

    return data.map((record) => ({
      id: record.id,
      title: record.Title,
      // ПРЕВРАЩАЕМ СТРОКУ В МАССИВ
      tags: record.Tags ? record.Tags.split(',').map(t => t.trim()) : [],
      link: record.URL,
      img: record.IMG,
      width: record.Width,
    }));
  }

  const tagClassMap = {
    Завтрак: 'breakfast',
    Обед: 'lunch',
    Ужин: 'dinner',
    Мясо: 'meat',
    Рыба: 'fish',
    Птица: 'bird',
    Овощи: 'vegetables',
    'Фрукты и ягоды': 'fruits',
  };

  function createRecipesTeasersCards(content) {
    const container = document.querySelector('.O_RecipesCards');
    if (!container) return;

    content.forEach((stroke) => {
      const { title, tags, link, img, width } = stroke;

      const RecipesCard = document.createElement('a');
      RecipesCard.classList.add('M_RecipesCards');

      const RecipesTitle = document.createElement('h4');
      RecipesTitle.classList.add('A_TitleCard');
      RecipesTitle.innerText = title;

      const RecipesTags = document.createElement('div');
      RecipesTags.classList.add('C_ArticleTags');

      if (Array.isArray(tags) && tags.length > 0) {
        tags.forEach((tag) => {
          const RecipesTag = document.createElement('span');
          RecipesTag.classList.add('A_TagRecipes');
          RecipesTag.innerText = tag;

          const specificClass = tagClassMap[tag];
          if (specificClass) {
            RecipesTag.classList.add(specificClass);
            RecipesCard.classList.add(specificClass);
          }

          RecipesTags.appendChild(RecipesTag);
        });
      }

      if (width) {
        RecipesCard.classList.add(width.toLowerCase());
      }

      RecipesCard.href = link;
      RecipesCard.style.backgroundImage = `url(${img})`;

      RecipesCard.appendChild(RecipesTags);
      RecipesCard.appendChild(RecipesTitle);

      container.appendChild(RecipesCard);
    });
  }

  function createRecipesTeasersCardsM(content) {
    const container = document.querySelector('.O_RecipesCardsM');
    if (!container) return;

    content.slice(0, 5).forEach((stroke) => {
      const { title, tags, link, img, width } = stroke;

      const RecipesCard = document.createElement('a');
      RecipesCard.classList.add('M_RecipesCards');

      const RecipesTitle = document.createElement('h4');
      RecipesTitle.classList.add('A_TitleCard');
      RecipesTitle.innerText = title;

      const RecipesTags = document.createElement('div');
      RecipesTags.classList.add('C_ArticleTags');

      if (Array.isArray(tags) && tags.length > 0) {
        tags.forEach((tag) => {
          const RecipesTag = document.createElement('span');
          RecipesTag.classList.add('A_TagRecipes');
          RecipesTag.innerText = tag;

          const specificClass = tagClassMap[tag];
          if (specificClass) {
            RecipesTag.classList.add(specificClass);
            RecipesCard.classList.add(specificClass);
          }

          RecipesTags.appendChild(RecipesTag);
        });
      }

      if (width) {
        RecipesCard.classList.add(width.toLowerCase());
      }

      RecipesCard.href = link;
      RecipesCard.style.backgroundImage = `url(${img})`;

      RecipesCard.appendChild(RecipesTags);
      RecipesCard.appendChild(RecipesTitle);

      container.appendChild(RecipesCard);
    });
  }

  async function getArticlesCards() {
    const { data, error } = await supabase
      .from('Articles_cards')
      .select('*')
      .order('Direction', { ascending: true })
      .limit(20);

    if (error) {
      console.error(error);
      return [];
    }

    return data.map((record) => ({
      id: record.id,
      title: record.Title,
      description: record.Description,
      tag: record.Tags,
      link: record.URL,
      img: record.Image,
      size: record.Size,
    }));
  }

  function createArticlesCards(content) {
    const container = document.querySelector('.O_ArticleCards');
    if (!container) return;

    content.forEach((item) => {
      const { title, description, tag, link, img, size } = item;

      const titleEl = document.createElement('h4');
      titleEl.classList.add('A_TitleCard');
      titleEl.innerText = title;

      const descEl = document.createElement('p');
      descEl.classList.add('A_DescriptionCard');
      descEl.innerText = description;

      const tagWrap = document.createElement('div');
      tagWrap.classList.add('C_ArticleTags');

      if (tag) {
        const tagEl = document.createElement('span');
        tagEl.classList.add('A_TagRecipes');
        tagEl.innerText = tag;
        tagWrap.appendChild(tagEl);
      }

      const card = document.createElement('a');
      card.classList.add('M_ArticleCard');

      if (size) {
        card.classList.add(size.toLowerCase());
      }

      card.href = link;
      card.style.backgroundImage = `url(${img})`;

      const topRow = document.createElement('div');
      topRow.classList.add('W_ArticleTop');

      const arrow = document.createElement('div');
      arrow.classList.add('A_Arrow');

      topRow.appendChild(tagWrap);
      topRow.appendChild(arrow);

      const textWrap = document.createElement('div');
      textWrap.classList.add('W_ArticleText');

      textWrap.appendChild(titleEl);
      textWrap.appendChild(descEl);

      card.appendChild(topRow);
      card.appendChild(textWrap);

      container.appendChild(card);
    });
  }

  getArticlesCards().then((content) => {
    createArticlesCards(content);
  });
});

// ============ ФИЛЬТР ============
function initFilter() {
  // Создаем тег "Все" если его нет
  let allTag = document.querySelector('.A_TagRecipes.all');
  if (!allTag) {
    const container = document.querySelector('.O_RecipesCards');
    if (container) {
      const newAllTag = document.createElement('span');
      newAllTag.classList.add('A_TagRecipes', 'all', 'active');
      newAllTag.innerText = 'Все';
      container.parentNode.insertBefore(newAllTag, container);
      allTag = newAllTag;
    } else {
      console.error('Контейнер .O_RecipesCards не найден');
      return;
    }
  }

  const tags = document.querySelectorAll('.A_TagRecipes');

  tags.forEach((tag) => {
    tag.addEventListener('click', () => {
      if (tag.classList.contains('all')) {
        // Нажали "Все"
        tags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      } else {
        // Нажали другой тег
        allTag.classList.remove('active');
        tag.classList.toggle('active');
        
        // Если нет активных тегов - включаем "Все"
        if (document.querySelectorAll('.A_TagRecipes.active').length === 0) {
          allTag.classList.add('active');
        }
      }
      
      filterByTag();
    });
  });
}

function filterByTag() {
  const cards = document.querySelectorAll('.M_RecipesCards');
  const activeTags = document.querySelectorAll('.A_TagRecipes.active');
  
  // Проверяем активен ли "Все"
  const isAllActive = activeTags.length === 0 || 
    Array.from(activeTags).some(tag => tag.classList.contains('all'));

  cards.forEach((card) => {
    if (isAllActive) {
      // Показываем все
      card.style.display = '';
      if (card.dataset.wasBig) {
        card.classList.remove('small');
        card.classList.add('big');
        delete card.dataset.wasBig;
      }
    } else {
      // Получаем теги карточки
      const cardTags = Array.from(card.querySelectorAll('.A_TagRecipes'))
        .map(t => t.innerText);
      
      // Получаем активные теги
      const activeTagTexts = Array.from(activeTags).map(t => t.innerText);
      
      // Проверяем совпадение
      const hasMatch = activeTagTexts.some(active => 
        cardTags.some(cardTag => cardTag === active)
      );
      
      card.style.display = hasMatch ? '' : 'none';
      
      // Меняем размер
      if (card.classList.contains('big') && !hasMatch) {
        card.classList.remove('big');
        card.classList.add('small');
        card.dataset.wasBig = 'true';
      }
    }
  });
}