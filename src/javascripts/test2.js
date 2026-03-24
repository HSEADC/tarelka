const stages = [
  {
    question: 'Есть после 18:00 вредно для фигуры...',
    answers: [
      {
        text: 'Да, всё съеденное после 18:00 откладывается в жир',
        anxiety: 0,
        healthy: 1,
      },
      {
        text: 'Вредно только углеводы»',
        count: 0,
      },
      {
        text: 'Важно не время, а общий баланс питания за день',
        count: 1,
      },
      {
        text: 'После 18:00 замедляется обмен веществ',
        count: 0,
      },
    ],
  },
  {
    question: 'Чтобы похудеть, нужно полностью исключить углеводы',
    answers: [
      {
        text: 'Да, углеводы — главный враг',
        count: 0,
      },
      {
        text: 'Углеводы нужны организму, важен их вид и количество',
        count: 1,
      },
      {
        text: 'Нужно убрать только хлеб',
        count: 0,
      },
      {
        text: 'Можно есть только фрукты',
        count: 0,
      },
    ],
  },
  {
    question: 'Детокс-соки «очищают» организм от токсинов',
    answers: [
      {
        text: 'Да, это научно доказано',
        count: 0,
      },
      {
        text: 'Да, если пить 3 дня',
        count: 0,
      },
      {
        text: 'Организм очищается сам — через печень и почки',
        count: 1,
      },
      {
        text: 'Только зелёные соки работают',
        count: 0,
      },
    ],
  },
  {
    question: 'Чем меньше жира в продукте, тем он полезнее',
    answers: [
      {
        text: 'Да, жир — это вред»',
        count: 0,
      },
      {
        text: 'Только трансжиры вредны',
        count: 1,
      },
      {
        text: 'Обезжиренные продукты всегда лучше',
        count: 0,
      },
      {
        text: 'Полезность зависит от состава, а не только от жирности',
        count: 1,
      },
    ],
  },
  {
    question: 'Стресс может усиливать аппетит',
    answers: [
      {
        text: 'Нет, стресс всегда его снижает',
        count: 0,
      },
      {
        text: 'Это просто слабость характера',
        count: 0,
      },
      {
        text: 'Да, стресс влияет на гормоны и чувство голода',
        count: 1,
      },
      {
        text: 'Только у людей с лишним весом',
        count: 0,
      },
    ],
  },
  {
    question:
      'Чтобы быть здоровым, нужно есть только «чистую» еду без исключений',
    answers: [
      {
        text: 'Да, любые «вредности» опасны',
        count: 0,
      },
      {
        text: 'Иногда можно, но потом нужно компенсировать',
        count: 0,
      },
      {
        text: 'Баланс важнее идеальности — 100% чистоты не требуется',
        count: 1,
      },
      {
        text: 'Зависит от возраста',
        count: 0,
      },
    ],
  },
  {
    question: 'Калории — единственное, что важно в питании',
    answers: [
      {
        text: 'Да, главное — считать',
        count: 0,
      },
      {
        text: 'Только для похудения',
        count: 0,
      },
      {
        text: 'Важны и калории, и состав, и качество еды',
        count: 1,
      },
      {
        text: 'Калории не имеют значения',
        count: 0,
      },
    ],
  },
];

const resultTable = [
  {
    header: 'Твой результат: Разрушитель мифов',
    paragraph:
      'Ты хорошо ориентируешься в теме питания и умеешь отличать мифы от фактов. Скорее всего, ты не поддаёшься на громкие заголовки и подходишь к еде осознанно. Продолжай в том же духе — и делись знаниями с другими.',
  },
  {
    header: 'Твой результат: В поиске баланса ',
    paragraph:
      'Ты уже многое знаешь о питании, но некоторые популярные мифы всё ещё звучат убедительно. Это нормально — вокруг еды очень много противоречивой информации. Немного больше внимания к источникам и собственным ощущениям, и ты легко отделишь факты от маркетинга и модных трендов. Хорошая новость — ты уже на правильном пути.',
  },
  {
    header: 'Жертва пищевых мифов',
    paragraph:
      'Похоже, мифы о питании иногда звучат для тебя убедительнее научных фактов — но ты точно не один. Индустрия здоровья полна громких обещаний и быстрых решений, поэтому запутаться очень легко. Попробуй относиться к советам о еде критически и чаще проверять информацию: питание может быть проще и спокойнее, чем кажется.',
  },
];

let currentStage = 0;
let resultCount = 0;
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

function initTest(stages) {
  const numberofQuestion = document.querySelector('.A_NumberofQuestion');
  const question = document.querySelector('.A_Question');
  const answers = document.querySelectorAll('.A_TestAnswerText');

  numberofQuestion.innerHTML = `вопрос № ${currentStage + 1} из ${
    stages.length
  } `;

  question.innerHTML = stages[currentStage].question;
  for (let i = 0; i < answers.length; i++) {
    answers[i].innerHTML = stages[currentStage].answers[i].text;
  }
  for (let j = 0; j < checkboxes.length; j++) {
    checkboxes[j].dataset.count = stages[currentStage].answers[j].count;
    checkboxes[j].dataset.count = stages[currentStage].answers[j].count;
    checkboxes[j].dataset.count = stages[currentStage].answers[j].count;
    checkboxes[j].dataset.count = stages[currentStage].answers[j].count;
    //внутри цикла к каждому поменять слово count на название вначале
  }
}

function chooseAnswer(stages, resultTable) {
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        resultCount += Number(checkbox.dataset.count);
resultCount += Number(checkbox.dataset.count);
resultCount += Number(checkbox.dataset.count);
resultCount += Number(checkbox.dataset.count);
//то же самое как в 193 строке
        setTimeout(() => {
          updateStage(stages, resultTable);
          checkbox.checked = false;
        }, 300);
      }
    });
  });
}

function updateStage(stages, resultTable) {
  if (currentStage + 1 < stages.length) {
    currentStage++;
    initTest(stages);
  } else {
    showResult(resultTable);
  }
}
function showResult(resultTable) {
  const allTests = document.querySelector('.S_Test');
  allTests.innerHTML = '';

  const finalCount = document.createElement('p');
  finalCount.classList.add('.A_FinalCount');
  finalCount.innerText = `${resultCount} баллов`;
 

  const resultHeader = document.createElement('h2');
  resultHeader.classList.add('.A_ResultHeader');

  const resultText = document.createElement('p');
  resultText.classList.add('.A_ResultText');

  allTests.appendChild(finalCount);
  allTests.appendChild(resultHeader);
  allTests.appendChild(resultText);

  console.log(resultCount);


  //switch case не нужен
  //поменять на if else 
  switch (resultCount) {
    case 0:
      resultHeader.innerText = resultTable[2].header;
      resultText.innerText = resultTable[2].paragraph;
      break;
    case 1:
      resultHeader.innerText = resultTable[2].header;
      resultText.innerText = resultTable[2].paragraph;
      break;
    case 2:
      resultHeader.innerText = resultTable[2].header;
      resultText.innerText = resultTable[2].paragraph;
      break;
    case 3:
      resultHeader.innerText = resultTable[2].header;
      resultText.innerText = resultTable[2].paragraph;
      break;
    case 4:
      resultHeader.innerText = resultTable[1].header;
      resultText.innerText = resultTable[1].paragraph;
      break;
    case 5:
      resultHeader.innerText = resultTable[1].header;
      resultText.innerText = resultTable[1].paragraph;
      break;

    case 6:
      resultHeader.innerText = resultTable[0].header;
      resultText.innerText = resultTable[0].paragraph;
      break;
    case 7:
      resultHeader.innerText = resultTable[0].header;
      resultText.innerText = resultTable[0].paragraph;
      break;
  }
}

initTest(stages);
chooseAnswer(stages, resultTable);
