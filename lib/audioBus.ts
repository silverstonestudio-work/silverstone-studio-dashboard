/**
 * Singleton handle to the one <audio> element in the app. The AudioEngine
 * component registers the element here so store actions can drive playback
 * imperatively without prop-drilling a ref through the tree.
 */
export const audioBus: { el: HTMLAudioElement | null } = { el: null };
