// todo;
// const hueSlider = document.getElementById('hue-slider');
// const hueValueInput = document.getElementById('hue-value');

export function updateHue(_hue: string | number) {
	// hueSlider.value = hue;
	// hueValueInput.value = hue;
	// MAIN;
	document.documentElement.style.setProperty('--hue', _hue.toString());
	// const hue: number = Number(_hue);
	// let ahue = hue + 60;
	// let a2hue = hue + 300;
	// if (hue > 300) {
	// 	ahue = hue + 60 - 360;
	// }
	// if (hue > 60) {
	// 	a2hue = hue + 300 - 360;
	// }
	// 	const css = `:root {
	//         --color-primary: hsl(${hue}, 50%, 90%);
	//         --color-secondary: hsl(${hue}, 50%, 10%);
	//         --color-tertiary: hsl(${ahue}, 80%, 20%);
	//         --color-accent: hsl(${a2hue}, 80%, 20%);
	//     }
	// .dark {
	//         --color-primary: hsl(${hue}, 50%, 10%);
	//         --color-secondary: hsl(${hue}, 50%, 90%);
	//         --color-tertiary: hsl(${ahue}, 80%, 80%);
	//         --color-accent: hsl(${a2hue}, 80%, 80%);
	//     }`;
}
// hueSlider.addEventListener('input', function () {
//     updateHue(hueSlider.value);
// });
// hueValueInput.addEventListener('input', function () {
//     const hue = hueValueInput.value;
//     if (hue >= 0 && hue <= 360) {
//         updateHue(hue);
//     }
// });
// function dark() {
// 	document.body.classList.toggle('dark');
// }
