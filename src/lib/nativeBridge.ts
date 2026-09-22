import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';
import { Network } from '@capacitor/network';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initNativeFeatures = async (handlers: {
  onBackButton: () => boolean; // return true if handled, false to exit
  onNetworkChange?: (connected: boolean) => void;
}) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Status Bar Setup
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#09090b' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.debug('StatusBar setup note:', err);
  }

  try {
    // 2. Hide Splash Screen after React load
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    console.debug('SplashScreen note:', err);
  }

  try {
    // 3. Android Hardware Back Button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const handled = handlers.onBackButton();
      if (!handled) {
        // Exit app if on root
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.debug('BackButton note:', err);
  }

  try {
    // 4. Network Status Monitoring
    Network.addListener('networkStatusChange', (status) => {
      if (handlers.onNetworkChange) {
        handlers.onNetworkChange(status.connected);
      }
    });
  } catch (err) {
    console.debug('Network note:', err);
  }
};

export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };
    await Haptics.impact({ style: styleMap[type] });
  } catch {
    // silently ignore if not supported
  }
};
