(function () {
    var func = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (type, fn, capture) {
        this.func = func;
        capture = capture || {};
        capture.passive = false;
        this.func(type, fn, capture);
    };
}());


let slideUp = (target, duration = 500) => {
	target.style.transitionProperty = 'height, margin, padding';
	target.style.transitionDuration = duration + 'ms';
	target.style.height = target.offsetHeight + 'px';
	target.offsetHeight;
	target.style.overflow = 'hidden';
	target.style.height = 0;
	target.style.paddingTop = 0;
	target.style.paddingBottom = 0;
	target.style.marginTop = 0;
	target.style.marginBottom = 0;
	window.setTimeout(() => {
		target.style.display = 'none';
		target.style.removeProperty('height');
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		target.style.removeProperty('overflow');
		target.style.removeProperty('transition-duration');
		target.style.removeProperty('transition-property');
	}, duration);
}


let slideDown = (target, duration = 500) => {
	target.style.removeProperty('display');
	let display = window.getComputedStyle(target).display;

	if (display === 'none') {
		display = 'block';
	}

	target.style.display = display;
	let height = target.offsetHeight;
	target.style.overflow = 'hidden';
	target.style.height = 0;
	target.style.paddingTop = 0;
	target.style.paddingBottom = 0;
	target.style.marginTop = 0;
	target.style.marginBottom = 0;
	target.offsetHeight;
	target.style.transitionProperty = "height, margin, padding";
	target.style.transitionDuration = duration + 'ms';
	target.style.height = height + 'px';
	target.style.removeProperty('padding-top');
	target.style.removeProperty('padding-bottom');
	target.style.removeProperty('margin-top');
	target.style.removeProperty('margin-bottom');
	window.setTimeout( () => {
		target.style.removeProperty('height');
		target.style.removeProperty('overflow');
		target.style.removeProperty('transition-duration');
		target.style.removeProperty('transition-property');
	}, duration);
}
  
let slideToggle = (target, duration = 500) => {
	if (window.getComputedStyle(target).display === 'none') {
		return slideDown(target, duration);
	} else {
		return slideUp(target, duration);
	}
}


function Slider(options) {
	let config = Object.assign({}, {
		container: '', //слайдер
		desktopWidth: 1024, //мінімальна ширина desktop екрана
		items: 1, //показувати слайдів
		duration: 500, //тривалість анімації
		margin: 20, //відступ між слайдами
		dots: false, //перемикачі на конкретний слайд
		fixedWidth: 0,
		responsive: {
			480: {
				items: 1,
				dots: false,
			},
			750: {
				items: 1,
				dots: false,
			},
			1024: {
				items: 1,
			}
		}
	}, options);

	const el = document.querySelector(config.container);
	const wrapEl = el.closest('.js-wrap-slider');
	const slider_inside = el.querySelector('.js-slider-inside'); //контейнер із слайдами
	const btnPrev = wrapEl.querySelector('.js-prev-slide'); //кнопка назад
	const btnNext = wrapEl.querySelector('.js-next-slide'); //кнопка вперед
	const infoActive = el.querySelector('.js-infoActive'); //для виводу інформації номер активного слайда
	const infoTotal = el.querySelector('.js-infoTotal'); //для виводу інформації всього слайдів
	let $items = config.items; //показувати слайдів
	let $margin = config.margin; //відступ між слайдами
	let $dots = config.dots; //перемикачі на конкретний слайд
	let $slides = el.querySelectorAll('.js-slide'); //слайди
	let $length = $slides.length; // кількість слайдів
	let $slide_width = 0; //ширина слайда
	let $fixedWidth = config.fixedWidth; //фіксована ширина слайда
	let $move = false; //true - слайдер рухається
	let slideIndex = 0; //індекс поточного слайда
	let posInit = 0;
	let posX1 = 0;
	let posX2 = 0;
	let posY1 = 0;
	let posY2 = 0;
	let posFinal = 0;
	let isSwipe = false;
	let isScroll = false;
	let allowSwipe = true;
	let nextTrf = 0;
	let prevTrf = 0;
	let posThreshold = 0; //поріг для переключення слайда
	let trfRegExp = /([-0-9.]+(?=px))/;
	let win_width = 0; //ширина вікна


	if (infoTotal) {
		infoTotal.textContent = $length;
	}


	function init() {
		win_width = window.innerWidth; //ширина вікна
		let slider_width = el.offsetWidth; //ширина слайдера

		if (! isEmpty(config.responsive)) {
			for (let key in config.responsive) {
				let responsive = config.responsive[key];

				if (win_width <= key) {
					$items = (responsive.items !== undefined) ? responsive.items : $items;
					$margin = (responsive.margin !== undefined) ? responsive.margin : $margin;
					$dots = (responsive.dots !== undefined) ? responsive.dots : $dots;
					$fixedWidth = (responsive.fixedWidth !== undefined) ? responsive.fixedWidth : $fixedWidth;
					break;
				}
			}
		}

		if (win_width >= config.desktopWidth) {
			$items = config.items;
			$margin = config.margin;
			$dots = config.dots;
			$fixedWidth = config.fixedWidth;
		}

		$slide_width = (slider_width - $margin * ($items - 1)) / $items;
		$slide_width = ($fixedWidth > 0) ? $fixedWidth : $slide_width;
		posThreshold = $slide_width * 0.35; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		$slides.forEach(function(item, index) {
			item.style.width = $slide_width + 'px';
			item.dataset.index = index;
		});

		slider_inside.style.width = (($slide_width + $margin) * $length) + 'px';
		
		let dots_box = el.querySelector('.slider-dots');

		if ($dots) {
			if (dots_box) {
				dots_box.classList.remove('hidden');
			} else {
				dots(); //додаємо точки
			}
		} else {
			if (dots_box) {
				dots_box.classList.add('hidden');
			}
		}
		
		moveSlider(false);
	}

	init();

	window.addEventListener('resize', function(){
		if (win_width != window.innerWidth) {
			init();
		}
	});
	
	
	// додаємо точки
	function dots() {
		let $wrapper = document.createElement('ul');
		$wrapper.className = 'slider-dots';

		for (let i = 0; i < $slides.length; i++) {
			let $class_active = (i == 0) ? 'active' : '';		
			let $item = document.createElement('li');
			$item.className = 'slider-dots-item '+ $class_active +' js-dot';
			$item.dataset.index = i;
			$item.addEventListener('click', dotClick);
			$wrapper.appendChild($item);
		}

		el.appendChild($wrapper);
	}


	function dotClick(e){
		if ($move) {
			return false;
		}
		
		let $target = e.target;
		slideIndex = parseInt($target.dataset.index);
		moveSlider();
	}


	if (btnPrev) {
		btnPrev.addEventListener('click', function(e){
			e.preventDefault();

			if ($move) {
				return false;
			}

			slideIndex--;
			moveSlider();
		});
	}


	if (btnNext) {
		btnNext.addEventListener('click', function(e){
			e.preventDefault();

			if ($move) {
				return false;
			}

			slideIndex ++;
			moveSlider();
		});
	}


	function moveSlider($animation = true) {

		if (slideIndex < 0) {
			//якщо листаємо вліво
			slideIndex = 0;
		}

		if (slideIndex > $length - $items) {
			//якщо листаємо вправо
			slideIndex = $length - $items;
		}

		$move = true;
		let $transition = 'none';

		if ($animation) {
			$transition = 'all ease '+ config.duration +'ms';
		}

		let $offset = ($slide_width + $margin) * slideIndex;
		sliderCSS($offset, $transition);
		
		//точки			
		let dots = el.querySelectorAll('.js-dot');

		if (dots.length) {
			dots.forEach(function(item) {
				item.classList.remove('active');
			});

			dots[slideIndex].classList.add('active');
		}

		//клас видимих слайдів
		$slides.forEach(function(item) {
			item.classList.remove('active');
		});

		let currentItem = $slides[slideIndex];
		currentItem.classList.add('active');

		for (let i = 0; i < $items - 1; i++) {
			currentItem = currentItem.nextElementSibling;
			currentItem.classList.add('active');
		}

		//вивід інформації номер активного слайда
		if (infoActive) {
			let n = slideIndex + 1;
			infoActive.textContent = n;
		}

		setTimeout(function() {
			$move = false;
			allowSwipe = true;
		}, config.duration);
	}


	function sliderCSS(offset, transition) {
		slider_inside.style.transform = 'translate3d(-'+ offset +'px, 0px, 0px)';
		slider_inside.style.transition = transition;
	}


	let swipeStart = function() {
		let evt = getEvent();

		if (allowSwipe) {
			nextTrf = (slideIndex + 1) * -$slide_width;
			prevTrf = (slideIndex - 1) * -$slide_width;
			posInit = posX1 = evt.clientX;
			posY1 = evt.clientY;
			slider_inside.style.transition = '';
			slider_inside.classList.add('grabbing');
			document.addEventListener('touchmove', swipeAction);
			document.addEventListener('mousemove', swipeAction);
			document.addEventListener('touchend', swipeEnd);
			document.addEventListener('mouseup', swipeEnd);
		}
	}


	let swipeAction = function() {
		let evt = getEvent();
		let style = slider_inside.style.transform;
		let transform = +style.match(trfRegExp)[0];

		posX2 = posX1 - evt.clientX;
		posX1 = evt.clientX;

		posY2 = posY1 - evt.clientY;
		posY1 = evt.clientY;

		// визначаємо дію свайп чи скролл
		if (!isSwipe && !isScroll) {
			let posY = Math.abs(posY2);
			if (posY > 7 || posX2 === 0) {
				isScroll = true;
				allowSwipe = false;
			} else if (posY < 7) {
				isSwipe = true;
			}
		}

		if (isSwipe) {
			//якщо перший слайд
			if (slideIndex == 0) {
				if (posInit < posX1) {
					return;
				} else {
					allowSwipe = true;
				}
			}

			//якщо останній слайд
			if (slideIndex == $length - $items) {
				if (posInit > posX1) {
					return;
				} else {
					allowSwipe = true;
				}
			}

			// заборона протягування далі одного слайда
			if (posInit > posX1 && transform < nextTrf || posInit < posX1 && transform > prevTrf) {
				reachEdge();
				return;
			}

			// рухаємо слайд
			slider_inside.style.transform = `translate3d(${transform - posX2}px, 0px, 0px)`;
		}
	}


	let swipeEnd = function(e) {
		posFinal = posInit - posX1;
		isScroll = false;
		isSwipe = false;
		e = e || window.event;

		if (posFinal != 0 && e.target.closest('.js-slide')) {
			e.target.addEventListener('click', (e) => {
				e.stopPropagation();
				e.preventDefault();
			}, { once: true });
		}

		document.removeEventListener('touchmove', swipeAction);
		document.removeEventListener('mousemove', swipeAction);
		document.removeEventListener('touchend', swipeEnd);
		document.removeEventListener('mouseup', swipeEnd);
		slider_inside.classList.remove('grabbing');

		if (allowSwipe) {
			if (Math.abs(posFinal) > posThreshold) {
				if (posInit < posX1) {
					slideIndex --;
				} else if (posInit > posX1) {
					slideIndex ++;
				}
			}

			if (posInit !== posX1) {
				allowSwipe = false;
				moveSlider();
			} else {
				allowSwipe = true;
			}

		} else {
			allowSwipe = true;
		}
	}


	let reachEdge = function() {
		swipeEnd();
		allowSwipe = true;
	};

	slider_inside.addEventListener('touchstart', swipeStart);
	slider_inside.addEventListener('mousedown', (e) => {
		e.preventDefault();		   
		swipeStart();
	});

	//перевірка об'єкта на пустоту
	function isEmpty(obj) {
		for (let key in obj) {
			return false;
		}
		return true;
	}

	let getEvent = function() {
		return (event.type.search('touch') !== -1) ? event.touches[0] : event;
	}
}


function modalWindow() {
	const page = document.querySelector('#page');
	let self = this;


	/* Відкрити модальне вікно
	------------------------------------------------------- */
	const modalOpen = document.querySelectorAll('.js-modal-open');
	if (modalOpen.length) {
		modalOpen.forEach((item) => {
			item.addEventListener('click', (e) => {
				e.preventDefault();
				let modalWindow = document.querySelector(e.currentTarget.dataset.id);
				self.openModalWindow(modalWindow);
			});
		});
	}


	/* Закрити модальне вікно
	------------------------------------------------------- */
	const modalClose = document.querySelectorAll('.js-modal-close');
	if (modalClose.length) {
		modalClose.forEach((item) => {
			item.addEventListener('click', (e) => {
				e.preventDefault();
				let modalWindow = document.querySelector(e.currentTarget.dataset.id);
				self.closeModalWindow(modalWindow); // закриваємо модальне вікно
			});
		});
	}


	/* Закрити модальне вікно по клику на документ
	------------------------------------------------------- */
	document.addEventListener('click', outsideModalWindow);
	document.addEventListener('touchstart', outsideModalWindow);


	function outsideModalWindow(e) {
		if (e.target.closest('.modal-box')) {
			if (e.target.closest('.js-modal')) { return; }
				let $modalOpen = document.querySelector('.modal-box.open');
				self.closeModalWindow($modalOpen); //закриваємо модальне вікно
				event.stopPropagation();
		}
	}


	/* Закрити модальне вікно по клику на клавішу "Esc"
	------------------------------------------------------- */
	document.addEventListener('keyup', (e) => {
		if (e.keyCode == 27) {
			let $modalOpen = document.querySelector('.modal-box.open');
			self.closeModalWindow($modalOpen); //закриваємо модальне вікно
		}
	});


	self.openModalWindow = $modal => {
		let $modalOpen = document.querySelector('.modal-box.open');

		if ($modalOpen) {
			$modalOpen.classList.replace('zoomIn', 'zoomOut');

			setTimeout(function() {
				$modalOpen.classList.remove('open');
				$modal.classList.remove('zoomOut');
				$modal.classList.add('open', 'zoomIn');
			}, 300);
		} else {
			widthScrollOpenModal(); //додаємо ширину скролла при відкритті модального вікна
			page.classList.add('modal-open');
			$modal.classList.remove('zoomOut');
			$modal.classList.add('open', 'zoomIn');
		}
	}


	/* Закрити модальне вікно
	------------------------------------------------------- */
	self.closeModalWindow = $modal => {
		widthScrollCloseModal(); //забираємо ширину скролла при закритті модального вікна
		page.classList.remove('modal-open');
		$modal.classList.replace('zoomIn', 'zoomOut');

		setTimeout(function() {
			$modal.classList.remove('open');
		}, 300);
	}


	/* Додаємо ширину скролла при відкритті модального вікна
	------------------------------------------------------- */
	function widthScrollOpenModal() {
		let winWidth = window.innerWidth;
		let pageWidth = document.documentElement.clientWidth;

		if (winWidth > pageWidth) {
			page.style.paddingRight = scrollWidth + 'px';
		}
	}


	/* Забираємо ширину скролла при закритті модального вікна
	------------------------------------------------------- */
	function widthScrollCloseModal() {
		page.style.paddingRight = 0;
	}


	/* Визначаємо ширину скролла
	------------------------------------------------------- */
	//створимо елемент з прокруткою
	let div = document.createElement('div');

	div.style.overflowY = 'scroll';
	div.style.width = '50px';
	div.style.height = '50px';

	//ми повинні вставити елемент в документ, інакше розміри будуть рівні 0
	page.appendChild(div);
	let scrollWidth = div.offsetWidth - div.clientWidth;
	div.remove();
}


const langObj = {
	ru: {
		s1t1: 'Основной функционал',
		s1t2: 'Получение дивидендов от игры <span>METOLAND</span> и любой деятельности платформы <span>Metoshi</span>',
		s2t1: 'Преимущества <span>Уставного</span>',
		s2t2: 'токена <span>OSHI</span>',
		s2t3: 'Пассивный доход и дивиденды каждому холдеру <span>OSHI</span> от продажи всех Игровых <span class="gradient-pink">NFTs METOLAND</span> и иных <span>NFTs</span> платформы <span>Metoshi</span>',
		s3t1: 'Платформа',
		s3t2: 'Metoshi',
		s3t3: 'сегодня:',
		s3t4: 'Токен <span class="gradient-yellow">МЕТО</span> успешно торгуется на <span class="gradient-purple">Pancakeswap</span>',
		s3t5: 'Готова игра <span class="gradient-purple">METOLAND</span> - <span class="gradient-yellow">P2E & F2P</span>',
		s3t6: 'Игровая <span class="gradient-yellow">NFTs</span> коллекция',
		s3t7: 'Коллекция комиксов о красной панде <span class="gradient-yellow">Metoshi</span>',
		s5t1: 'Токеномика',
		rd1: '<span>1</span> Апрель - Май: <strong>IDO OSHI</strong>',
		rd2: '<span>2</span> Май: <strong>OSHI листинг</strong>',
		rd3: '<span>3</span> Май',
		rt3: 'Первые дивиденды от продажи игровых NFTs METOLAND',
		rd4: '<span>4</span> Май',
		rt4: 'Дивиденды от второй продажи игровых NFTs METOLAND',
		rd5: '<span>5</span> Июнь - Июль',
		rt5: 'Дивиденды от продажи генеративной коллекции NFTs',
		rd6: '<span>6</span> Август',
		rt6: 'Дивиденды от продажи игровых NFTs METOLAND 2.0',
		rd7: '<span>7</span> Сентябрь - Октябрь',
		rt7: 'Дивиденды от первой продажи NFT земель во вселенной MetOverse METOLAND ',
		qu1: 'Что такое Метоши?',
		an1: 'METOSHI - это универсальная развлекательная платформа, объединяющая студию комиксов, Metoshi Маркетплейс и MetoshiGameFI.',
		qu2: 'Что такое платформа Metoshi?',
		an2: 'METOSHI - это универсальная развлекательная платформа, объединяющая студию комиксов и студию Metoshi GameFI.',
		qu3: 'Что такое токен OSHI?',
		an3: 'Это уставной токен, который предоставляет право совместного владения платформой Metoshi, получения дивидендов и голосования, а также других преимуществ Экосистемы.',
		qu4: 'Как я могу купить или продать токен OSHI?',
		an4: 'На первом этапе IDO, ограниченное количество можно приобрести с помощью токена METO, а также на бирже после листинга. Вы можете продать токен OSHI после листинга.',
		qu5: 'Какой блокчейн использует Metoshi?',
		an5: 'Binance Smart Chain. Это блокчейн, который обеспечивает масштабируемые, безопасные и мгновенные транзакции.',
		qu6: 'Каковы преимущества токена METO?',
		an6: 'Токен METO - это утилитарный токен BEP-20 платформы Metoshi. METO торгуется на PanCakeSwap, также все сервисы Metoshi предоставляются только за METO',
		qu7: 'Для чего нужен Comics NFT?',
		an7: '<li>- Собрав комиксы NFT определенного сезона, вы получите гарантированное распределение в крутых играх платформы Metoshi.</li><li>- Это даст вам статус “владелец комикса”, что, в свою очередь, даст вам множество дополнительных привилегий и возможностей, таких как гарантированные аллокации во всех предпродажах Метоши.</li>',
		link1: 'https://t.me/metoshi_rus'
	},
	en: {
		s1t1: 'Core functions of',
		s1t2: 'Earn dividends from <strong>METOLAND</strong> game and on any activity of the <strong>Metoshi Platform</strong>',
		s2t1: 'Why should you <span>buy</span>',
		s2t2: '<span>Governance</span> Token Oshi:',
		s2t3: 'Passive income and dividends to each <span>OSHI</span> holder from the sale of all <span class="gradient-pink">METOLAND Gaming</span> NFTs and other <span>Metoshi NFT platforms</span>',
		s3t1: 'Metoshi',
		s3t2: 'Platform',
		s3t3: 'today:',
		s3t4: '<span class="gradient-yellow">METO</span> token is successfully traded on <span class="gradient-purple">Pancakeswap</span>',
		s3t5: '<span class="gradient-purple">METOLAND</span> game is ready – P2E & F2P',
		s3t6: 'Gaming <span class="gradient-yellow">NFT</span> Collection',
		s3t7: '<span class="gradient-yellow">Collection</span> of comics about Red Panda <span class="gradient-purple">Metoshi</span>',
		s5t1: 'Tokenomics',
		rd1: '<span>1</span> April - May: <strong>OSHI IDO</strong>',
		rd2: '<span>2</span> May: <strong>OSHI LISTING</strong>',
		rd3: '<span>3</span> May',
		rt3: 'First dividends of first selling of METOLAND Gaming NFTs',
		rd4: '<span>4</span> May',
		rt4: 'Dividends of second selling of METOLAND Gaming NFTs',
		rd5: '<span>5</span> June - Jule',
		rt5: 'Dividends of selling Metoshi generative NFTs',
		rd6: '<span>6</span> August',
		rt6: 'Dividends of selling METOLAND 2.0 Gaming NFTs',
		rd7: '<span>7</span> September - October',
		rt7: 'Dividends of selling first MetOverse Metoland NFT Lands',
		qu1: 'Who is Metoshi?',
		an1: 'METOSHI is a one-stop entertainment platform that combines a Comics Studio and Metoshi GameFI Studio.',
		qu2: 'What is a Governance OSHI Token',
		an2: 'It is a Governance Token. Furthermore - earn dividends & vote, as well as other perks of the Ecosystem',
		qu3: 'How can I buy or sell Governance OSHI Token',
		an3: 'At the first stage there was a IDO, a limited amount can be purchased with the METO token, and on the exchange after listing. You can sell Governance OSHI Token after listing.',
		qu4: 'What are the benefits of the OSHI token?',
		an4: '<ul><li>• Regular accrual of dividends for holding the OSHI token</li><li>• Participation in voting on key decisions</li></ul>',
		qu5: 'What blockchain does Metoshi use?',
		an5: 'Binance Smart Chain. It is a blockchain that enables scalable, secure, and instant transactions. For the first and second quarters of 2022.',
		qu6: 'What are the utilities of METO token?',
		an6: 'METO Token is a BEP-20 utility token of Metoshi Platform. METO is live on PancakeSwap, all Metoshi services will be supplied only for METO',
		qu7: 'What NFT tools are offered on Metoshi Platform?',
		an7: '<li>1) In-game NFTs - game heroes, wearables, weapons, etc.</li><li>2) Comics NFT  - After collecting the entire collection, you can get guaranteed Metoshi pre-sale allocations.</li><li>3) Collectible / Generative NFT (Farming)</li>',
		link1: 'https://t.me/metoshi_redpanda'
	}
}


document.addEventListener('DOMContentLoaded', function() {
	
	
	/* Меню на мобільних пристроях
	------------------------------------------------------- */
	let page = document.querySelector('#page');
	let menu = document.querySelector('#js-menu');
	
	
	document.querySelector('#js-menu-open').addEventListener('click', (e) => {
		e.preventDefault();
		menu.classList.add('open');
		page.classList.add('form-open');
	});
	
	
	document.querySelector('#js-menu-close').addEventListener('click', (e) => {
		e.preventDefault();
		menu.classList.remove('open');
		page.classList.remove('form-open');
	});

	document.addEventListener('click', closeMenu);
	document.addEventListener('touchstart', closeMenu);

	function closeMenu(e) {
		if (e.target.closest('#js-menu-open')) { return; }

		if (menu.classList.contains('open')) {
			if (e.target.closest('#js-menu')) { return; }
				menu.classList.remove('open');
				page.classList.remove('form-open');
				event.stopPropagation();
		}
	}
	
	
	/* Модальне вікно
	------------------------------------------------------- */
	new modalWindow();
	
	
	/* Зміна мови
	------------------------------------------------------- */
	function switchLang() {
		let btn = document.querySelectorAll('.js-language');
		if (btn.length) {
			btn.forEach((item) => {
				item.addEventListener('click', (e) => {
					e.preventDefault();
					handleSwitchLang(item);
				});
			});
		}
		
		
		function handleSwitchLang(item) {
			let lang = item.dataset.lang;
			let words = langObj[lang];
			
			for (let key in words) {
				let el = document.querySelector('.js-lang-'+ key);
				
				if (key === 'link1') {
					el.setAttribute('href', words[key]);
				} else {
					el.innerHTML = words[key];
				}
			}
			
			btn.forEach((item2) => {
				item2.classList.remove('active');
			});
			
			item.classList.add('active');
			page.classList.remove(item.dataset.toggle);
			page.classList.add(lang);
		}
	}
	
	switchLang();
	
	
	/* Слайдер
	------------------------------------------------------- */
	if (document.querySelector('#js-slider')) {
		new Slider({
			container: '#js-slider',
			dots: true,
		});
	}
	
	
	/* FAQ
	------------------------------------------------------- */
	let AnimationAccordion = false;
	let questions = document.querySelectorAll('.js-question');
	if (questions.length) {
		questions.forEach((item) => {
			item.addEventListener('click', (e) => {
				e.preventDefault();
				
				if (AnimationAccordion) {
					return;
				}
				
				AnimationAccordion = true;
				
				if (! item.classList.contains('active')) {
					questions.forEach((item2) => {
						if (item !== item2) {
							item2.classList.remove('active');
							slideUp(item2.nextElementSibling);
						}
					});
				}
				
				item.classList.toggle('active');
				slideToggle(item.nextElementSibling);
				
				window.setTimeout(() => {
					AnimationAccordion = false;
				}, 500);
			});
		});
	}
	
	
	/* Скролл до елементу
	------------------------------------------------------- */
	let getElements = document.querySelectorAll('.js-scroll-to');
	if (getElements.length) {
		getElements.forEach((item) => {
			item.addEventListener('click', (e) => {
				e.preventDefault();
				let el = document.querySelector(item.dataset.id);
				scrollTo(el);
			});
		});
	}
	
	function scrollTo(el) {
		let rectTop = el.getBoundingClientRect().top;
		let duration = 500; //тривалість анімації
		let start = Date.now(); //час початку анімації
		let factor = 0; //коефіцієнт інтерполяції
		let offset = window.pageYOffset;
		let timer;

		if (timer) {
			clearInterval(timer); //зупинити будь -яку запущену анімацію
		}

		function step() {
			let y;
			factor = (Date.now() - start) / duration; //отримати коефіцієнт інтерполяції

			if (factor >= 1) {
				clearInterval(timer); //зупинити анімацію
				factor = 1; // кліп до максимуму 1.0
			}

			y = factor * rectTop + offset;
			window.scrollBy(0, y - window.pageYOffset);
		}

		timer = setInterval(step, 10);

		menu.classList.remove('open');
		page.classList.remove('form-open');
	}
	
	
	
});


/* Lazy Load YouTube Videos
------------------------------------------------------- */
(function() {
	let youtube = document.querySelectorAll('.js-youtube');

	for (let i = 0; i < youtube.length; i++) {
		youtube[i].addEventListener('click', function() {
			let iframe = document.createElement('iframe');

			iframe.setAttribute('frameborder', '0');
			iframe.setAttribute('allowfullscreen', '');
			iframe.setAttribute('src', 'https://www.youtube.com/embed/'+ this.dataset.embed +'?rel=0&showinfo=0&autoplay=1');

			this.innerHTML = '';
			this.appendChild(iframe);
		});
	}
})();





$(document).ready(function() {
const stats = $('#js-stats');
	var wheight = $(window).height();
	$(window).scroll(function() {
		var curScrollTop = $(window).scrollTop();
		
		
		function progress() {
			var thisPosTop = stats.offset().top;
			
			if ((wheight + curScrollTop - (wheight * 0.35)) > thisPosTop) {
				if (stats.hasClass('started')) {
					return;
				} else {
					stats.addClass('started');

					$('.js-progress').each(function(){
						let $this = $(this);
						let fill = $this.find('.js-fill');
						let $val = $this.find('.js-value');
						let perc = parseFloat($val.text());

						$({p:0}).animate({p:perc}, {
							duration: 1500,
							step: function(p){
								fill.css({
									transform: "rotate("+ ((p*1.8*2)) +"deg)", // 100%=180Ã‚Â° so: Ã‚Â° = % * 1.8
								});
								$val.text(p|0);
							},
							complete: function(){
								$val.text(perc);
							}
						})
					});
				}
			}
		}
		
		progress();
		
		
		
		
		$('.roadmap-item').each(function() {
			let $this = $(this);
			let thisPosTop = $this.offset().top;
			
			if ((wheight + curScrollTop - (wheight * 0.45)) > thisPosTop) {
				$this.addClass('viewed');
			} else {
				$this.removeClass('viewed');
			}
		});
		
		
		
		function fixedImg() {
			let $padding = 192;
			
			if ($(window).width() <= 1024) {
				$padding = 110;
			}
			
			let $wrap = $('#js-roadmap');
			let $img = $('#js-roadmap-img');
			let h_lead_wrap_pos = $wrap.offset().top;
			let	h_lead_wrap_h = $wrap.outerHeight();
			let	h_lead_h = $img.outerHeight();

			if (curScrollTop > h_lead_wrap_pos + $padding) {
				if ((curScrollTop + h_lead_h) < (h_lead_wrap_pos + h_lead_wrap_h )) {
					$img.css("transform","translate(0, " + (curScrollTop - h_lead_wrap_pos) + "px)").removeClass('static');
				}			
			} else {
				$img.css("transform","translate(0, 0)").addClass('static');
			}
		}
		
		fixedImg();
	});
});
