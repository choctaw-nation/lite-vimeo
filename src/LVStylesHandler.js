import BaseElement from './BaseElement';

/**
 * Handles the styles for the lite-vimeo component
 *
 */
export default class LVStylesHandler extends BaseElement {
	constructor() {
		super();
	}

	/**
	 * Add CSS to ShadowDOM Element
	 *
	 * @returns {string} the CSS
	 */
	addStyles() {
		const styles = `<style>
        :host {
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio:16 / 9;
        }

        #frame, #fallbackPlaceholder, iframe, #custom-placeholder {
          position: absolute;
          height:100%;
          width:100%;
        }

        #frame {
          cursor: pointer;
        }
		
		#fallbackPlaceholder, #custom-placeholder {
			object-fit: cover;
			inset-inline-start: 0;
			inset-block-start: 0;
		}

	    #frame::before {
			content: '';
			display: block;
			position: absolute;
			top: 0;
			${
				this.hasCustomPlaceholder
					? ''
					: 'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);'
			}
			background-position: top;
			height: 60px;
			padding-bottom: 50px;
			width: 100%;
			transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
			z-index: 1;
	  	}
	
	  	/* play button */
	  	.lvo-playbtn {
			width: 70px;
			height: 46px;
			background-color: #212121;
			z-index: 1;
			opacity: 0.8;
			border-radius: 10%;
			transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
			border: 0;
	  	}
		
		#frame:hover .lvo-playbtn {
			background-color: rgb(98, 175, 237);
			opacity: 1;
			cursor: pointer;
		}
		
		/* play button triangle */
		.lvo-playbtn::before {
			content: '';
			border-style: solid;
			border-width: 11px 0 11px 19px;
			border-color: transparent transparent transparent #fff;
		}

		.lvo-playbtn,
		.lvo-playbtn::before {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate3d(-50%, -50%, 0);
		}

		/* Post-click styles */
		.lvo-activated {
			cursor: unset;
		}

		#frame.lvo-activated::before,
		.lvo-activated .lvo-playbtn,
		.lvo-activated picture {
			display: none;
		}
    	</style>`;
		return styles;
	}

	/**
	 * Adds the video placeholder image to the shadowDOM player
	 * Conditionally renders the play button if a custom placeholder is provided
	 *
	 * @returns {string} the HTML
	 */
	addPictureElement() {
		const picture = `
		<div id="frame">
		<picture>
        	${
				this.hasCustomPlaceholder
					? `<img id="custom-placeholder"
				src="${this.customPlaceholder}"
				decoding="async"
				loading="lazy" />`
					: `
				<source id="webpPlaceholder" type="image/webp">
				<source id="jpegPlaceholder" type="image/jpeg">
				<img id="fallbackPlaceholder"
					referrerpolicy="origin"
					width="1100"
					height="619"
					decoding="async"
					loading="lazy"
				/>
	  			`
			}
		</picture>
		<button class="lvo-playbtn"></button>
      	</div>`;
		return picture;
	}
}
