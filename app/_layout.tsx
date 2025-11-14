import { Stack } from "expo-router";
import "../global.css";
import { CameraProvider } from "../providers/CameraProvider";

export default function RootLayout() {
  return (
    <CameraProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CameraProvider>
  );
}
