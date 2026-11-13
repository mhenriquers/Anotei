import * as Haptics from "expo-haptics";

//---------------------- vibração curta ao salvar (Android) ----------------------
// Na web o Metro usa feedback.web.ts, que não faz nada.
export const vibrar = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {}, // aparelho sem vibração: ignora
  );
};
