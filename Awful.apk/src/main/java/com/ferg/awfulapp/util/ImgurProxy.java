package com.ferg.awfulapp.util;

import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.regex.Pattern;

/**
 * Rewrites Imgur image URLs so they load through a public image proxy.
 * <p>
 * Imgur refuses requests from UK IP addresses, so images hosted there fail to load for
 * affected users. Routing the request through DuckDuckGo's content proxy fetches the
 * image from outside the block.
 * <p>
 * This should only be applied to URLs we are about to <i>fetch an image from</i> - not to
 * URLs being copied, shared, or handed to another app, where the user wants the original.
 * <p>
 * Duplicates logic from imgurproxy.js. Make changes in both locations!
 */
public final class ImgurProxy {

    private static final String PROXY_PREFIX = "https://external-content.duckduckgo.com/iu/?u=";

    private static final Pattern IMGUR_URL =
            Pattern.compile("^https?://([\\w-]+\\.)?imgur\\.com/", Pattern.CASE_INSENSITIVE);

    private static final Pattern IMAGE_EXTENSION =
            Pattern.compile("\\.(jpe?g|png|gifv?|webp|bmp)$", Pattern.CASE_INSENSITIVE);

    private ImgurProxy() {
        // No instances
    }

    /**
     * Returns true if this is an Imgur URL that hasn't already been rewritten.
     *
     * @param url the URL to check, may be null
     */
    public static boolean needsProxy(@Nullable String url) {
        return url != null && IMGUR_URL.matcher(url).find();
    }

    /**
     * Returns a proxied URL for an Imgur image, or the original URL unchanged if it
     * isn't an Imgur URL.
     *
     * @param url the URL to rewrite
     */
    @NonNull
    public static String proxyUrl(@NonNull String url) {
        if (!needsProxy(url)) {
            return url;
        }
        String target = url;
        // The proxy only handles direct image URLs, and Imgur will serve an image for a
        // bare ID as long as we give it a file extension
        if (!IMAGE_EXTENSION.matcher(target).find()) {
            target = target + ".png";
        }
        return PROXY_PREFIX + Uri.encode(target);
    }
}