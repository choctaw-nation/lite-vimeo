/**
 * Handles the properties for the lite-vimeo component
 */
export default class BaseElement extends HTMLElement {
	/**
	 * The Shadow DOM Root
	 *
	 * @type {ShadowRoot}
	 */
	shadowRoot;

	/**
	 * Whether the iframe has been loaded
	 * @type {boolean}
	 */
	iframeLoaded = false;

	/**
	 * The `div#frame` of the shadowDOM that the iframe will be inserted into
	 *
	 * @type {HTMLDivElement}
	 */
	domRefFrame;

	/**
	 * The `img` elements of the shadowDOM that will be used as placeholders
	 * @type {{fallback: HTMLImageElement, webp: HTMLSourceElement, jpeg: HTMLSourceElement}}
	 */
	domRefImg;

	/**
	 * The play button element
	 * @type {HTMLButtonElement}
	 */
	domRefPlayButton;

	/**
	 * The private hash for unlisted videos
	 *
	 * @type {string|undefined}
	 */
	hash = undefined;

	/**
	 * Whether the Vimeo assets have been preconnected
	 *
	 * @type {boolean}
	 */
	static preconnected = false;

	constructor() {
		super();
	}

	static get observedAttributes() {
		return ['videoid'];
	}

	get isUnlisted() {
		return this.hasAttribute('unlisted');
	}

	get enableTracking() {
		return this.hasAttribute('enabletracking');
	}

	get hasCustomPlaceholder() {
		return this.hasAttribute('customplaceholder');
	}

	get customPlaceholder() {
		return this.getAttribute('customplaceholder') || '';
	}

	get videoId() {
		const videoId = this.getAttribute('videoid');
		if (!videoId) {
			return '';
		}
		if (this.isUnlisted) {
			const [vimeoId, privateHash] = videoId.split('/');
			this.hash = privateHash;
			return vimeoId;
		}
		return videoId;
	}

	get loop() {
		return this.hasAttribute('loop');
	}

	/**
	 * Set the video ID
	 * @param {string} id
	 */
	set videoId(id) {
		this.setAttribute('videoid', id);
	}

	get videoPlay() {
		return this.getAttribute('videoplay') || 'Play';
	}

	/**
	 * Alters the "Play" button text
	 * @param {string} name
	 */
	set videoPlay(name) {
		this.setAttribute('videoplay', name);
	}

	/**
	 * Get the title of the video
	 * @returns {string} the video title or "Video"
	 */
	get videoTitle() {
		return this.getAttribute('videotitle') || 'Video';
	}

	/**
	 * Set the title of the video
	 *
	 * @param {string} title the title of the video
	 */
	set videoTitle(title) {
		this.setAttribute('videotitle', title);
	}

	/**
	 * Get the start time of the video
	 * @returns {string} the start time or "0s"
	 */
	get videoStartAt() {
		return this.getAttribute('start');
	}

	/**
	 * Set the start time of the video
	 * @param {string} time the start time of the video
	 */
	set videoStartAt(time) {
		this.setAttribute('start', time);
	}

	/**
	 * Get the autoLoad property
	 * @returns {boolean} the autoLoad property
	 */
	get autoLoad() {
		return this.hasAttribute('autoload');
	}

	/**
	 * Alters the autoLoad property
	 *
	 * @param {boolean} value
	 */
	set autoLoad(value) {
		if (value) {
			this.setAttribute('autoload', '');
		} else {
			this.removeAttribute('autoload');
		}
	}

	/**
	 * Get the autoPlay property
	 *
	 * @returns {boolean} the autoPlay property
	 */
	get autoPlay() {
		return this.hasAttribute('autoplay');
	}

	/**
	 * Alters the autoPlay property
	 *
	 * @param {boolean} value
	 */
	set autoPlay(value) {
		if (value) {
			this.setAttribute('autoplay', 'autoplay');
		} else {
			this.removeAttribute('autoplay');
		}
	}
}
