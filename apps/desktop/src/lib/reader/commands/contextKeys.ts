export const ReaderContextKey = {
    ActiveBookKey: 'reader.activeBookKey',
    ArrowKeyNavigationMode: 'reader.arrowKeyNavigationMode',
    BookOpen: 'reader.bookOpen',
    NotebookVisible: 'reader.notebookVisible',
    SettingsOpen: 'reader.settingsOpen',
    SidebarVisible: 'reader.sidebarVisible'
} as const;

export type ReaderContextKey = (typeof ReaderContextKey)[keyof typeof ReaderContextKey];
