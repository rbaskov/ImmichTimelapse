export type Language = 'en' | 'ru';

export const translations = {
  en: {
    // Header
    'header.title': 'Immich Timelapse',
    'header.connected': 'Connected',
    'header.disconnected': 'Disconnected',
    'header.language': 'Language',
    
    // Connection Panel
    'connection.title': 'Server Connection',
    'connection.serverUrl': 'Server URL',
    'connection.apiKey': 'API Key',
    'connection.connect': 'Connect',
    'connection.disconnect': 'Disconnect',
    'connection.connectionFailed': 'Connection failed',
    'connection.pleaseEnter': 'Please enter both URL and API key',
    'connection.saveProfile': 'Save Profile',
    'connection.profileName': 'Profile Name',
    'connection.savedProfiles': 'Saved Profiles',
    'connection.noProfiles': 'No profiles saved',
    
    // Filter Panel
    'filter.title': 'Filter Photos',
    'filter.dateFrom': 'From',
    'filter.dateTo': 'To',
    'filter.album': 'Album',
    'filter.filename': 'Filename (wildcard: *)',
    'filter.allAlbums': 'All Albums',
    'filter.apply': 'Apply Filters',
    'filter.photosFound': 'photos found',
    
    // Timelapse Settings
    'settings.title': 'Timelapse Settings',
    'settings.fps': 'FPS',
    'settings.resolution': 'Resolution',
    'settings.format': 'Format',
    'settings.selectedPhotos': 'photos selected',
    'settings.selectPhotos': 'Select photos to generate',
    
    // Photo Grid
    'grid.title': 'Selected Photos',
    'grid.selectAll': 'Select All',
    'grid.deselectAll': 'Deselect All',
    'grid.generate': 'Generate Timelapse',
    'grid.noPhotos': 'No photos loaded',
    'grid.loadPhotos': 'Load photos using filters',
    
    // Processing Progress
    'progress.preparing': 'Preparing...',
    'progress.downloading': 'Downloading Photos',
    'progress.creating': 'Creating Timelapse',
    'progress.ready': 'Timelapse Ready',
    'progress.error': 'Error',
    'progress.frames': 'frames',
    'progress.remaining': 'remaining',
    'progress.createdSuccess': 'Timelapse created',
    'progress.readyPreview': 'Your timelapse is ready to preview and download',
    'progress.errorCreating': 'Failed to create timelapse',
    'progress.cancelled': 'Processing cancelled',
    'progress.generatingMsg': 'Processing photos...',
    
    // Video Preview
    'preview.title': 'Preview',
    'preview.noPreview': 'No preview available',
    'preview.generate': 'Generate a timelapse to see the preview',
    'preview.unavailable': 'Preview unavailable',
    'preview.couldNotLoad': 'Could not load the timelapse preview',
    'preview.download': 'Download',
    'preview.regenerate': 'Regenerate',
    'preview.downloadStarted': 'Download started',
    'preview.downloading': 'Downloading',
    
    // Toasts
    'toast.selectPhotos': 'No photos selected',
    'toast.selectPhotosDesc': 'Please select photos to create a timelapse',
    'toast.loadingPhotos': 'Photos loaded',
    'toast.loadingFailed': 'Failed to load photos',
    'toast.couldNotFetch': 'Could not fetch photos from Immich',
    'toast.error': 'Error',
  },
  ru: {
    // Header
    'header.title': 'Immich Таймлапс',
    'header.connected': 'Подключено',
    'header.disconnected': 'Отключено',
    'header.language': 'Язык',
    
    // Connection Panel
    'connection.title': 'Подключение к серверу',
    'connection.serverUrl': 'URL сервера',
    'connection.apiKey': 'API ключ',
    'connection.connect': 'Подключиться',
    'connection.disconnect': 'Отключиться',
    'connection.connectionFailed': 'Ошибка подключения',
    'connection.pleaseEnter': 'Введите URL и API ключ',
    'connection.saveProfile': 'Сохранить профиль',
    'connection.profileName': 'Имя профиля',
    'connection.savedProfiles': 'Сохраненные профили',
    'connection.noProfiles': 'Нет сохраненных профилей',
    
    // Filter Panel
    'filter.title': 'Фильтр фото',
    'filter.dateFrom': 'С',
    'filter.dateTo': 'По',
    'filter.album': 'Альбом',
    'filter.filename': 'Имя файла (подстановка: *)',
    'filter.allAlbums': 'Все альбомы',
    'filter.apply': 'Применить фильтры',
    'filter.photosFound': 'фото найдено',
    
    // Timelapse Settings
    'settings.title': 'Параметры таймлапса',
    'settings.fps': 'FPS',
    'settings.resolution': 'Разрешение',
    'settings.format': 'Формат',
    'settings.selectedPhotos': 'фото выбрано',
    'settings.selectPhotos': 'Выберите фото для создания',
    
    // Photo Grid
    'grid.title': 'Выбранные фото',
    'grid.selectAll': 'Выбрать все',
    'grid.deselectAll': 'Снять выделение',
    'grid.generate': 'Создать таймлапс',
    'grid.noPhotos': 'Фото не загружены',
    'grid.loadPhotos': 'Загрузите фото используя фильтры',
    
    // Processing Progress
    'progress.preparing': 'Подготовка...',
    'progress.downloading': 'Загрузка фото',
    'progress.creating': 'Создание таймлапса',
    'progress.ready': 'Таймлапс готов',
    'progress.error': 'Ошибка',
    'progress.frames': 'кадры',
    'progress.remaining': 'осталось',
    'progress.createdSuccess': 'Таймлапс создан',
    'progress.readyPreview': 'Ваш таймлапс готов к просмотру и скачиванию',
    'progress.errorCreating': 'Ошибка при создании таймлапса',
    'progress.cancelled': 'Обработка отменена',
    'progress.generatingMsg': 'Обработка фото...',
    
    // Video Preview
    'preview.title': 'Просмотр',
    'preview.noPreview': 'Превью недоступно',
    'preview.generate': 'Создайте таймлапс для просмотра',
    'preview.unavailable': 'Превью недоступно',
    'preview.couldNotLoad': 'Не удалось загрузить превью',
    'preview.download': 'Скачать',
    'preview.regenerate': 'Создать заново',
    'preview.downloadStarted': 'Скачивание начато',
    'preview.downloading': 'Скачивание',
    
    // Toasts
    'toast.selectPhotos': 'Фото не выбрано',
    'toast.selectPhotosDesc': 'Выберите фото для создания таймлапса',
    'toast.loadingPhotos': 'Фото загружены',
    'toast.loadingFailed': 'Ошибка загрузки',
    'toast.couldNotFetch': 'Не удалось получить фото с сервера',
    'toast.error': 'Ошибка',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}
