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
      // Актуальные активные теги на момент клика
      let activeTags = document.querySelectorAll('.A_TagRecipes.active');
      
      if (tag !== allTag) {
        // если он бычный тег

        allTag.classList.remove('active');
        tag.classList.toggle('active');
        
        // Обновляем activeTags после изменения
        activeTags = document.querySelectorAll('.A_TagRecipes.active');
        
        // если нет активных тегов становится активным тег ВСЕ
        if (activeTags.length === 0) {
          allTag.classList.add('active');
        }
        
        filterByTag();
        console.log('фильтрация по тегу');
      } else {
        // Тег "все"
        if (tag.classList.contains('active')) {
          tag.classList.remove('active');
        } else {
          tag.classList.add('active');

          tags.forEach(t => {
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
  
  // ✅ Если нет активных тегов или активен тег "all" - показываем все карточки
  if (activeTags.length === 0 || 
      Array.from(activeTags).some(tag => tag.classList.contains('all'))) {
    cards.forEach((card) => {
      card.style.display = '';
    });
    return;
  }
  
  // Получаем тексты активных тегов
  const activeTagTexts = Array.from(activeTags).map(tag => tag.innerText);
  
  // Фильтруем карточки
  cards.forEach((card) => {
    const cardTags = card.querySelectorAll('.A_TagRecipes');
    const cardTagTexts = Array.from(cardTags).map(tag => tag.innerText);
    
    // Проверяем, есть ли хотя бы один совпадающий тег
    const hasMatch = activeTagTexts.some(activeTag => 
      cardTagTexts.includes(activeTag)
    );
    
    card.style.display = hasMatch ? '' : 'none';
  });
}

// Вызов функции
initFilter();