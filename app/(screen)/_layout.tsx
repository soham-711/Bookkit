import { Stack } from "expo-router";
import { UploadProvider } from "../../Context/UploadContext";

export default function Layout() {
  return (
    <UploadProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UploadProvider>
  );
}
