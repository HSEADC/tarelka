import Airtable from 'airtable';

document.addEventListener('DOMContentLoaded', () => {
  const token =
    'patjCRqLMMU67TADJ.39e7069afd25d1f546a9b5546af805a31d51e0f0406fb767cee60c586659656a';

  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: token,
  });

  const base = Airtable.base('app11awHwinfj4ZoV');

  getCardTeasers().then((content) => {
    createRecipesTeasersCards(content);
    createRecipesTeasersCardsM(content);
  });

  function getCardTeasers() {
    return new Promise((resolve, reject) => {
      const content = [];

      base('Recepies')
        .select({
          maxRecords: 20,
          sort: [{ field: 'Direction', direction: 'asc' }],
        })
        .firstPage()
        .then((result) => {
          result.forEach((record) => {
            content.push({
              id: record.id,
              title: record.fields['Title'],
              tags: record.fields['Tags'],
              link: record.fields['URL'],
              img: record.fields['IMG'],
              width: record.fields['Width'],
            });
          });

          resolve(content);
        })
        .catch(reject);
    });
  }

  function createRecipesTeasersCards(content) {
    const container = document.querySelector('.O_RecipesCards');
    if (!container) return;

    content.forEach((stroke) => {
      const { title, tags, link, img, width } = stroke;

      const RecipesTitle = document.createElement('h4');
      RecipesTitle.classList.add('A_TitleCard');
      RecipesTitle.innerText = title;

      const RecipesTags = document.createElement('div');
      RecipesTags.classList.add('C_ArticleTags');

      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          const RecipesTag = document.createElement('span');
          RecipesTag.classList.add('A_TagRecipes');
          RecipesTag.innerText = tag;

          RecipesTags.appendChild(RecipesTag);
        });
      }

      const RecipesCard = document.createElement('a');
      RecipesCard.classList.add('M_RecipesCards');

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

      const RecipesTitle = document.createElement('h4');
      RecipesTitle.classList.add('A_TitleCard');
      RecipesTitle.innerText = title;

      const RecipesTags = document.createElement('div');
      RecipesTags.classList.add('C_ArticleTags');

      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          const RecipesTag = document.createElement('span');
          RecipesTag.classList.add('A_TagRecipes');
          RecipesTag.innerText = tag;

          RecipesTags.appendChild(RecipesTag);
        });
      }

      const RecipesCard = document.createElement('a');
      RecipesCard.classList.add('M_RecipesCards');

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
  function getArticlesCards() {
    return new Promise((resolve, reject) => {
      const content = [];

      base('Articles_cards')
        .select({
          maxRecords: 20,
          sort: [{ field: 'Direction', direction: 'asc' }],
        })
        .firstPage()
        .then((result) => {
          result.forEach((record) => {
            content.push({
              id: record.id,
              title: record.fields['Title'],
              description: record.fields['Description'],
              tag: record.fields['Tags'],
              link: record.fields['URL'],
              img: record.fields['Image'],
              size: record.fields['Size'],
            });
          });

          resolve(content);
        })
        .catch(reject);
    });
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

      // 💥 размер карточки
      if (size) {
        card.classList.add(size.toLowerCase());
        // например: s, m, l, xxl
      }

      card.href = link;
      card.style.backgroundImage = `url(${img})`;

      // 🔹 верх: тег + стрелка
      const topRow = document.createElement('div');
      topRow.classList.add('W_ArticleTop');

      // стрелка
      const arrow = document.createElement('div');
      arrow.classList.add('A_Arrow');

      topRow.appendChild(tagWrap);
      topRow.appendChild(arrow);

      // 🔹 текст: title + description
      const textWrap = document.createElement('div');
      textWrap.classList.add('W_ArticleText');

      textWrap.appendChild(titleEl);
      textWrap.appendChild(descEl);

      // 🔹 вставка в карточку
      card.appendChild(topRow);
      card.appendChild(textWrap);

      container.appendChild(card);
    });
  }
  getArticlesCards().then((content) => {
    createArticlesCards(content);
  });
});

import banana from '../img/logoanimation/Banana.png';
document.querySelector('.Q_LogoMove_Banana').src = banana;

import kiwi from '../img/logoanimation/Kiwi.png';
document.querySelector('.Q_LogoMove_Kiwi').src = kiwi;

import strawberry from '../img/logoanimation/Strawberry.png';
document.querySelector('.Q_LogoMove_Strawberry').src = strawberry;

import strawberry1 from '../img/logoanimation/Strawberry1.png';
document.querySelector('.Q_LogoMove_Strawberry1').src = strawberry1;

import tomato from '../img/logoanimation/Tomato.png';
document.querySelector('.Q_LogoMove_Tomato').src = tomato;
