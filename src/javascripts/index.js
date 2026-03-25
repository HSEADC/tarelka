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
});
