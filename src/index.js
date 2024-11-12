import LVStylesHandler from './LVStylesHandler';

/**
 * Final Class
 * Sets up the component
 *
 * @link https://github.com/slightlyoff/lite-vimeo
 */
class LiteVimeo extends LVStylesHandler {
	constructor() {
		super();
		this.setupDom();
	}

	/**
	 * Define our shadowDOM for the component
	 */
	setupDom() {
		if (!this.shadowRoot) {
			this.shadowRoot = this.attachShadow({ mode: 'open' });
		} else {
			this.shadowRoot.innerHTML = '';
		}
		this.shadowRoot.innerHTML = this.addStyles() + this.addPictureElement();
		this.domRefFrame = this.shadowRoot.querySelector('#frame');
		this.domRefImg = {
			fallback: this.shadowRoot.querySelector('#fallbackPlaceholder'),
			webp: this.shadowRoot.querySelector('#webpPlaceholder'),
			jpeg: this.shadowRoot.querySelector('#jpegPlaceholder'),
		};
		this.domRefPlayButton = this.shadowRoot.querySelector('.lvo-playbtn');
	}

	connectedCallback() {
		if (!this.shadowRoot) {
			this.shadowRoot = this.attachShadow({ mode: 'open' });
		}
		this.addEventListener('pointerover', LiteVimeo.warmConnections, {
			once: true,
		});

		this.addEventListener('click', () => this.addIframe());
	}

	/**
	 * Inject the iframe into the component body
	 */
	addIframe() {
		if (!this.iframeLoaded) {
			const queryParams = this.getIFrameParams();
			const url = `/video/${this.videoId}${
				this.isUnlisted
					? `?h=${this.hash}&${queryParams}`
					: `?${queryParams}`
			}`;

			const srcUrl = new URL(url, 'https://player.vimeo.com/');

			const iframeHTML = `
			<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope" allowfullscreen autoplay="true" ${
				this.autoPlay ? `muted="true"` : ''
			} src="${srcUrl}"></iframe>`;
			this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
			this.domRefFrame.classList.add('lvo-activated');
			this.iframeLoaded = true;
		}
	}

	/**
	 * Gets the Vimeo iFrame src parameters
	 *
	 * @returns {string} the iframe parameters
	 */
	getIFrameParams() {
		let params = 'hd=1&autohide=1&autoplay=1';
		params += this.loop ? '&loop=1' : '';
		params += this.enableTracking ? '' : '&dnt=1';
		params += this.autoPlay ? '&muted=1' : '';
		params += this.videoStartAt ? `&#t=${this.videoStartAt}` : '';
		return params;
	}

	/**
	 * Parse our attributes and fire up some placeholders
	 */
	setupComponent() {
		this.initImagePlaceholder();

		this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);

		this.domRefPlayButton.setAttribute(
			'aria-label',
			`${this.videoPlay}: ${this.videoTitle}`
		);

		if (this.autoLoad) {
			this.initIntersectionObserver();
		}
	}

	/**
	 * Lifecycle method that we use to listen for attribute changes to period
	 *
	 * @param {string} name
	 * @param {unknown} oldVal
	 * @param {unknown} newVal
	 *
	 * @returns {void}
	 */
	attributeChangedCallback(name, oldVal, newVal) {
		switch (name) {
			case 'videoid':
				if (oldVal !== newVal) {
					this.setupComponent();
					// if we have a previous iframe, remove it and the activated class
					if (this.domRefFrame.classList.contains('lvo-activated')) {
						this.domRefFrame.classList.remove('lvo-activated');
						this.shadowRoot?.querySelector('iframe').remove();
					}
				}
				break;
			default:
				break;
		}
	}

	/**
	 * Setup the Intersection Observer to load the iframe when scrolled into view
	 *
	 * @returns {void}
	 */
	initIntersectionObserver() {
		if (
			'IntersectionObserver' in window &&
			'IntersectionObserverEntry' in window
		) {
			const options = {
				root: null,
				rootMargin: '0px',
				threshold: 0,
			};

			const observer = new IntersectionObserver((entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !this.iframeLoaded) {
						LiteVimeo.warmConnections();
						this.addIframe();
						observer.unobserve(this);
					}
				});
			}, options);

			observer.observe(this);
		}
	}

	/**
	 * Setup the placeholder image for the component
	 *
	 * @returns {Promise<any>|void}
	 */
	initImagePlaceholder = async () => {
		if (this.isUnlisted) {
			return;
		}

		// we don't know which image type to preload, so warm the connection
		LiteVimeo.preconnected
			? null
			: LiteVimeo.addPrefetch('preconnect', 'https://i.vimeocdn.com/');

		const apiUrl = `https://vimeo.com/api/v2/video/${this.videoId}.json`;
		const apiResponse = (await (await fetch(apiUrl)).json())[0];
		const tnLarge = apiResponse.thumbnail_large;
		const imgId = tnLarge
			.substr(tnLarge.lastIndexOf('/') + 1)
			.split('_')[0];

		const posterUrlWebp = `https://i.vimeocdn.com/video/${imgId}.webp?mw=1100&mh=619&q=70`;
		const posterUrlJpeg = `https://i.vimeocdn.com/video/${imgId}.jpg?mw=1100&mh=619&q=70`;
		this.domRefImg.webp.srcset = posterUrlWebp;
		this.domRefImg.jpeg.srcset = posterUrlJpeg;
		this.domRefImg.fallback.src = posterUrlJpeg;
		this.domRefImg.fallback.setAttribute(
			'aria-label',
			`${this.videoPlay}: ${this.videoTitle}`
		);
		this.domRefImg.fallback.setAttribute(
			'alt',
			`${this.videoPlay}: ${this.videoTitle}`
		);
	};

	/**
	 * Add a <link rel={preload | preconnect} ...> to the head
	 * @param {string} kind the kind of link to add
	 * @param {string} url the source URL
	 * @param {?string} as the "as" attribute
	 *
	 * @returns {void}
	 */
	static addPrefetch(kind, url, as = null) {
		const linkElem = document.createElement('link');
		linkElem.rel = kind;
		linkElem.href = url;
		if (as) {
			linkElem.as = as;
		}
		linkElem.crossOrigin = 'true';
		document.head.append(linkElem);
	}

	/**
	 * Begin preconnecting to warm up the iframe load Since the embed's network
	 * requests load within its iframe, preload/prefetch'ing them outside the
	 * iframe will only cause double-downloads. So, the best we can do is warm up
	 * a few connections to origins that are in the critical path.
	 *
	 * Maybe `<link rel=preload as=document>` would work, but it's unsupported:
	 * http://crbug.com/593267 But TBH, I don't think it'll happen soon with Site
	 * Isolation and split caches adding serious complexity.
	 *
	 * @returns {void}
	 */
	static warmConnections() {
		if (LiteVimeo.preconnected) return;
		const vimeoAssets = {
			preconnect: [
				'https://f.vimeocdn.com',
				'https://player.vimeo.com',
				'https://i.vimeocdn.com',
			],
		};
		Object.entries(vimeoAssets).forEach(([kind, urls]) => {
			urls.forEach((url) => LiteVimeo.addPrefetch(kind, url));
		});

		LiteVimeo.preconnected = true;
	}
}

customElements.define('lite-vimeo', LiteVimeo);
module.exports = LiteVimeo;
