import {router, SplashScreen, Stack, usePathname} from "expo-router";
import {useEffect} from "react";
import {Pressable} from "react-native";
import { Feather } from '@react-native-vector-icons/feather';
import {useFonts} from "expo-font";

import {THEME} from "@/app/constants";
import {SettingsProvider} from "@/context/settings";

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const pathname = usePathname();
  const [loaded, error] = useFonts({
    'Abordage': require('../../assets/fonts/Abordage-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const headerBtn = () => {
    if (pathname != "/settings") {
      return <Pressable onPress={() => router.push('/settings')}><Feather name="settings" size={20}></Feather></Pressable>
    }
    return <Pressable onPress={() => router.push('/')}><Feather name="arrow-left" size={20}></Feather></Pressable>
  }

  return (
      <SettingsProvider>
        <Stack screenOptions={
      {
        title: pathname != "/settings" ? "localconvert" : "settings",
        headerStyle: {backgroundColor: THEME.primary},
        headerTitleStyle: {fontWeight: "700"},
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerLeft: () => headerBtn()
      }}/>
      </SettingsProvider>
  )
}
