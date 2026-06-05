const phrases = [
  "Мария, добрый день!\n\nЯ секретарь Максима. Он поручил мне важное задание. Можем его обсудить прямо сейчас??",
  "Нажмите мне на жевот, Мария",
  "Спасибо, Мария!! Продолжим??",
  "Так вот, мне поручено передать вам приглашение на свидание с Максимом.\n\nВы согласны его принять, Мария??",
  "Безумное сожаление.... Я направлю письмо с вашем решением на почту Максиму. Спасибо!",
  "Вау! Мария, вы великолепны!! Отличное решение! На случай выбора этого варианта Максим просил передать вам кое-что.\n\nНажмите \"Скачать кое-что\"\n(это не вирус)",
  "Я передал вам кое-что, теперь вам нужно будет выбрать время и место для свидания.\n\nВы готовы?",
  "Добрый день, Мария!\n\nЯ старший секретарь Максима и занимаюсь подбором времени и места для вашего свидания! Выберите удобное время для встречи.",
  "Ага, я запомнил!\n\nТеперь нужно определиться с местом. Пожалуйста, ознакомтесь с вариантами на карте.",
  "Отлично!!\n\nНо перед этим прошу вас сделать *chponk* мне по носу...",
  "Спасибо, Мария!\nТеперь выберите места, которые вам понравились и я передам их Максиму.",
  "Супер!!\n\nМы сделали все дела! Надеемся, вы хорошо проведёте время!\n\nХорошего денёчка, Мария, вы прекрасная!!!",
];

const dialogText = document.querySelector("#dialogText");
const nextButton = document.querySelector("#nextButton");
const choiceButtons = document.querySelector("#choiceButtons");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const effectLayer = document.querySelector("#effectLayer");
const catButton = document.querySelector("#catButton");
const dateMap = document.querySelector("#dateMap");
const mapReadyButton = document.querySelector("#mapReadyButton");
const timeForm = document.querySelector("#timeForm");
const meetingTimeInput = document.querySelector("#meetingTime");
const timeSubmitButton = document.querySelector("#timeSubmitButton");
const placesForm = document.querySelector("#placesForm");
const placesSubmitButton = document.querySelector("#placesSubmitButton");
const seniorDoneButton = document.querySelector("#seniorDoneButton");
const heartButton = document.querySelector("#heartButton");
const finalCatWrap = document.querySelector("#finalCatWrap");
const dialogWrap = document.querySelector(".dialog-wrap");
const dialogBoxImage = document.querySelector("#dialogBoxImage");
const downloadGiftLink = document.querySelector("#downloadGiftLink");
const meowSound = new Audio("meowrgh.mp3");
const seniorMeowSound = new Audio("gary_meow.mp3");
const formspreeEndpoint = "https://formspree.io/f/xqejjdrw";

let phraseIndex = 0;
let letterIndex = 0;
let typingTimer;
let shouldShowButton = true;
let step = "intro";
let noEscapeCount = 0;
let noDecisionSent = false;
let yesPlacesSent = false;
let hasHoveredMap = false;
let selectedMeetingTime = "";
const noEscapeLimit = 9;

function typePhrase({ showButton = shouldShowButton } = {}) {
  const phrase = phrases[phraseIndex];
  shouldShowButton = showButton;

  dialogText.classList.remove("is-done");
  nextButton.classList.remove("is-visible");
  dialogText.textContent = phrase.slice(0, letterIndex);

  if (letterIndex <= phrase.length) {
    letterIndex += 1;
    typingTimer = window.setTimeout(typePhrase, 45);
    return;
  }

  dialogText.classList.add("is-done");
  if (shouldShowButton) {
    nextButton.classList.add("is-visible");
  }

  if (step === "invitation-typing") {
    step = "choosing";
    choiceButtons.hidden = false;
  }

  if (step === "yes-typing") {
    step = "ready-to-download";
    nextButton.hidden = false;
    nextButton.textContent = "Скачать кое-что";
    nextButton.classList.add("is-visible");
  }

  if (step === "download-complete-typing") {
    step = "ready-to-pick-place";
    nextButton.hidden = false;
    nextButton.textContent = "Готова!";
    nextButton.classList.add("is-visible");
  }

  if (step === "time-intro-typing") {
    step = "time-selecting";
    showTimeForm();
  }

  if (step === "map-intro-typing") {
    step = "place-picker";
    showDateMap();
  }

  if (step === "senior-nose-typing") {
    step = "senior-nose-ready";
  }

  if (step === "senior-replay" && phraseIndex === 10) {
    showPlacesForm();
  }

  if (step === "goodbye-typing") {
    step = "goodbye";
    showHeartButton();
  }
}

nextButton.addEventListener("click", () => {
  if (step === "ready-to-download") {
    downloadCatFlower();
    showDownloadComplete();
    return;
  }

  if (step === "ready-to-pick-place") {
    showTimePicker();
    return;
  }

  if (step === "cat-clicked") {
    showInvitation();
    return;
  }

  if (step !== "intro") {
    return;
  }

  phraseIndex = 1;
  letterIndex = 0;
  step = "waiting-for-cat";
  shouldShowButton = false;
  nextButton.classList.remove("is-visible");
  nextButton.hidden = true;
  window.clearTimeout(typingTimer);
  typePhrase();
});

function playMeow() {
  if (step === "senior-nose-ready") {
    step = "senior-sound-playing";
    seniorMeowSound.currentTime = 0;
    seniorMeowSound.addEventListener("ended", showSeniorFinalText, { once: true });
    seniorMeowSound.play().catch(() => {
      step = "senior-nose-ready";
    });
    return;
  }

  if (step === "senior-replay") {
    seniorMeowSound.currentTime = 0;
    seniorMeowSound.play().catch(() => {});
    return;
  }

  const canStartFirstMeow =
    step === "waiting-for-cat" && dialogText.classList.contains("is-done");
  const canReplayMeow = step === "cat-clicked";

  if (!canStartFirstMeow && !canReplayMeow) {
    return;
  }

  if (canStartFirstMeow) {
    step = "meow-playing";
    meowSound.addEventListener("ended", showCatThanks, { once: true });
  }

  meowSound.currentTime = 0;
  meowSound.play().catch(() => {});
}

function showCatThanks() {
  step = "cat-clicked";
  phraseIndex = 2;
  letterIndex = 0;
  nextButton.hidden = false;
  nextButton.textContent = "Продолжаем, мистер кот";
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: true });
}

function showInvitation() {
  step = "invitation-typing";
  phraseIndex = 3;
  letterIndex = 0;
  shouldShowButton = false;
  nextButton.classList.remove("is-visible");
  nextButton.hidden = true;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

function showTimePicker() {
  step = "time-intro-typing";
  phraseIndex = 7;
  letterIndex = 0;
  shouldShowButton = false;
  nextButton.classList.remove("is-visible");
  nextButton.hidden = true;
  catButton.classList.add("is-senior");
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

function showTimeForm() {
  timeForm.hidden = false;
  timeForm.classList.add("is-empty");
  timeSubmitButton.hidden = true;
  timeSubmitButton.disabled = true;
  timeSubmitButton.classList.remove("is-visible");
  meetingTimeInput.focus({ preventScroll: true });
  requestAnimationFrame(() => timeForm.classList.add("is-visible"));
}

function hideTimeForm() {
  timeForm.classList.remove("is-visible");
  timeSubmitButton.classList.remove("is-visible");
  timeSubmitButton.hidden = true;
  window.setTimeout(() => {
    timeForm.hidden = true;
  }, 360);
}

meetingTimeInput.addEventListener("input", () => {
  const formattedTime = formatMeetingTime(meetingTimeInput.value);
  meetingTimeInput.value = formattedTime;

  const hasTime = isValidMeetingTime(formattedTime);

  timeForm.classList.toggle("is-empty", formattedTime === "");
  timeSubmitButton.disabled = !hasTime;

  if (hasTime) {
    timeSubmitButton.hidden = false;
    requestAnimationFrame(() => timeSubmitButton.classList.add("is-visible"));
    return;
  }

  timeSubmitButton.classList.remove("is-visible");
  timeSubmitButton.hidden = true;
});

function formatMeetingTime(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    if (digits.length === 2) {
      return String(Math.min(Number(digits), 23)).padStart(2, "0");
    }

    return digits;
  }

  const hours = String(Math.min(Number(digits.slice(0, 2)), 23)).padStart(2, "0");
  const minuteDigits = digits.slice(2);

  if (minuteDigits.length === 1) {
    return `${hours}:${minuteDigits}`;
  }

  const minutes = String(Math.min(Number(minuteDigits), 59)).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function isValidMeetingTime(value) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours <= 23 && minutes <= 59;
}

function confirmMeetingTime() {
  if (!isValidMeetingTime(meetingTimeInput.value)) {
    return;
  }

  selectedMeetingTime = meetingTimeInput.value;
  timeSubmitButton.disabled = true;
  hideTimeForm();
  showMapIntro();
}

timeSubmitButton.addEventListener("click", confirmMeetingTime);

timeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  confirmMeetingTime();
});

function showMapIntro() {
  step = "map-intro-typing";
  phraseIndex = 8;
  letterIndex = 0;
  shouldShowButton = false;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

function showDateMap() {
  dateMap.hidden = false;
  requestAnimationFrame(() => dateMap.classList.add("is-visible"));
}

dateMap.addEventListener("mouseenter", () => {
  if (hasHoveredMap || dateMap.hidden) {
    return;
  }

  hasHoveredMap = true;
  mapReadyButton.hidden = false;
  requestAnimationFrame(() => mapReadyButton.classList.add("is-visible"));
});

mapReadyButton.addEventListener("click", () => {
  if (step !== "place-picker") {
    return;
  }

  showSeniorNosePrompt();
});

function showSeniorNosePrompt() {
  step = "senior-nose-typing";
  phraseIndex = 9;
  letterIndex = 0;
  shouldShowButton = false;
  mapReadyButton.classList.remove("is-visible");
  mapReadyButton.hidden = true;
  dateMap.classList.remove("is-visible");
  window.setTimeout(() => {
    dateMap.hidden = true;
  }, 520);
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

function showSeniorFinalText() {
  step = "senior-replay";
  phraseIndex = 10;
  letterIndex = 0;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

function showPlacesForm() {
  if (!placesForm.hidden) {
    return;
  }

  placesForm.hidden = false;
  requestAnimationFrame(() => placesForm.classList.add("is-visible"));
}

function getSelectedPlaces() {
  return Array.from(placesForm.querySelectorAll('input[name="place"]:checked')).map((checkbox) => ({
    name: checkbox.value,
    link: checkbox.dataset.link,
  }));
}

placesForm.addEventListener("change", () => {
  placesSubmitButton.disabled = getSelectedPlaces().length === 0;
});

placesForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedPlaces = getSelectedPlaces();

  if (selectedPlaces.length === 0 || yesPlacesSent) {
    return;
  }

  yesPlacesSent = true;
  placesSubmitButton.disabled = true;
  placesSubmitButton.textContent = "Отправляю...";

  const placesText = selectedPlaces.map((place) => place.name).join(", ");
  const formData = new FormData();
  formData.append("name", "invitation to a date");
  formData.append("email", "maria@example.com");
  formData.append(
    "message",
    `Маша согласилась на свидание.\nВремя встречи: ${selectedMeetingTime || "не указано"}.\nВыбранные места: ${placesText}.`,
  );

  fetch(formspreeEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Formspree error: ${response.status}`);
      }

      placesSubmitButton.textContent = "Отправлено!";
      seniorDoneButton.hidden = false;
      requestAnimationFrame(() => seniorDoneButton.classList.add("is-visible"));
    })
    .catch((error) => {
      console.error(error);
      yesPlacesSent = false;
      placesSubmitButton.disabled = false;
      placesSubmitButton.textContent = "Не ушло, повторить";
    });
});

seniorDoneButton.addEventListener("click", () => {
  showGoodbyeScene();
});

function showGoodbyeScene() {
  if (step === "goodbye-typing" || step === "goodbye") {
    return;
  }

  step = "goodbye-typing";
  placesForm.classList.remove("is-visible");
  seniorDoneButton.classList.remove("is-visible");
  seniorDoneButton.hidden = true;
  window.setTimeout(() => {
    placesForm.hidden = true;
  }, 360);

  dialogBoxImage.src = "double_dialog_box.png?v=2";
  dialogWrap.classList.add("is-final");
  finalCatWrap.hidden = false;
  requestAnimationFrame(() => finalCatWrap.classList.add("is-visible"));

  phraseIndex = 11;
  letterIndex = 0;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
  showHeartButton();
  window.setTimeout(showHeartButton, 1200);
  window.setTimeout(showHeartButton, phrases[phraseIndex].length * 38 + 700);
}

function showHeartButton() {
  if (step !== "goodbye" && step !== "goodbye-typing") {
    return;
  }

  heartButton.hidden = false;
  heartButton.removeAttribute("hidden");
  heartButton.style.display = "flex";
  requestAnimationFrame(() => heartButton.classList.add("is-visible", "is-force-visible"));
}

heartButton.addEventListener("click", () => {
  launchFallingEmojiFirework(heartButton, ["💞", "❤️", "🌸", "🌷", "💖"]);
});

function launchFallingEmojiFirework(sourceButton, emojis) {
  const rect = sourceButton.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2 + 50;

  for (let index = 0; index < 86; index += 1) {
    const emoji = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 300;

    emoji.className = "falling-emoji";
    emoji.textContent = emojis[index % emojis.length];
    emoji.style.setProperty("--x", `${originX}px`);
    emoji.style.setProperty("--y", `${originY}px`);
    emoji.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    emoji.style.setProperty("--pop-y", `${Math.sin(angle) * 130 - 90}px`);
    emoji.style.setProperty("--floor-y", `${window.innerHeight - originY - 36 - Math.random() * 28}px`);
    emoji.style.setProperty("--rotate", `${Math.round(Math.random() * 240 - 120)}deg`);
    emoji.style.setProperty("--size", `${28 + Math.round(Math.random() * 24)}px`);
    emoji.style.animationDelay = `${Math.random() * 500}ms`;

    effectLayer.append(emoji);
  }
}

function downloadCatFlower() {
  downloadGiftLink.click();
}

function showDownloadComplete() {
  step = "download-complete-typing";
  phraseIndex = 6;
  letterIndex = 0;
  shouldShowButton = false;
  nextButton.classList.remove("is-visible");
  nextButton.hidden = true;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

function moveNoButton() {
  const buttonRect = noButton.getBoundingClientRect();
  const margin = 24;
  const maxLeft = Math.max(margin, window.innerWidth - buttonRect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - buttonRect.height - margin);
  let left = margin;
  let top = margin;
  let foundSpot = false;

  for (let attempt = 0; attempt < 90; attempt += 1) {
    const candidateLeft = Math.round(margin + Math.random() * (maxLeft - margin));
    const candidateTop = Math.round(margin + Math.random() * (maxTop - margin));
    const candidateRect = {
      left: candidateLeft,
      top: candidateTop,
      right: candidateLeft + buttonRect.width,
      bottom: candidateTop + buttonRect.height,
    };

    if (!doesOverlapBlockedArea(candidateRect)) {
      left = candidateLeft;
      top = candidateTop;
      foundSpot = true;
      break;
    }
  }

  if (!foundSpot) {
    const fallbackPositions = [
      [maxLeft, maxTop],
      [margin, maxTop],
      [maxLeft, margin],
      [window.innerWidth / 2 - buttonRect.width / 2, maxTop],
      [window.innerWidth / 2 - buttonRect.width / 2, margin],
    ];

    const fallback = fallbackPositions.find(([candidateLeft, candidateTop]) => {
      const candidateRect = {
        left: candidateLeft,
        top: candidateTop,
        right: candidateLeft + buttonRect.width,
        bottom: candidateTop + buttonRect.height,
      };

      return !doesOverlapBlockedArea(candidateRect);
    });

    if (fallback) {
      left = Math.round(fallback[0]);
      top = Math.round(fallback[1]);
    }
  }

  noButton.classList.add("is-running");
  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
}

function doesOverlapBlockedArea(rect) {
  const blockedSelectors = [
    "#catButton",
    ".dialog-wrap",
    "#yesButton",
    "#nextButton:not([hidden])",
    "#dateMap:not([hidden])",
  ];
  const safeGap = 18;

  return blockedSelectors.some((selector) => {
    const element = document.querySelector(selector);

    if (!element) {
      return false;
    }

    const area = element.getBoundingClientRect();

    if (area.width === 0 || area.height === 0) {
      return false;
    }

    return !(
      rect.right < area.left - safeGap ||
      rect.left > area.right + safeGap ||
      rect.bottom < area.top - safeGap ||
      rect.top > area.bottom + safeGap
    );
  });
}

noButton.addEventListener("mouseenter", () => {
  if (noEscapeCount >= noEscapeLimit) {
    return;
  }

  noEscapeCount += 1;
  moveNoButton();
});

noButton.addEventListener("click", (event) => {
  if (noEscapeCount < noEscapeLimit) {
    event.preventDefault();
    moveNoButton();
    noEscapeCount += 1;
    return;
  }

  showNoRegret();
});

function showNoRegret() {
  if (step === "no-regret") {
    return;
  }

  step = "no-regret";
  launchEmojiFirework(noButton);
  choiceButtons.hidden = true;
  sendNoDecision();

  phraseIndex = 4;
  letterIndex = 0;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
}

yesButton.addEventListener("click", () => {
  if (step !== "choosing") {
    return;
  }

  step = "yes-typing";
  launchEmojiFirework(yesButton, ["🌸", "❤️", "💞"]);
  choiceButtons.hidden = true;
  phraseIndex = 5;
  letterIndex = 0;
  window.clearTimeout(typingTimer);
  typePhrase({ showButton: false });
});

function sendNoDecision() {
  if (noDecisionSent) {
    return;
  }

  noDecisionSent = true;

  const formData = new FormData();
  formData.append("name", "invitation to a date");
  formData.append("email", "maria@example.com");
  formData.append(
    "message",
    `Маша нажала кнопку "Нет". Количество попыток поймать кнопку: ${noEscapeCount}.`,
  );

  fetch(formspreeEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Formspree error: ${response.status}`);
      }
    })
    .catch((error) => {
      console.error(error);
      noDecisionSent = false;
    });
}

function launchEmojiFirework(sourceButton, emojis = ["😭", "💔", "😖"]) {
  const rect = sourceButton.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let index = 0; index < 72; index += 1) {
    const emoji = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 280;

    emoji.className = "emoji-burst";
    emoji.textContent = emojis[index % emojis.length];
    emoji.style.setProperty("--x", `${originX}px`);
    emoji.style.setProperty("--y", `${originY}px`);
    emoji.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    emoji.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    emoji.style.setProperty("--rotate", `${Math.round(Math.random() * 180 - 90)}deg`);
    emoji.style.setProperty("--size", `${30 + Math.round(Math.random() * 26)}px`);
    emoji.style.animationDelay = `${Math.random() * 1200}ms`;

    effectLayer.append(emoji);
    emoji.addEventListener("animationend", () => emoji.remove(), { once: true });
  }
}

catButton.addEventListener("click", playMeow);
catButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    playMeow();
  }
});

window.addEventListener("load", () => {
  window.setTimeout(typePhrase, 900);
});

// DEBUG START: quick jump to final scene. Remove this block before publishing.
function debugGoFinal() {
  window.clearTimeout(typingTimer);

  step = "goodbye";
  phraseIndex = 11;
  letterIndex = phrases[11].length + 1;

  placesForm.hidden = true;
  placesForm.classList.remove("is-visible");
  timeForm.hidden = true;
  timeForm.classList.remove("is-visible");
  timeSubmitButton.hidden = true;
  timeSubmitButton.classList.remove("is-visible");
  seniorDoneButton.hidden = true;
  seniorDoneButton.classList.remove("is-visible");
  choiceButtons.hidden = true;
  dateMap.hidden = true;
  dateMap.classList.remove("is-visible");
  mapReadyButton.hidden = true;
  mapReadyButton.classList.remove("is-visible");
  nextButton.hidden = true;
  nextButton.classList.remove("is-visible");

  dialogBoxImage.src = "double_dialog_box.png?v=2";
  dialogWrap.classList.add("is-final");
  catButton.classList.add("is-senior");

  finalCatWrap.hidden = false;
  finalCatWrap.classList.add("is-visible");

  dialogText.textContent = phrases[11];
  dialogText.classList.add("is-done");

  showHeartButton();
  console.log("heart debug", {
    hidden: heartButton.hidden,
    classes: heartButton.className,
    rect: heartButton.getBoundingClientRect(),
    display: window.getComputedStyle(heartButton).display,
    opacity: window.getComputedStyle(heartButton).opacity,
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f") {
    debugGoFinal();
  }
});
// DEBUG END: quick jump to final scene.
