export function updateHue(_hue: string | number) {
	document.documentElement.style.setProperty('--data_theme_4colors_hue', _hue.toString());
}
