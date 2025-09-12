export interface ReaderSettings {
	fontFamily: string;
	viewerWidth: number;
	fontSize: number;
	lineHeight: number;
	firstLineIndent: boolean;
	zoomLongPic: boolean;
	scrollBarVisable: boolean;
}

export const DefaultReaderSettings: ReaderSettings = {
	fontFamily: '',
	viewerWidth: 60,
	fontSize: 20,
	lineHeight: 180,
	firstLineIndent: false,
	zoomLongPic: false,
	scrollBarVisable: false
};
