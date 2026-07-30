'use strict';

/**
 * Rewrites Imgur image URLs so they load through a public image proxy.
 *
 * Imgur refuses requests from UK IP addresses, so images hosted there
 * render as broken for affected users. Routing the request through
 * DuckDuckGo's content proxy fetches the image from outside the block.
 */

var IMGUR_PROXY_PREFIX = 'https://external-content.duckduckgo.com/iu/?u=';
var IMGUR_URL_PATTERN = /^https?:\/\/([\w-]+\.)?imgur\.com\//i;

/**
 * Returns true if this is an Imgur URL that hasn't already been rewritten.
 */
function needsImgurProxy(url) {
	return !!url && IMGUR_URL_PATTERN.test(url);
}

/**
 * Builds a proxied URL for an Imgur image.
 */
function proxyImgurUrl(url) {
	// The proxy only handles direct image URLs, and Imgur will serve an
	// image for a bare ID as long as we give it a file extension
	if (!/\.(jpe?g|png|gifv?|webp|bmp)$/i.test(url)) {
		url = url + '.png';
	}
	return IMGUR_PROXY_PREFIX + encodeURIComponent(url);
}

/**
 * Rewrites a single image element, if it needs it.
 */
function proxyImgurImage(image) {
	var source = image.getAttribute('src');
	if (needsImgurProxy(source)) {
		image.setAttribute('src', proxyImgurUrl(source));
	}
}

/**
 * Rewrites every Imgur image inside the given element.
 */
function proxyImgurImages(root) {
	if (!root.querySelectorAll) {
		return;
	}
	Array.prototype.forEach.call(root.querySelectorAll('img'), proxyImgurImage);
}

/**
 * Rewrites Imgur images already on the page, and any added later.
 */
function imgurProxyInit() {
	proxyImgurImages(document);

	if (typeof MutationObserver === 'undefined') {
		return;
	}
	var observer = new MutationObserver(function onMutations(mutations) {
		mutations.forEach(function eachMutation(mutation) {
			Array.prototype.forEach.call(mutation.addedNodes, function eachNode(node) {
				if (node.nodeType !== 1) {
					return;
				}
				if (node.tagName === 'IMG') {
					proxyImgurImage(node);
				} else {
					proxyImgurImages(node);
				}
			});
		});
	});
	observer.observe(document.documentElement, {childList: true, subtree: true});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', imgurProxyInit);
} else {
	imgurProxyInit();
}