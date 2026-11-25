export type ScreenName =
  | 'home' | 'videos' | 'detail' | 'player' | 'search' | 'results' | 'reader'
  | 'learn' | 'music' | 'favorites' | 'help' | 'routine' | 'calm' | 'timeup';

export interface Screen {
  name: ScreenName;
  itemId?: string;
  query?: string;
  category?: string;
  message?: string;
}

export interface Nav {
  current: Screen;
  go: (screen: Screen) => void;
  back: () => void;
  home: () => void;
  openParent: () => void;
}
