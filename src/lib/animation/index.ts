import { elasticOut } from 'svelte/easing';
// /**
//  * 自定义入场动画：从左边低右边高的倾斜状态过渡到正常状态
//  * 效果像是右手拿着平板抬起来的样子
//  */
// export function _tiltUp(node: HTMLElement) {
// 	return {
// 		duration: 800,
// 		easing: elasticOut,
// 		css: (t: number) => {
// 			// 初始状态：左边低右边高，有一个倾斜角度
// 			// t从0到1，0是初始状态，1是最终状态
// 			const rotate = (1 - t) * -8; // 从-8度旋转到0度
// 			const translateY = (1 - t) * 20; // 从向下偏移20px到0
// 			const scale = 0.95 + t * 0.05; // 从0.95缩放到1
// 			const opacity = t; // 从0透明度到1

// 			return `
// 					transform: rotate(${rotate}deg) translateY(${translateY}px) scale(${scale});
// 					opacity: ${opacity};
// 					transform-origin: center bottom;
// 				`;
// 		}
// 	};
// }

/**
 * 使用CSS样式实现窗口级别的倾斜入场动画
 * 通过设置body的样式来避免滚动条问题
 */
export function startWindowTiltUpAnimation() {
	// 为body添加动画样式，防止溢出
	const style = document.createElement('style');
	style.textContent = `
		body {
			overflow: hidden !important;
		}
		.window-tilt-animation {
			animation: tiltUpAnimation 800ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
			transform-origin: center bottom;
		}
	`;
	document.head.appendChild(style);

	// 为body添加动画类
	document.body.classList.add('window-tilt-animation');

	// 动画结束后清理
	setTimeout(() => {
		document.body.classList.remove('window-tilt-animation');
		document.body.style.overflow = '';
		document.head.removeChild(style);
	}, 800);
}

/**
 * 改进的HTML元素倾斜动画
 * 使用更小的变换值避免滚动条问题
 */
export function tiltUp(node: HTMLElement) {
	return {
		duration: 800,
		easing: elasticOut,
		css: (t: number) => {
			// 使用更小的变换值，避免内容溢出
			const rotate = (1 - t) * -5; // 从-5度旋转到0度（减小角度）
			const translateY = (1 - t) * 10; // 从向下偏移10px到0（减小偏移）
			const scale = 0.98 + t * 0.02; // 从0.98缩放到1（减小缩放差异）
			const opacity = t;

			return `
				transform: rotate(${rotate}deg) translateY(${translateY}px) scale(${scale});
				opacity: ${opacity};
				transform-origin: center bottom;
				overflow: hidden;
			`;
		}
	};
}
